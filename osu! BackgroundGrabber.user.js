// ==UserScript==
// @name         osu! BackgroundGrabber
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Seamlessly adds a stylish background download button to osu! beatmap pages - grab those beautiful covers with one click!
// @author       Noxie
// @match        https://osu.ppy.sh/*
// @icon         https://raw.githubusercontent.com/Noxie0/osu-background-grabber/refs/heads/main/icon.png
// @license      MIT
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/542558/osu%21%20BackgroundGrabber.user.js
// @updateURL https://update.greasyfork.org/scripts/542558/osu%21%20BackgroundGrabber.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // Settings management
    const SETTINGS_KEY = 'osu_backgroundgrabber_settings';
    const defaultSettings = {
        buttonEnabled: true,
        textEnabled: true,
        iconEnabled: true
    };

    function getSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('[BackgroundGrabber] Failed to save settings:', e);
        }
    }

    let currentSettings = getSettings();

    const style = document.createElement('style');
    style.textContent = `
        .background-btn {
            min-width: 120px !important;
            white-space: nowrap !important;
            padding: 0 20px !important;
            height: auto !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
        }
        .background-btn .fa-image {
            font-size: 16px !important;
            margin-right: 8px !important;
            line-height: 1 !important;
        }
        .background-btn.icon-only .fa-image {
            font-size: 20px !important;
            margin-right: 0 !important;
        }
        .background-btn span {
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
        }

        /* Settings panel styles */
        .bg-grabber-settings {
            position: fixed;
            top: 70px;
            right: 20px;
            background: #2a2a2a;
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #ff6bb3;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            min-width: 280px;
            display: none;
        }

        .bg-grabber-settings.show {
            display: block;
        }

        .bg-grabber-settings h3 {
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #ff6bb3;
            border-bottom: 2px solid #ff6bb3;
            padding-bottom: 8px;
            text-align: center;
        }

        .bg-grabber-setting-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 8px 0;
            border-bottom: 1px solid #444;
        }

        .bg-grabber-setting-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .bg-grabber-setting-item label {
            flex: 1;
            cursor: pointer;
            font-weight: 500;
        }

        .bg-grabber-setting-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            margin-right: 12px;
            accent-color: #ff6bb3;
        }

        .bg-grabber-setting-item input[type="checkbox"]:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .bg-grabber-setting-item label.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .bg-grabber-settings-icon {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 179, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        }

        .bg-grabber-settings-icon:hover {
            background: rgba(255, 107, 179, 1);
            transform: scale(1.1);
        }

        .bg-grabber-close-btn {
            position: absolute;
            top: 5px;
            right: 10px;
            background: none;
            border: none;
            color: #ccc;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .bg-grabber-close-btn:hover {
            color: white;
        }
    `;
    document.head.appendChild(style);

    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'bg-grabber-settings';
        panel.innerHTML = `
            <button class="bg-grabber-close-btn" title="Close">×</button>
            <h3>Background Grabber Settings</h3>
            <div class="bg-grabber-setting-item">
                <input type="checkbox" id="bg-button-toggle" ${currentSettings.buttonEnabled ? 'checked' : ''}>
                <label for="bg-button-toggle">Enable Button</label>
            </div>
            <div class="bg-grabber-setting-item">
                <input type="checkbox" id="bg-text-toggle" ${currentSettings.textEnabled ? 'checked' : ''}>
                <label for="bg-text-toggle">Show Text</label>
            </div>
            <div class="bg-grabber-setting-item">
                <input type="checkbox" id="bg-icon-toggle" ${currentSettings.iconEnabled ? 'checked' : ''}>
                <label for="bg-icon-toggle">Show Icon</label>
            </div>
        `;

        // Add event listeners
        const buttonToggle = panel.querySelector('#bg-button-toggle');
        const textToggle = panel.querySelector('#bg-text-toggle');
        const iconToggle = panel.querySelector('#bg-icon-toggle');
        const closeBtn = panel.querySelector('.bg-grabber-close-btn');

        buttonToggle.addEventListener('change', (e) => {
            currentSettings.buttonEnabled = e.target.checked;

            // If enabling the button and both text and icon are disabled, force text to show
            if (currentSettings.buttonEnabled && !currentSettings.textEnabled && !currentSettings.iconEnabled) {
                currentSettings.textEnabled = true;
                textToggle.checked = true;
            }

            saveSettings(currentSettings);
            updateButtonVisibility();
            updateSettingsState();

            // Re-inject button if it was enabled
            if (currentSettings.buttonEnabled) {
                setTimeout(() => {
                    const existingButton = document.querySelector('.background-btn');
                    if (existingButton) {
                        existingButton.remove();
                    }
                    waitForContainer(tryInjectButton);
                }, 100);
            }
        });

        textToggle.addEventListener('change', (e) => {
            currentSettings.textEnabled = e.target.checked;

            // If both icon and text are disabled, force disable the button
            if (!currentSettings.textEnabled && !currentSettings.iconEnabled) {
                currentSettings.buttonEnabled = false;
                buttonToggle.checked = false;
                updateSettingsState();
            }

            saveSettings(currentSettings);
            updateButtonContent();
            updateButtonVisibility();
            // Re-inject button to apply new content
            setTimeout(() => {
                const existingButton = document.querySelector('.background-btn');
                if (existingButton) {
                    existingButton.remove();
                }
                waitForContainer(tryInjectButton);
            }, 50);
        });

        iconToggle.addEventListener('change', (e) => {
            currentSettings.iconEnabled = e.target.checked;

            // If both icon and text are disabled, force disable the button
            if (!currentSettings.iconEnabled && !currentSettings.textEnabled) {
                currentSettings.buttonEnabled = false;
                buttonToggle.checked = false;
                updateSettingsState();
            }

            saveSettings(currentSettings);
            updateButtonContent();
            updateButtonVisibility();
            // Re-inject button to apply new content
            setTimeout(() => {
                const existingButton = document.querySelector('.background-btn');
                if (existingButton) {
                    existingButton.remove();
                }
                waitForContainer(tryInjectButton);
            }, 50);
        });

        closeBtn.addEventListener('click', () => {
            panel.classList.remove('show');
        });

        // Initialize settings state
        updateSettingsState();

        return panel;
    }

    function createSettingsIcon() {
        const icon = document.createElement('button');
        icon.className = 'bg-grabber-settings-icon';
        icon.innerHTML = '⚙️';
        icon.title = 'Background Grabber Settings';

        icon.addEventListener('click', () => {
            const panel = document.querySelector('.bg-grabber-settings');
            if (panel) {
                panel.classList.toggle('show');
            }
        });

        return icon;
    }

    function updateButtonVisibility() {
        const button = document.querySelector('.background-btn');
        if (button) {
            if (currentSettings.buttonEnabled) {
                button.style.display = 'inline-flex';
                button.style.visibility = 'visible';
            } else {
                button.style.display = 'none';
                button.style.visibility = 'hidden';
            }
        }
    }

    function updateSettingsState() {
        const textToggle = document.querySelector('#bg-text-toggle');
        const iconToggle = document.querySelector('#bg-icon-toggle');
        const textLabel = document.querySelector('label[for="bg-text-toggle"]');
        const iconLabel = document.querySelector('label[for="bg-icon-toggle"]');

        if (textToggle && iconToggle && textLabel && iconLabel) {
            const isDisabled = !currentSettings.buttonEnabled;

            textToggle.disabled = isDisabled;
            iconToggle.disabled = isDisabled;

            if (isDisabled) {
                textLabel.classList.add('disabled');
                iconLabel.classList.add('disabled');
            } else {
                textLabel.classList.remove('disabled');
                iconLabel.classList.remove('disabled');
            }
        }
    }

    function updateButtonContent() {
        const button = document.querySelector('.background-btn');
        if (!button) return;

        const icon = button.querySelector('.fa-image');
        const text = button.querySelector('span');

        if (icon) {
            icon.style.display = currentSettings.iconEnabled ? 'inline' : 'none';
            icon.style.marginRight = (currentSettings.iconEnabled && currentSettings.textEnabled) ? '8px' : '0';
        }
        if (text) {
            text.style.display = currentSettings.textEnabled ? 'inline' : 'none';
        }

        // Remove all custom sizing to reset
        button.style.padding = '';
        button.style.minWidth = '';
        button.style.width = '';
        button.style.height = '';

        // Force reflow and adjust button size based on content
        requestAnimationFrame(() => {
            if (!currentSettings.iconEnabled && !currentSettings.textEnabled) {
                // Neither icon nor text - hide the button entirely
                button.style.display = 'none';
                button.style.visibility = 'hidden';
            } else if (currentSettings.iconEnabled && !currentSettings.textEnabled) {
                // Only icon - square button, match other icon buttons
                button.style.display = 'inline-flex';
                button.style.visibility = 'visible';
                button.style.setProperty('padding', '0', 'important');
                button.style.setProperty('min-width', '45px', 'important');
                button.style.setProperty('width', '45px', 'important');
                button.style.setProperty('height', '45px', 'important');
                button.classList.add('icon-only');
            } else if (!currentSettings.iconEnabled && currentSettings.textEnabled) {
                // Only text - medium button
                button.style.display = 'inline-flex';
                button.style.visibility = 'visible';
                button.style.setProperty('padding', '0 16px', 'important');
                button.style.setProperty('min-width', '80px', 'important');
                button.style.setProperty('width', 'auto', 'important');
                button.style.setProperty('height', 'auto', 'important');
            } else {
                // Both icon and text - full size
                button.style.display = 'inline-flex';
                button.style.visibility = 'visible';
                button.style.setProperty('padding', '0 20px', 'important');
                button.style.setProperty('min-width', '120px', 'important');
                button.style.setProperty('width', 'auto', 'important');
                button.style.setProperty('height', 'auto', 'important');
                button.classList.remove('icon-only');
            }
        });
    }

    function createButton(beatmapSetId, container) {
        const rawUrl = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/raw.jpg`;
        const fallbackUrl = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/cover.jpg`;

        const existingButton = container.querySelector('a[class*="btn"], button[class*="btn"]');
        const bgBtn = document.createElement('a');

        bgBtn.className = existingButton ? existingButton.className : 'btn-osu-big btn-osu-big--beatmapset-header';
        bgBtn.classList.add('background-btn');
        bgBtn.href = rawUrl;
        bgBtn.target = '_blank';
        bgBtn.rel = 'noopener noreferrer';

        const iconHtml = currentSettings.iconEnabled ? '<i class="fas fa-image"></i>' : '';
        const textHtml = currentSettings.textEnabled ? '<span>Background</span>' : '';
        bgBtn.innerHTML = iconHtml + textHtml;

        bgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const testImg = new Image();
            testImg.onload = () => window.open(rawUrl, '_blank');
            testImg.onerror = () => window.open(fallbackUrl, '_blank');
            testImg.src = rawUrl;
        });

        container.appendChild(bgBtn);
        updateButtonVisibility();
        updateButtonContent();
    }

    function tryInjectButton() {
        const match = window.location.pathname.match(/\/beatmapsets\/(\d+)/);
        if (!match) return;

        const beatmapSetId = match[1];
        const container = document.querySelector('.beatmapset-header__buttons');
        if (!container || container.querySelector('.background-btn')) return;

        createButton(beatmapSetId, container);
    }

    function tryInjectSettings() {
        console.log('[BackgroundGrabber] tryInjectSettings called, path:', window.location.pathname);

        // Only show settings on beatmap pages
        if (!window.location.pathname.includes('/beatmapsets/')) {
            console.log('[BackgroundGrabber] Not on beatmap page, removing settings');
            const existingIcon = document.querySelector('.bg-grabber-settings-icon');
            const existingPanel = document.querySelector('.bg-grabber-settings');
            if (existingIcon) existingIcon.remove();
            if (existingPanel) existingPanel.remove();
            return;
        }

        // Check if settings already exist
        const existingIcon = document.querySelector('.bg-grabber-settings-icon');
        const existingPanel = document.querySelector('.bg-grabber-settings');

        if (existingIcon && existingPanel) {
            console.log('[BackgroundGrabber] Settings already exist, skipping injection');
            return;
        }

        console.log('[BackgroundGrabber] Injecting settings...');

        // Remove existing elements first to avoid duplicates
        if (existingIcon) existingIcon.remove();
        if (existingPanel) existingPanel.remove();

        // Refresh settings from localStorage
        currentSettings = getSettings();

        const settingsIcon = createSettingsIcon();
        const settingsPanel = createSettingsPanel();

        document.body.appendChild(settingsIcon);
        document.body.appendChild(settingsPanel);

        console.log('[BackgroundGrabber] Settings injected successfully');
    }

    function waitForContainer(callback, attempts = 0) {
        const container = document.querySelector('.beatmapset-header__buttons');
        if (container) {
            callback();
        } else if (attempts < 20) {
            setTimeout(() => waitForContainer(callback, attempts + 1), 200);
        }
    }

    function waitForSettings(callback, attempts = 0) {
        // Only try to inject settings on beatmap pages
        if (!window.location.pathname.includes('/beatmapsets/')) {
            // Remove settings if not on beatmap page
            const existingIcon = document.querySelector('.bg-grabber-settings-icon');
            const existingPanel = document.querySelector('.bg-grabber-settings');
            if (existingIcon) existingIcon.remove();
            if (existingPanel) existingPanel.remove();
            return;
        }

        // Just check if document.body exists - don't wait for complete load
        if (document.body) {
            callback();
        } else if (attempts < 20) {
            setTimeout(() => waitForSettings(callback, attempts + 1), 200);
        }
    }

    function setupObservers() {
        let lastPath = location.pathname;

        const observeReactRouting = new MutationObserver(() => {
            if (location.pathname !== lastPath) {
                lastPath = location.pathname;
                // Add delay to ensure page elements are loaded
                setTimeout(() => {
                    waitForContainer(tryInjectButton);
                    waitForSettings(tryInjectSettings);
                }, 100);
            }
        });
        observeReactRouting.observe(document.body, { childList: true, subtree: true });

        const observeDOM = new MutationObserver(() => {
            waitForContainer(tryInjectButton);
            waitForSettings(tryInjectSettings);
        });

        const rootNode = document.querySelector('#root');
        if (rootNode) {
            observeDOM.observe(rootNode, { childList: true, subtree: true });
        } else {
            let retryCount = 0;
            const retry = setInterval(() => {
                const node = document.querySelector('#root');
                if (node) {
                    observeDOM.observe(node, { childList: true, subtree: true });
                    clearInterval(retry);
                } else if (++retryCount > 10) {
                    clearInterval(retry);
                    console.warn('[BackgroundGrabber] Failed to observe #root after 10 tries.');
                }
            }, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupObservers();
            waitForContainer(tryInjectButton);
            waitForSettings(tryInjectSettings);
        });
    } else {
        setupObservers();
        waitForContainer(tryInjectButton);
        waitForSettings(tryInjectSettings);
    }
})();
