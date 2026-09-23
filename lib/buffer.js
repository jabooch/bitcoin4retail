const BUFFER_ENDPOINT = "https://api.buffer.com";

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function bufferGraphQL(query, variables = {}) {
  const response = await fetch(BUFFER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env("BUFFER_API_KEY")}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Buffer HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }
  if (payload.errors?.length) {
    throw new Error(`Buffer GraphQL error: ${payload.errors.map(e => e.message).join("; ")}`);
  }
  return payload.data;
}

async function getOrganizations() {
  const data = await bufferGraphQL(`
    query GetOrganizations {
      account {
        organizations {
          id
          name
        }
      }
    }
  `);
  return data?.account?.organizations || [];
}

async function getChannels(organizationId) {
  const data = await bufferGraphQL(`
    query GetChannels($organizationId: OrganizationId!) {
      channels(input: { organizationId: $organizationId }) {
        id
        name
        service
        avatar
        isQueuePaused
      }
    }
  `, { organizationId });
  return data?.channels || [];
}

function normalizeService(service = "") {
  const value = service.toLowerCase().trim();
  if (["x", "twitter", "x/twitter"].includes(value)) return "twitter";
  if (["instagram", "ig"].includes(value)) return "instagram";
  if (["tiktok", "tik tok"].includes(value)) return "tiktok";
  if (["youtube", "youtube shorts", "shorts"].includes(value)) return "youtube";
  return value;
}

function assertPublicMediaUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid media URL: ${url}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Buffer media URLs must use HTTPS.");
  }
  const host = parsed.hostname.toLowerCase();
  const blocked = ["drive.google.com", "docs.google.com"];
  if (blocked.includes(host)) {
    throw new Error(
      "Google Drive links cannot be sent directly to Buffer. Mirror the media to a public direct URL first."
    );
  }
}

function buildAssets(post) {
  if (!post.media?.length) return [];
  return post.media.map((asset) => {
    assertPublicMediaUrl(asset.url);
    if (asset.type === "image") {
      const image = { url: asset.url };
      if (asset.altText) image.metadata = { altText: asset.altText };
      return { image };
    }
    if (asset.type === "video") {
      const video = { url: asset.url };
      const metadata = {};
      if (Number.isInteger(asset.thumbnailOffset)) metadata.thumbnailOffset = asset.thumbnailOffset;
      if (asset.title) metadata.title = asset.title;
      if (Object.keys(metadata).length) video.metadata = metadata;
      return { video };
    }
    throw new Error(`Unsupported media type: ${asset.type}`);
  });
}

function buildMetadata(post, service) {
  const ai = post.aiGenerated !== false;

  if (service === "instagram") {
    const hasVideo = post.media?.some(a => a.type === "video");
    return {
      instagram: {
        type: post.instagramType || (hasVideo ? "reel" : "post"),
        shouldShareToFeed: post.shouldShareToFeed !== false,
        isAiGenerated: ai,
        ...(post.firstComment ? { firstComment: post.firstComment } : {}),
      },
    };
  }

  if (service === "tiktok") {
    return {
      tiktok: {
        isAiGenerated: ai,
        ...(post.tiktokTitle ? { title: post.tiktokTitle } : {}),
      },
    };
  }

  if (service === "youtube") {
    const title = post.youtubeTitle || post.title;
    if (!title) throw new Error("YouTube posts require youtubeTitle or title.");
    return {
      youtube: {
        title,
        categoryId: post.youtubeCategoryId || "27",
        privacy: post.youtubePrivacy || "public",
        madeForKids: post.madeForKids === true,
        notifySubscribers: post.notifySubscribers !== false,
        embeddable: post.embeddable !== false,
        isAiGenerated: ai,
      },
    };
  }

  return post.metadata || undefined;
}

function buildCreateInput(post, channelId, service) {
  const input = {
    text: post.text || "",
    channelId,
    schedulingType: post.schedulingType || "automatic",
    mode: post.mode || (post.dueAt ? "customScheduled" : "addToQueue"),
    assets: buildAssets(post),
    aiAssisted: post.aiAssisted !== false,
  };

  const metadata = buildMetadata(post, service);
  if (metadata) input.metadata = metadata;
  if (post.dueAt) input.dueAt = post.dueAt;
  if (post.saveToDraft === true) input.saveToDraft = true;
  if (post.needsApproval === true) input.needsApproval = true;
  if (post.source) input.source = post.source;

  return input;
}

async function createPost(input) {
  const data = await bufferGraphQL(`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess {
          post {
            id
            text
            status
            dueAt
            assets {
              id
              mimeType
            }
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `, { input });

  const result = data?.createPost;
  if (!result) throw new Error("Buffer returned no createPost payload.");
  if (result.__typename === "MutationError") {
    throw new Error(result.message || "Buffer rejected the post.");
  }
  return result.post;
}

function matchesName(channel, wanted) {
  if (!wanted) return true;
  return (channel.name || "").toLowerCase().includes(wanted.toLowerCase());
}

async function resolveChannel(post, channels) {
  if (post.channelId) {
    const channel = channels.find(c => c.id === post.channelId);
    if (!channel) throw new Error(`Unknown Buffer channelId: ${post.channelId}`);
    return channel;
  }

  const service = normalizeService(post.service);
  if (!service) throw new Error("Each post needs channelId or service.");

  const candidates = channels.filter(c => normalizeService(c.service) === service);
  const matching = candidates.filter(c => matchesName(c, post.channelName));

  if (matching.length === 1) return matching[0];
  if (!matching.length) {
    throw new Error(`No Buffer channel found for service=${service} name=${post.channelName || "*"}`);
  }
  throw new Error(
    `Multiple Buffer channels match service=${service}. Pass channelName or channelId explicitly.`
  );
}

module.exports = {
  bufferGraphQL,
  getOrganizations,
  getChannels,
  normalizeService,
  resolveChannel,
  buildCreateInput,
  createPost,
};
