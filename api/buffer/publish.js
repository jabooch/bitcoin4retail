const {
  getOrganizations,
  getChannels,
  normalizeService,
  resolveChannel,
  buildCreateInput,
  createPost,
} = require("../../lib/buffer");

function authorized(req) {
  const expected = process.env.B4R_AUTOMATION_SECRET;
  if (!expected) return false;
  return req.headers.authorization === `Bearer ${expected}`;
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

module.exports = async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = parseBody(req);
    const posts = Array.isArray(body.posts) ? body.posts : [];
    if (!posts.length) return res.status(400).json({ error: "posts[] is required" });
    if (posts.length > 12) return res.status(400).json({ error: "Maximum 12 posts per request" });

    const organizations = await getOrganizations();
    if (!organizations.length) throw new Error("No Buffer organizations found.");

    const organizationId = body.organizationId || organizations[0].id;
    const channels = await getChannels(organizationId);

    const prepared = [];
    for (const post of posts) {
      const channel = await resolveChannel(post, channels);
      const service = normalizeService(channel.service);
      const input = buildCreateInput(post, channel.id, service);
      prepared.push({
        service,
        channel: { id: channel.id, name: channel.name, service: channel.service },
        input,
      });
    }

    if (body.dryRun === true) {
      return res.status(200).json({ ok: true, dryRun: true, organizationId, prepared });
    }

    const results = [];
    for (const item of prepared) {
      try {
        const created = await createPost(item.input);
        results.push({
          ok: true,
          service: item.service,
          channel: item.channel,
          post: created,
        });
      } catch (error) {
        results.push({
          ok: false,
          service: item.service,
          channel: item.channel,
          error: error.message,
        });
      }
    }

    const failed = results.filter(r => !r.ok);
    return res.status(failed.length ? 207 : 200).json({
      ok: failed.length === 0,
      organizationId,
      results,
    });
  } catch (error) {
    console.error("buffer publish error", error);
    return res.status(500).json({ error: error.message });
  }
};
