---
title: Sentry
---

## Enabled

This plugin is enabled when there is match in `dependencies` or
`devDependencies`:

- `^@sentry\/`

## Default configuration

```json title="knip.json"
{
  "sentry": {
    "entry": ["sentry.{client,server,edge}.config.{js,ts}"]
  }
}
```
