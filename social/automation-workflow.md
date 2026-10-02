# Bitcoin4Retail Daily Social Automation

## Objective
Generate, store, publish, and measure one coordinated daily content package across:
- Instagram @bitcoin4retail
- TikTok @bitcoin4retail
- YouTube Bitcoin4Retail
- X @bitcoin4retail

Primary site: https://bitcoin4retail.com

## Source of truth
Google Drive folder: `Bitcoin4Retail/Social/`

Recommended structure:
```
Bitcoin4Retail/
  Social/
    00_Brand/
    01_Inbox_Raw_Merchant_Media/
    02_Daily_Content_Queue/
      YYYY-MM-DD/
        master/
        instagram/
        tiktok/
        youtube/
        x/
        manifest.json
    03_Published/
      YYYY-MM-DD/
    04_Performance/
    05_Evergreen_Library/
```

## Daily workflow

### 1. Topic selection
Choose one daily angle based on:
1. Current retail/Bitcoin/payment relevance
2. Existing site content
3. Merchant footage or photos in Drive
4. Prior post performance
5. Conversion intent

Preferred themes:
- payment economics
- checkout workflow
- merchant demos
- hardware
- settlement
- fees
- merchant objections
- real-world Bitcoin payment clips

### 2. Content generation
Create one master content concept and adapt it into:
- Instagram: 1080x1350 feed or 1080x1920 Reel
- TikTok: 1080x1920 vertical video
- YouTube Shorts: 1080x1920 vertical video
- X: concise text post, optional 1200x675 image

Every package contains:
- final media
- caption/copy per platform
- title for YouTube
- hashtags where useful
- destination URL
- disclosure text when affiliate links are used
- source links for factual claims

### 2A. Required link attribution
Every social-to-site destination URL must use UTM parameters.

Required pattern:
```
https://bitcoin4retail.com/PAGE
  ?utm_source=PLATFORM
  &utm_medium=social
  &utm_campaign=daily_YYYY-MM-DD
  &utm_content=TOPIC_SLUG
```

Platform values:
- Instagram: `utm_source=instagram`
- TikTok: `utm_source=tiktok`
- YouTube: `utm_source=youtube`
- X: `utm_source=x`

Rules:
- `utm_medium=social`
- `utm_campaign=daily_YYYY-MM-DD`
- `utm_content` is a short lowercase hyphenated topic slug
- preserve the same destination page across platforms when testing channel performance
- never remove UTM parameters from post copy where a clickable URL is supported
- record the exact tagged destination URL in the daily manifest

Example:
```
https://bitcoin4retail.com/square-bitcoin-fees.html?utm_source=instagram&utm_medium=social&utm_campaign=daily_2026-10-02&utm_content=square-fee-math
```

### 3. QA gate
Before publishing verify:
- no unsupported factual claims
- provider pricing/product facts are current
- brand consistency
- captions fit platform limits
- links resolve
- every social destination has the correct platform-specific UTM tags
- affiliate disclosure included when required
- correct account selected
- no duplicate content posted within the previous 7 days

### 4. Publishing
Publish the approved daily package to all four authenticated channels.

Default posting sequence:
1. X
2. Instagram
3. TikTok
4. YouTube Shorts

If a platform rejects media or requires a manual verification step, publish to the remaining channels and flag only the blocked platform.

### 5. Archive
After publication:
- move package from `02_Daily_Content_Queue/YYYY-MM-DD` to `03_Published/YYYY-MM-DD`
- save live post URLs
- save platform post IDs
- save the exact UTM-tagged site URL used on each platform
- record publish timestamp

## Daily manifest
Each package should include `manifest.json`:

```json
{
  "date": "YYYY-MM-DD",
  "theme": "",
  "source_page": "",
  "source_media": [],
  "platforms": {
    "instagram": {"status": "draft", "url": "", "post_id": "", "destination_url": ""},
    "tiktok": {"status": "draft", "url": "", "post_id": "", "destination_url": ""},
    "youtube": {"status": "draft", "url": "", "post_id": "", "destination_url": ""},
    "x": {"status": "draft", "url": "", "post_id": "", "destination_url": ""}
  },
  "affiliate": false,
  "qa_passed": false
}
```

## Measurement stack
Primary site measurement: Vercel Web Analytics.

The site records:
- pageviews / visitors
- landing source attribution from UTM parameters or external referrer
- provider outbound clicks
- provider name
- page where the click occurred
- CTA text
- original social source / campaign when available

Primary conversion event:
`Provider Outbound Click`

Primary acquisition event:
`Landing Source`

Provider outbound tracking currently covers:
- Square
- Speed
- CoinGate
- NOWPayments

Do not collect email addresses, names, wallet addresses, or other user-identifying data in analytics events.

## Performance loop
At 24h and 7d, record:
- impressions/views
- engagement rate
- saves
- shares
- profile visits
- link clicks
- site sessions
- landing sessions by `utm_source`
- top landing pages
- provider outbound clicks
- provider outbound CTR = provider outbound clicks / relevant landing sessions
- affiliate conversions and revenue when available

Use results to adjust:
- hooks
- topic mix
- video length
- CTA
- posting time
- content format
- destination page
- channel allocation

## Weekly management readout
Every weekly performance review should show:
1. total site sessions/visitors
2. sessions by source
3. top 5 landing pages
4. provider outbound clicks by provider
5. provider outbound CTR by landing page
6. social performance by channel
7. best-performing topic
8. worst-performing topic
9. affiliate conversions/revenue, when available
10. the next 3 experiments

Do not call missing metrics zero. Mark them unavailable until the source is connected or populated.

## Automation success criterion
A successful daily run means:
1. one complete content package created,
2. media stored in Drive,
3. all four social channels published,
4. post URLs recorded,
5. UTM-tagged destination URLs recorded,
6. package archived,
7. performance data captured at 24h and 7d when accessible,
8. any blocker surfaced clearly.
