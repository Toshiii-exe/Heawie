// ===== DOM ELEMENTS =====
const tabsList = document.getElementById('tabsList');
const webviewsContainer = document.getElementById('webviewsContainer');
const addressBar = document.getElementById('addressBar');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const homeBtn = document.getElementById('homeBtn');
const addTabBtn = document.getElementById('addTabBtn');
const globalSoundBtn = document.getElementById('globalSoundBtn');
const globalBreathingBtn = document.getElementById('globalBreathingBtn');

// ===== CONFIG =====
const HOME_URL = 'heartbeat/index.html';

// Initialize
function init() {
    TabManager.init();
    setupNavigationControls();
    setupGlobalUI();
}

// Setup navigation controls
function setupNavigationControls() {
    // Add Tab
    addTabBtn.addEventListener('click', () => TabManager.createTab());

    // Back button
    backBtn.addEventListener('click', () => {
        const wv = TabManager.getActiveWebview();
        if (wv && wv.canGoBack()) wv.goBack();
    });

    // Forward button
    forwardBtn.addEventListener('click', () => {
        const wv = TabManager.getActiveWebview();
        if (wv && wv.canGoForward()) wv.goForward();
    });

    // Reload button
    reloadBtn.addEventListener('click', () => {
        const wv = TabManager.getActiveWebview();
        if (wv) wv.reload();
    });

    // Home button
    homeBtn.addEventListener('click', () => {
        const wv = TabManager.getActiveWebview();
        if (wv) wv.loadURL(HOME_URL);
    });

    // Address bar
    addressBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const input = addressBar.value.trim();
            const wv = TabManager.getActiveWebview();
            if (input && wv) navigateToInput(input, wv);
        }
    });

    addressBar.addEventListener('focus', () => addressBar.select());

    // Global Sound Toggle
    globalSoundBtn.addEventListener('click', () => {
        const wv = TabManager.getActiveWebview();
        if (wv) {
            wv.executeJavaScript('if(typeof SoundManager !== "undefined") SoundManager.toggleMute()');
            updateGlobalControlsState(); // Re-sync after click
        }
    });

    // Global Breathing Toggle
    globalBreathingBtn.addEventListener('click', () => {
        const wv = TabManager.getActiveWebview();
        if (wv) {
            wv.executeJavaScript('if(window.BreathingMode) window.BreathingMode.toggle()').then(() => {
                updateGlobalControlsState(); // Re-sync after click
            });
        }
    });

    // Bookmark Current Page
    const bookmarkCurrentBtn = document.getElementById('bookmarkCurrentBtn');
    if (bookmarkCurrentBtn) {
        bookmarkCurrentBtn.addEventListener('click', () => {
            const wv = TabManager.getActiveWebview();
            if (wv) {
                const url = wv.getURL();
                const title = wv.getTitle();
                // Simple favicon fetch
                const domain = new URL(url).hostname;
                const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                BookmarksManager.toggle(title, url, icon);
            }
        });
    }
}

