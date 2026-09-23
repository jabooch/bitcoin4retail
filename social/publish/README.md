# Social publish handoff

Files placed in this folder can trigger the GitHub Actions -> Vercel -> Buffer publishing rail.

A manifest must contain:

```json
{
  "approved": true,
  "dryRun": false,
  "posts": []
}
```

The workflow always performs a Buffer dry run first. It only proceeds to the publish call if the dry run succeeds.

Required GitHub Actions repository secret:

- `B4R_AUTOMATION_SECRET`

Use the same value configured in the Vercel project. Never commit the value to the repository.
