# osu! BackgroundGrabber

> Adds a one-click background download button to osu! beatmap pages.

[![Version](https://img.shields.io/badge/version-1.5-pink?style=flat-square)](https://github.com/Noxie0/osu-BackgroundGrabber/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![GreasyFork](https://img.shields.io/badge/GreasyFork-Install-red?style=flat-square)](https://greasyfork.org/en/scripts/542558-osu-backgroundgrabber)

---

## Features

- **One-click background grab** — button injected directly into the beatmap header
- **Highest quality first** — fetches `fullsize.jpg`, falls back to `cover.jpg` automatically
- **Customizable button** — toggle icon/text, pick any accent color
- **Persistent settings** — preferences saved to localStorage
- **SPA-aware** — survives osu!'s React routing and dynamic DOM updates
- **Native look** — matches osu!'s existing button styles

## Installation

### Recommended — GreasyFork
1. Install [Tampermonkey](https://tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click **[Install from GreasyFork](https://greasyfork.org/en/scripts/542558-osu-backgroundgrabber)**

### Manual
1. Install [Tampermonkey](https://tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Open the [raw script](https://github.com/Noxie0/osu-BackgroundGrabber/raw/refs/heads/main/osu!%20BackgroundGrabber.user.js) — your userscript manager will prompt to install it automatically

## Usage

1. Go to any beatmapset page: `https://osu.ppy.sh/beatmapsets/*`
2. Click the **Background** button in the beatmap header
3. The full-size background opens in a new tab

### Settings
Click the ⚙️ gear icon (top-right, visible on beatmap pages) to open the settings panel:

| Setting | Description |
|---|---|
| Enable Button | Show/hide the download button |
| Show Text | Toggle the "Background" label |
| Show Icon | Toggle the image icon |
| Use Custom Color | Override the default accent color |
| Accent Color | Color picker + hex input |

## How It Works

The script watches for osu!'s React route changes and re-injects the button whenever the DOM updates. On click, it probes for `fullsize.jpg` via an `Image` preload — if that 404s, it opens `cover.jpg` instead.

URL pattern: `https://assets.ppy.sh/beatmaps/{id}/covers/fullsize.jpg`

## Changelog

### v1.5
- Switched from `raw.jpg` to `fullsize.jpg` — `raw.jpg` was removed from osu!'s servers

### v1.4
- Added settings panel (color customization, button/icon/text toggles)
- Settings persisted via localStorage
- MutationObserver re-injection for React routing stability

### v1.2.1
- Initial public release

## Author

[Noxie](https://github.com/Noxie0)
