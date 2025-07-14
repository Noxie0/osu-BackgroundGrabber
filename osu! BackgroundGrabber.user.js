// ==UserScript==
// @name         osu! BackgroundGrabber
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  Seamlessly adds a stylish background download button to osu! beatmap pages - grab those beautiful covers with one click!
// @author       Noxie
// @match        https://osu.ppy.sh/*
// @icon         https://raw.githubusercontent.com/Noxie0/osu-background-grabber/refs/heads/main/icon.png
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

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
        bgBtn.innerHTML = '<i class="fas fa-image"></i><span>Background</span>';

        bgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const testImg = new Image();
            testImg.onload = () => window.open(rawUrl, '_blank');
            testImg.onerror = () => window.open(fallbackUrl, '_blank');
            testImg.src = rawUrl;
        });

        container.appendChild(bgBtn);
    }

    function tryInjectButton() {
        const match = window.location.pathname.match(/\/beatmapsets\/(\d+)/);
        if (!match) return;

        const beatmapSetId = match[1];
        const container = document.querySelector('.beatmapset-header__buttons');
        if (!container || container.querySelector('.background-btn')) return;

        createButton(beatmapSetId, container);
    }

    function waitForContainer(callback, attempts = 0) {
        const container = document.querySelector('.beatmapset-header__buttons');
        if (container) {
            callback();
        } else if (attempts < 20) {
            setTimeout(() => waitForContainer(callback, attempts + 1), 200);
        }
    }

    function setupObservers() {
        let lastPath = location.pathname;

        const observeReactRouting = new MutationObserver(() => {
            if (location.pathname !== lastPath) {
                lastPath = location.pathname;
                waitForContainer(tryInjectButton);
            }
        });
        observeReactRouting.observe(document.body, { childList: true, subtree: true });

        const observeDOM = new MutationObserver(() => {
            waitForContainer(tryInjectButton);
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
        });
    } else {
        setupObservers();
        waitForContainer(tryInjectButton);
    }
})();
