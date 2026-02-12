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
        TabManager.createTab(e.url);
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
        webviewsContainer.appendChild(wv);

        this.register(id, wv, tabEl);
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
document.addEventListener('DOMContentLoaded', init);

// ===== GLOBAL UI FEATURES (Notebook & Settings) =====
function setupGlobalUI() {
    setupNotebook();
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
        theme: 'aurora'
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
                this.config.theme = wallpaper;
                this.updateThemeButtons();
                this.save();
            });
        });

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
                const code = `
                try {
                    // Update Theme
                    if (typeof setWallpaper === 'function') {
                        setWallpaper('${this.config.theme}');
                    } else {
                        localStorage.setItem('heartbeat_wallpaper', '${this.config.theme}');
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
