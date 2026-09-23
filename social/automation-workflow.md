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
1. Current retail/Bitcoin/Square relevance
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

### 3. QA gate
Before publishing verify:
- no unsupported factual claims
- Square pricing/product facts are current
- brand consistency
- captions fit platform limits
- links resolve
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
    "instagram": {"status": "draft", "url": "", "post_id": ""},
    "tiktok": {"status": "draft", "url": "", "post_id": ""},
    "youtube": {"status": "draft", "url": "", "post_id": ""},
    "x": {"status": "draft", "url": "", "post_id": ""}
  },
  "affiliate": false,
  "qa_passed": false
}
```

## Performance loop
At 24h and 7d, record:
- impressions/views
- engagement rate
- saves
- shares
- profile visits
- link clicks
- site sessions
- affiliate clicks/conversions when available

Use results to adjust:
- hooks
- topic mix
- video length
- CTA
- posting time
- content format

## Automation success criterion
A successful daily run means:
1. one complete content package created,
2. media stored in Drive,
3. all four social channels published,
4. post URLs recorded,
5. package archived,
6. any blocker surfaced clearly.