// Navigate based on user input
function navigateToInput(input, targetWv) {
    if (!input || !targetWv) return;

    let url = input.trim();

    // Enhanced Domain Check for speed and accuracy
    const domainRegex = /^([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.(com|org|net|io|edu|gov|me|ai|dev|app|local|top|site|info|online|shop))(:[0-9]{1,5})?(\/.*)?$/i;
    const isDomain = domainRegex.test(url);

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
        if (isDomain && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            // Faster Search URL with optimized parameters
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}&sourceid=chrome&ie=UTF-8`;
        }
    }

    try {
        targetWv.loadURL(url);
    } catch (e) {
        console.error("Navigation failed", e);
    }
}


// Setup webview event listeners
function setupWebviewListeners(wv, tabId) {
    wv.addEventListener('did-navigate', (e) => {
        if (tabId === TabManager.activeTabId) {
            updateAddressBar(e.url);
            updateNavigationButtons();
        }
    });

    wv.addEventListener('did-navigate-in-page', (e) => {
        if (tabId === TabManager.activeTabId) {
            updateAddressBar(e.url);
            updateNavigationButtons();
        }
    });

    wv.addEventListener('page-title-updated', (e) => {
        const tabEl = document.getElementById(tabId);
        if (tabEl) tabEl.querySelector('.tab-title').textContent = e.title;
    });

    wv.addEventListener('did-start-loading', () => {
        if (tabId === TabManager.activeTabId) reloadBtn.style.opacity = '0.5';
    });

    wv.addEventListener('did-stop-loading', () => {
        if (tabId === TabManager.activeTabId) {
            reloadBtn.style.opacity = '1';
            updateNavigationButtons();
        }
    });

    wv.addEventListener('new-window', (e) => {
        e.preventDefault();
        TabManager.createTab(e.url);
    });

    wv.addEventListener('will-navigate', (e) => {
        // If we are on the Heartbeat tab and try to navigate away (e.g. from speed dial),
        // intercept and open in a new tab instead of overwriting the Heartbeat page.
        if (tabId === 'tab-initial' && !e.url.includes('heartbeat/index.html')) {
            const wvEl = TabManager.getWebviewById(tabId);
            if (wvEl) {
                wvEl.stop();
                TabManager.createTab(e.url);
            }
        }
    });

    wv.addEventListener('dom-ready', () => {
        SettingsManager.applyThemeToWebview(wv);
    });
}

const TabManager = {
    tabs: [],
    activeTabId: null,

    init() {
        const initialWv = document.getElementById('wv-tab-initial');
        const initialTab = document.getElementById('tab-initial');
        if (initialWv && initialTab) {
            initialWv.setAttribute('partition', 'persist:heawie_main'); // Speed up heartbeat
            this.register('tab-initial', initialWv, initialTab);
        }
    },

    register(id, wv, tabEl) {
        this.tabs.push({ id, wv, tabEl });
        tabEl.addEventListener('click', () => this.switch(id));
        tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.close(id);
        });
        setupWebviewListeners(wv, id);
        this.switch(id);
    },

    createTab(url = HOME_URL) {
        const id = 'tab-' + Date.now();

        // Tab UI
        const tabEl = document.createElement('div');
        tabEl.className = 'tab';
        tabEl.id = id;
        tabEl.innerHTML = `<span class="tab-title">New Tab</span><span class="tab-close">&times;</span>`;
        tabsList.appendChild(tabEl);

        // Webview
        const wv = document.createElement('webview');
        wv.id = 'wv-' + id;
        wv.src = url;
        wv.setAttribute('allowpopups', 'true');
        wv.setAttribute('partition', 'persist:heawie_main'); // Enable caching for speed
        webviewsContainer.appendChild(wv);

        this.register(id, wv, tabEl);
    },

    getWebviewById(id) {
        const tab = this.tabs.find(t => t.id === id);
        return tab ? tab.wv : null;
    },

    switch(id) {
        this.activeTabId = id;
        this.tabs.forEach(t => {
            t.tabEl.classList.toggle('active', t.id === id);
            t.wv.classList.toggle('hidden', t.id !== id);
        });

        const activeWv = this.getActiveWebview();
        if (activeWv) {
            try {
                updateAddressBar(activeWv.getURL());
                updateNavigationButtons();
            } catch (e) { }
        }
    },

    close(id) {
        if (this.tabs.length === 1) return; // Don't close last tab
        const index = this.tabs.findIndex(t => t.id === id);
        if (index === -1) return;

        const tab = this.tabs[index];
        tab.tabEl.remove();
        tab.wv.remove();
        this.tabs.splice(index, 1);

        if (id === this.activeTabId) {
            const nextTab = this.tabs[index] || this.tabs[this.tabs.length - 1];
            this.switch(nextTab.id);
        }
    },

    getActiveWebview() {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        return tab ? tab.wv : null;
    }
};



// Update address bar
function updateAddressBar(url) {
    if (url && !url.startsWith('devtools://')) {
        addressBar.value = url;
    }
}

// Update navigation button states
function updateNavigationButtons() {
    const wv = TabManager.getActiveWebview();
    if (wv) {
        try {
            backBtn.disabled = !wv.canGoBack();
            forwardBtn.disabled = !wv.canGoForward();
            updateGlobalControlsState();

            // Update Bookmark Button state
            const bookmarkCurrentBtn = document.getElementById('bookmarkCurrentBtn');
            if (bookmarkCurrentBtn) {
                const isBookmarked = BookmarksManager.isBookmarked(wv.getURL());
                bookmarkCurrentBtn.classList.toggle('active', isBookmarked);
            }
        } catch (e) { }
    }
}

// Sync global control button icons/states with active page
async function updateGlobalControlsState() {
    const wv = TabManager.getActiveWebview();
    if (!wv) return;

    try {
        // Sync Sound State
        const isMuted = await wv.executeJavaScript('typeof SoundManager !== "undefined" ? SoundManager.isMuted : true');
        globalSoundBtn.classList.toggle('active', !isMuted);

        // Sync Breathing State
        const isBreathing = await wv.executeJavaScript('window.BreathingMode ? window.BreathingMode.isActive : false');
        globalBreathingBtn.classList.toggle('active', isBreathing);
    } catch (e) {
        // Fallback or ignore if script not ready
        globalSoundBtn.classList.remove('active');
        globalBreathingBtn.classList.remove('active');
    }
}

// Initialize when DOM is ready
// BOOKMARKS MANAGER
const BookmarksManager = {
    bookmarks: [],
    isOpen: false,

    init() {
        this.load();
        this.setupUI();
    },

    load() {
        const saved = localStorage.getItem('heawie_bookmarks');
        if (saved) {
            try {
                this.bookmarks = JSON.parse(saved);
            } catch (e) {
                this.bookmarks = [];
            }
        }
    },

    save() {
        localStorage.setItem('heawie_bookmarks', JSON.stringify(this.bookmarks));
        this.render();
        // Update nav button state if active
        const wv = TabManager.getActiveWebview();
        if (wv) {
            const bookmarkCurrentBtn = document.getElementById('bookmarkCurrentBtn');
            if (bookmarkCurrentBtn) {
                bookmarkCurrentBtn.classList.toggle('active', this.isBookmarked(wv.getURL()));
            }
        }
    },

    setupUI() {
        const toggleBtn = document.getElementById('bookmarksToggle');
        const overlay = document.getElementById('bookmarksOverlay');
        const closeBtn = document.getElementById('closeBookmarks');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.isOpen) this.close();
                else this.open();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') this.close();
        });
    },

    open() {
        this.isOpen = true;
        document.getElementById('bookmarksOverlay').classList.add('active');
        this.render();
    },

    close() {
        this.isOpen = false;
        document.getElementById('bookmarksOverlay').classList.remove('active');
    },

    toggle(title, url, icon) {
        if (url.startsWith('file://') && url.includes('heartbeat/index.html')) return; // Don't bookmark home

        const index = this.bookmarks.findIndex(b => b.url === url);
        if (index > -1) {
            this.bookmarks.splice(index, 1);
        } else {
            this.bookmarks.push({ title, url, icon });
        }
        this.save();
    },

    remove(url) {
        this.bookmarks = this.bookmarks.filter(b => b.url !== url);
        this.save();
    },

    isBookmarked(url) {
        return this.bookmarks.some(b => b.url === url);
    },

    render() {
        const list = document.getElementById('bookmarksList');
        if (!list) return;

        if (this.bookmarks.length === 0) {
            list.innerHTML = '<div class="empty-state">No liked pages yet. Click the heart in the address bar to save one!</div>';
            return;
        }

        list.innerHTML = '';
        this.bookmarks.forEach(b => {
            const item = document.createElement('div');
            item.className = 'bookmark-item-wrapper'; // Need a wrapper for delete button positioning if desired

            const a = document.createElement('a');
            a.className = 'bookmark-item';
            a.href = '#';
            a.innerHTML = `
                <div class="bookmark-icon">
                    <img src="${b.icon}" width="20" height="20" onerror="this.src='https://cdn.pixabay.com/photo/2016/02/04/11/57/heart-1179054_1280.png'">
                </div>
                <div class="bookmark-info">
                    <span class="bookmark-title">${b.title || 'Untitled'}</span>
                    <span class="bookmark-url">${b.url}</span>
                </div>
                <button class="bookmark-delete" title="Remove">&times;</button>
            `;

            a.addEventListener('click', (e) => {
                if (e.target.classList.contains('bookmark-delete')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.remove(b.url);
                    return;
                }
                e.preventDefault();
                const wv = TabManager.getActiveWebview();
                if (wv) wv.loadURL(b.url);
                this.close();
            });

            list.appendChild(a);
        });
    }
};

document.addEventListener('DOMContentLoaded', init);

// ===== GLOBAL UI FEATURES (Notebook & Settings) =====
function setupGlobalUI() {
    setupNotebook();
    BookmarksManager.init();
    SettingsManager.init();
}

// NOTEBOOK MANAGER
const NotebookManager = {
    pages: ["", "", "", "", ""],
    currentPage: 0,
    isOpen: false,

    init() {
        this.load();
        this.setupUI();
    },

    load() {
        const saved = localStorage.getItem('heartbeat_notebook');
        if (saved) {
            try {
                this.pages = JSON.parse(saved);
                if (!Array.isArray(this.pages) || this.pages.length === 0) {
                    this.pages = [""];
                }
            } catch (e) {
                this.pages = [""];
            }
        }
    },

    save() {
        const textarea = document.getElementById('notebookContent');
        if (textarea) {
            this.pages[this.currentPage] = textarea.value;
        }
        localStorage.setItem('heartbeat_notebook', JSON.stringify(this.pages));
    },

    setupUI() {
        const toggleBtn = document.getElementById('notebookToggle');
        const overlay = document.getElementById('notebookOverlay');
        const closeBtn = document.getElementById('closeNotebook');
        const textarea = document.getElementById('notebookContent');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const dateDisplay = document.getElementById('notebookDate');

        // Toggle Open/Close
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.isOpen) this.close();
                else this.open();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        if (textarea) textarea.addEventListener('input', () => this.save());

        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') this.close();
        });

        if (dateDisplay) {
            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
        }
    },

    open() {
        this.isOpen = true;
        document.getElementById('notebookOverlay').classList.add('active');
        this.renderPage();
    },

    close() {
        this.isOpen = false;
        document.getElementById('notebookOverlay').classList.remove('active');
        this.save();
    },

    changePage(delta) {
        this.save();
        const newIndex = this.currentPage + delta;
        if (newIndex >= 0) {
            if (newIndex >= this.pages.length) {
                this.pages.push("");
            }
            this.currentPage = newIndex;
            this.renderPage();
        }
    },

    renderPage() {
        const textarea = document.getElementById('notebookContent');
        const indicator = document.getElementById('pageIndicator');
        textarea.value = this.pages[this.currentPage] || "";
        indicator.textContent = `Pg ${this.currentPage + 1}`;
    }
};

function setupNotebook() {
    NotebookManager.init();
}

// SETTINGS MANAGER (Dark Mode, Themes, Fonts)
const SettingsManager = {
    config: {
        darkMode: true,
        font: 'default',
        theme: 'aurora',
        customWallpaper: null
    },

    init() {
        this.load();
        this.setupUI();
        this.applyGlobal();
    },

    load() {
        const saved = localStorage.getItem('heartbeat_settings');
        if (saved) {
            try {
                this.config = { ...this.config, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        }
    },

    save() {
        localStorage.setItem('heartbeat_settings', JSON.stringify(this.config));
        this.applyGlobal();
    },

    setupUI() {
        const toggleBtn = document.getElementById('settingsToggle');
        const overlay = document.getElementById('settingsOverlay');
        const closeBtn = document.getElementById('closeSettings');

        const lightModeToggle = document.getElementById('lightModeToggle');
        const wallpaperButtons = document.querySelectorAll('.wallpaper-btn');
        const fontSelector = document.getElementById('fontSelector');

        // Modal Toggles
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                overlay.classList.add('active');
                // Sync UI state
                if (lightModeToggle) lightModeToggle.checked = !this.config.darkMode;
                if (fontSelector) fontSelector.value = this.config.font;
                this.updateThemeButtons();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        }

        // 1. Dark/Light Mode
        if (lightModeToggle) {
            lightModeToggle.addEventListener('change', (e) => {
                this.config.darkMode = !e.target.checked; // If checked (Right), it's Light Mode
                this.save();
            });
        }

        // 2. Themes
        wallpaperButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const wallpaper = btn.getAttribute('data-wallpaper');
                if (wallpaper) {
                    this.config.theme = wallpaper;
                    this.config.customWallpaper = null; // Reset custom if choosing preset
                    this.updateThemeButtons();
                    this.save();
                }
            });
        });

        // 2b. Custom Wallpaper
        const customBtn = document.getElementById('customWallpaperBtn');
        const customInput = document.getElementById('customWallpaperInput');

        if (customBtn && customInput) {
            customBtn.addEventListener('click', () => customInput.click());
            customInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.config.theme = 'custom';
                        this.config.customWallpaper = event.target.result; // Base64
                        this.updateThemeButtons();
                        this.save();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // 3. Fonts
        if (fontSelector) {
            fontSelector.addEventListener('change', (e) => {
                this.config.font = e.target.value;
                this.save();
            });
        }
    },

    updateThemeButtons() {
        document.querySelectorAll('.wallpaper-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-wallpaper') === this.config.theme) {
                btn.classList.add('active');
            }
        });
        const customBtn = document.getElementById('customWallpaperBtn');
        if (customBtn) {
            customBtn.classList.toggle('active', this.config.theme === 'custom');
        }
    },

    applyGlobal() {
        // Dark Mode Logic
        if (!this.config.darkMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        // Font Logic (Browser UI)
        let fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        if (this.config.font === 'serif') fontFamily = "'Georgia', serif";
        if (this.config.font === 'monospace') fontFamily = "'Courier New', monospace";
        if (this.config.font === 'cursive') fontFamily = "'Dancing Script', cursive";

        document.body.style.fontFamily = fontFamily;

        // Apply Theme to Webview
        this.applyThemeToWebview();
    },

    applyThemeToWebview(targetWv = null) {
        const wvs = targetWv ? [targetWv] : TabManager.tabs.map(t => t.wv);
        wvs.forEach(wv => {
            if (wv && typeof wv.executeJavaScript === 'function') {
                const customWallpaperBase64 = this.config.customWallpaper;
                const code = `
                try {
                    // Update Theme
                    if (typeof setWallpaper === 'function') {
                        setWallpaper('${this.config.theme}', ${customWallpaperBase64 ? `'${customWallpaperBase64}'` : 'null'});
                    } else {
                        localStorage.setItem('heartbeat_wallpaper', '${this.config.theme}');
                        if('${this.config.theme}' === 'custom' && ${customWallpaperBase64 ? 'true' : 'false'}) {
                             localStorage.setItem('heartbeat_custom_wallpaper', '${customWallpaperBase64}');
                        }
                        if(document.body) document.body.setAttribute('data-wallpaper', '${this.config.theme}');
                    }
                    
                    // Update Dark/Light Mode
                    const isLight = ${!this.config.darkMode};
                    if(isLight) document.body.classList.add('light-mode');
                    else document.body.classList.remove('light-mode');

                } catch(e) { console.error(e); }
            `;
                try {
                    wv.executeJavaScript(code);
                } catch (e) { }
            }
        });
    }
};
