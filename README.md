# osu!BackgroundGrabber

A userscript that seamlessly adds a stylish background download button to osu! beatmap pages—grab those beautiful covers with one click!

## Features

- Adds a "Background" button to osu! beatmapset pages.
- Downloads the original full-size background image where available, or the cover image as a fallback.
- Button styling matches osu!'s interface for a native look and feel.
- Smart detection and insertion even with osu!'s React-based dynamic routing.
- Compatible with osuplus beatmap mirror buttons.

## Installation

1. **Install a userscript manager** such as [Tampermonkey](https://tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. **Download the userscript:**  
   [osu! BackgroundGrabber-1.1.user.js](./osu%21%20BackgroundGrabber-1.1.user.js) or use [Greasy Fork](https://greasyfork.org/en/scripts/542558-osu-backgroundgrabber) for fast installation.
3. **Open the userscript file in your browser**—your userscript manager should prompt you to install it.

### Manual Installation

If your browser does **not** automatically prompt you to install the script:
- Open your userscript manager's dashboard (e.g., click the Tampermonkey or Violentmonkey icon).
- Choose **"Create a new script"** or **"Add script"**.
- Open `osu! BackgroundGrabber-1.1.user.js` with a text editor, copy the entire content.
- Paste the content into the new script in your userscript manager and **save**.

## Usage

- Visit any osu! beatmapset page (URL like `https://osu.ppy.sh/beatmapsets/*`).
- Click the new **Background** button in the beatmap header to download the background image.

## How it works

- The script inserts a new button into the beatmap page's header.
- When clicked, the button tries to open the original background image. If it doesn't exist, it automatically falls back to the cover image.
- The button is always available and updates itself when navigating between beatmap sets (even with React routing).

## Requirements

- A modern web browser (Chrome, Firefox, Edge, etc.).
- A userscript manager extension (see [Installation](https://github.com/Noxie0/osu-background-grabber#installation)).

## Author

[Noxie](https://github.com/Noxie0)
