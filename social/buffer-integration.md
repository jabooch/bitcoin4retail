# Bitcoin4Retail Buffer Integration

This integration is the persistent publishing rail for the Bitcoin4Retail daily social workflow.

## Architecture

1. ChatGPT creates the daily coordinated content package.
2. Originals and working media are stored in Google Drive under `Bitcoin4Retail/Social`.
3. Final publishable media is mirrored to a public direct HTTPS URL.
4. The automation calls the protected Bitcoin4Retail Vercel Buffer endpoint.
5. The endpoint resolves the connected Buffer channel and creates/schedules the post.
6. Post IDs/statuses are written back to the daily manifest and the Drive archive.

## Important media rule

Buffer does not accept file uploads through its API. Media must already be available at a public, direct, stable HTTPS URL. A normal Google Drive share link is not sufficient because it can require authentication or show a preview page.

For now, mirror final media to the Bitcoin4Retail site/repository under a dated public path such as:

`https://bitcoin4retail.com/media/social/2026-09-23/launch.mp4`

Keep the Drive copy as the persistent source-of-truth.

## Environment variables

Configure these in the Vercel project for Production and Preview:

- `BUFFER_API_KEY` — generated in Buffer Settings → API.
- `B4R_AUTOMATION_SECRET` — a long random secret used only to authorize calls to the Vercel integration.

Never commit either value to GitHub.

## Endpoints

### GET /api/buffer/health

Tests whether the Vercel integration has its secrets and can reach Buffer.

Header:

`Authorization: Bearer <B4R_AUTOMATION_SECRET>`

### GET /api/buffer/channels

Returns Buffer organizations and connected channels. Use this after Instagram, TikTok, YouTube, and X have been connected in Buffer.

Header:

`Authorization: Bearer <B4R_AUTOMATION_SECRET>`

### POST /api/buffer/publish

Accepts a coordinated multi-platform package.

Header:

`Authorization: Bearer <B4R_AUTOMATION_SECRET>`

Body example: see `social/buffer-publish-example.json`.

Set `dryRun: true` first. The dry run resolves channels and validates media URLs without creating Buffer posts.

## Service names

Use:
- `instagram`
- `tiktok`
- `youtube`
- `x` or `twitter`

If more than one Buffer channel exists for a service, include `channelName` or `channelId`.

## Publishing modes

Buffer-supported values used by the integration:
- `addToQueue` — add to Buffer's queue
- `shareNow` — publish immediately
- `shareNext` — next available slot
- `customScheduled` — use with `dueAt`

The daily workflow should normally use `shareNow` only after QA has passed.

## Platform defaults

Instagram:
- video → Reel
- image → Post
- share to feed = true
- AI-generated disclosure is enabled for AI-generated media

TikTok:
- AI-generated disclosure is enabled for AI-generated video

YouTube:
- title is required
- category defaults to Education (27)
- privacy defaults to public
- madeForKids defaults to false

X:
- standard text/media post

## Go-live checklist

1. Connect all four Bitcoin4Retail channels in Buffer.
2. Generate the Buffer API key.
3. Add both Vercel environment variables.
4. Promote the integration deployment to production if needed.
5. Call `/api/buffer/health`.
6. Call `/api/buffer/channels` and verify the four expected accounts.
7. Run `/api/buffer/publish` with `dryRun: true`.
8. Create four Buffer drafts using `saveToDraft: true`.
9. Verify them in Buffer.
10. Enable daily automated publishing.
