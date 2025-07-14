# osu-background-grabber

A userscript that seamlessly adds a stylish background download button to osu! beatmap pages—grab those beautiful covers with one click!

## Features

- Adds a "Background" button to osu! beatmapset pages.
- Downloads the original full-size background image where available, or the cover image as a fallback.
- Button styling matches osu!'s interface for a native look and feel.
- Smart detection and insertion even with osu!'s React-based dynamic routing.

## Installation

1. **Install a userscript manager** such as [Tampermonkey](https://tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. **Download the userscript:**  
   [osu! BackgroundGrabber-1.1.user.js](./osu%21%20BackgroundGrabber-1.1.user.js)
3. **Open the userscript file in your browser**—your userscript manager should prompt you to install it.

## Usage

- Visit any osu! beatmapset page (URL like `https://osu.ppy.sh/beatmapsets/*`).
- Click the new **Background** button in the beatmap header to download the background image.

## How it works

- The script inserts a new button into the beatmap page's header.
- When clicked, the button tries to open the original background image. If it doesn't exist, it automatically falls back to the cover image.
- The button is always available and updates itself when navigating between beatmap sets (even with React routing).

## Requirements

- A modern web browser (Chrome, Firefox, Edge, etc.).
- A userscript manager extension (see Installation).

## Author

[Noxie](https://github.com/Noxie0)

## License

This project is released under an open license. (Specify license here if desired.)
