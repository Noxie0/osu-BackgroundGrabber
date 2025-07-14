// ==UserScript==
// @name         osu! BackgroundGrabber
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Seamlessly adds a stylish background download button to osu! beatmap pages - grab those beautiful covers with one click!
// @author       Noxie
// @match        https://osu.ppy.sh/beatmapsets/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Inject custom CSS to match osu!'s button styling
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
        }
        .background-btn .fa-image {
            font-size: 14px !important;
            margin-right: 8px !important;
            line-height: 1 !important;
        }
        .background-btn span {
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
        }
    `;
    document.head.appendChild(style);

    // Main function to create and add the background button
    function addBackgroundButton() {
        const container = document.querySelector('.beatmapset-header__buttons');
        if (!container) return;

        // Prevent creating duplicate buttons
        if (container.querySelector('.background-btn')) return;

        // Extract beatmapset ID from current URL
        const match = window.location.pathname.match(/\/beatmapsets\/(\d+)/);
        if (!match) return;

        const beatmapSetId = match[1];

        // Try to get the original full-size background image first, fallback to cover
        const bgUrlRaw = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/raw.jpg`;
        const bgUrlCover = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/cover.jpg`;

        // Copy styling from existing buttons for consistency
        const existingButton = container.querySelector('a[class*="btn"], button[class*="btn"]');

        // Create the new background button element
        const bgBtn = document.createElement('a');

        // Apply existing button classes or fallback classes
        if (existingButton) {
            bgBtn.className = existingButton.className;
        } else {
            bgBtn.className = 'btn-osu-big btn-osu-big--beatmapset-header';
        }

        // Add our custom identifier class
        bgBtn.classList.add('background-btn');

        // Configure button properties - try raw first, fallback to cover
        bgBtn.href = bgUrlRaw;
        bgBtn.target = '_blank';
        bgBtn.rel = 'noopener noreferrer';

        // Add fallback handling for when raw image doesn't exist
        bgBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Try to open the raw image first
            const testImg = new Image();
            testImg.onload = function() {
                window.open(bgUrlRaw, '_blank');
            };
            testImg.onerror = function() {
                // If raw fails, fallback to cover
                window.open(bgUrlCover, '_blank');
            };
            testImg.src = bgUrlRaw;
        });

        // Add icon and text content
        bgBtn.innerHTML = '<i class="fas fa-image"></i><span>Background</span>';

        // Insert button into the container
        container.appendChild(bgBtn);
    }

    // Enhanced observer to handle React routing and dynamic content
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            // Check if we're on a beatmapset page
            if (window.location.pathname.includes('/beatmapsets/')) {
                const container = document.querySelector('.beatmapset-header__buttons');
                if (container) {
                    addBackgroundButton();
                }
            }
        });

        // Start observing the entire document for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Also listen for URL changes (React routing)
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                // Small delay to let React finish rendering
                setTimeout(() => {
                    if (window.location.pathname.includes('/beatmapsets/')) {
                        addBackgroundButton();
                    }
                }, 100);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Initialize the script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }

    // Try to add button immediately if already on a beatmapset page
    if (window.location.pathname.includes('/beatmapsets/')) {
        addBackgroundButton();
    }
})();