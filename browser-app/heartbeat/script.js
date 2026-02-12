// ===== CONFIGURATION =====
const CONFIG = {
    messageTimings: [10000, 25000, 45000], // 10s, 25s, 45s
    messageDuration: 8000, // How long each message stays visible

    // IDLE heart state - calm, home-like words that rotate slowly
    idleWords: [
        "home", "safe", "warmth", "quiet", "still", "calm", "here", "close", "steady", "gentle",
        "familiar", "comfort", "soft", "rest", "peace", "grounded", "held", "breathe",
        "warmth lives here", "nothing hurts here", "stay a while", "slow down", "you're okay",
        "present", "warmth remains", "heartbeat stays", "safe space", "softly glowing",
        "quietly alive", "calm inside", "no rush", "unguarded", "familiar silence",
        "slow moments", "shared quiet", "settled", "breathing light", "resting pulse",
        "gentle time", "warmth returns", "anchored", "held gently", "ease", "unspoken calm",
        "peaceful weight", "settled heart", "steady glow", "nothing loud", "just here", "home again"
    ],

    // CLICK heart state - intimate messages on each click
    clickWords: [
        "I love you", "you are mine", "my juwie", "always you", "my universe",
        "my favorite place", "my constant", "my safe person", "my calm", "my heart knows you",
        "chosen", "meant to be", "you feel like home", "only you", "I choose you", "my twin",
        "my forever", "close to my soul", "you stay", "I'm yours", "my warmth", "my peace",
        "my everything", "right here", "heartbeat syncs", "you understand me", "I trust you",
        "my quiet joy", "you calm me", "my gravity", "my anchor", "my light", "my reason",
        "you're safe with me", "you're loved", "I hold you", "my home", "always close",
        "my constant place", "my heartbeat chose you", "us", "together", "just us", "you're mine",
        "my comfort person", "I feel you", "my soul knows", "we're aligned", "always connected", "my heart stays"
    ],

    idleWordDuration: 4000, // How long each idle word stays (4 seconds)
    idleWordFadeTime: 1500, // Fade in/out time (1.5 seconds)

    secretPassword: "juwie",
    proximityThreshold: 300, // Max distance for proximity effect
    baseAnimationDuration: 2000, // Base pulse duration in ms
    minAnimationDuration: 1200, // Fastest pulse

    // Dynamic Secret Message Configuration
    messagesJsonUrl: 'https://raw.githubusercontent.com/Toshiii-exe/Heawie/main/messages.json', // Path to external messages file
    messageFetchMode: 'latest', // 'latest' or 'random'
    cacheBustParam: true, // Add timestamp to prevent caching

    // Universal Secret Message Content (used as fallback and default)
    fallbackSecretContent: {
        title: "For Juwie 💕",
        paragraphs: [
            "This space is yours. A place where time slows down, where every heartbeat whispers your name. You are my universe, my home, my everything—unchanging, eternal, beyond all seasons.",
            "In this quiet moment, know that you are loved beyond words, beyond time, beyond measure."
        ],
        signature: "— Forever yours",
        timestamp: null
    },

    // Animated Wallpaper URLs (cute pixel art GIFs)
    wallpapers: {
        aurora: 'https://i.pinimg.com/originals/95/89/9e/95899e5f0e6e7e6e5f3e3e3e3e3e3e3e.gif', // Aurora/northern lights
        space: 'https://i.pinimg.com/originals/c1/6e/7e/c16e7e5f0e6e7e6e5f3e3e3e3e3e3e3e.gif', // Space cat/cosmic
        stars: 'https://i.pinimg.com/originals/a4/5e/7e/a45e7e5f0e6e7e6e5f3e3e3e3e3e3e3e.gif', // Starry night
        cosmic: 'https://i.pinimg.com/originals/f2/3e/7e/f23e7e5f0e6e7e6e5f3e3e3e3e3e3e3e.gif', // Cosmic waves
        rainbow: 'https://i.pinimg.com/originals/d8/2e/7e/d82e7e5f0e6e7e6e5f3e3e3e3e3e3e3e.gif' // Rainbow vibes
    }
};

// ===== STATE =====
let currentClickMessageIndex = 0;
let currentIdleWordIndex = 0;
let idleWordInterval = null;
let isUnlocked = false;
let currentWallpaper = 'aurora';
let proximityAnimationFrame = null;
let secretMessageData = null;
let isHeartClickDebounced = false;
let currentProximityValue = 1; // For smooth interpolation
let isTimedMessageActive = false;
let isClickMessageActive = false;
let isIdleWordPaused = false;
let idleWordTimeout = null;
let idleWordFadeTimeout = null;

// ===== DOM ELEMENTS (with safety checks) =====
const heart = document.getElementById('heart');
const heartSvg = document.querySelector('.heart-svg');
const heartGlow = document.querySelector('.heart-glow');
const lockIcon = document.getElementById('lockIcon');
const unlockModal = document.getElementById('unlockModal');
const closeUnlock = document.getElementById('closeUnlock');
const secretInput = document.getElementById('secretInput');
const submitSecret = document.getElementById('submitSecret');
const errorMsg = document.getElementById('errorMsg');
const secretArea = document.getElementById('secretArea');
const secretContentDiv = document.getElementById('secretContent');
const messageStatus = document.getElementById('messageStatus');
const clickMessage = document.getElementById('clickMessage');
const idleWord = document.getElementById('idleWord');
const messages = [
    document.getElementById('message1'),
    document.getElementById('message2'),
    document.getElementById('message3')
].filter(Boolean); // Remove null elements
const wallpaperButtons = document.querySelectorAll('.wallpaper-btn');
const backgroundContainer = document.getElementById('backgroundContainer');
const searchContainer = document.querySelector('.search-container');
let searchTimeout = null;

// ===== INITIALIZATION =====
function init() {
    loadUserPreferences();
    setWallpaper(currentWallpaper);
    fetchSecretMessages();
    setupWallpaperSelector();
    setupTimeBasedMessages();
    setupHeartClick();
    setupLockClick();
    setupUnlockModal();
    setupProximityEffect();
    setupKeyboardAccessibility();
    checkReducedMotion();
    setupSearchBar();
    SoundManager.init();
    setupControls();
    TimerManager.init(); // Initialize Timer
    TodoManager.init();  // Initialize Todos
    startClock();

    // DELAY Start: Idle words only start 3 seconds after opening
    setTimeout(() => {
        startIdleWordRotation();
    }, 3000);
}

// ===== LOCAL STORAGE PERSISTENCE =====
function loadUserPreferences() {
    const savedWallpaper = localStorage.getItem('heartbeat_wallpaper');
    const savedCustomWallpaper = localStorage.getItem('heartbeat_custom_wallpaper');
    const savedUnlocked = localStorage.getItem('heartbeat_unlocked');
    const savedClickIndex = localStorage.getItem('heartbeat_click_index');

    if (savedWallpaper) {
        currentWallpaper = savedWallpaper;
    }

    if (savedUnlocked === 'true') {
        isUnlocked = true;
        document.body.classList.add('unlocked');
        lockIcon.classList.add('unlocked');
    }

    // Load click message index
    if (savedClickIndex !== null) {
        const index = parseInt(savedClickIndex, 10);
        if (!isNaN(index) && index >= 0 && index < CONFIG.clickWords.length) {
            currentClickMessageIndex = index;
        }
    }

    // Apply wallpaper (including custom)
    setWallpaper(currentWallpaper, savedCustomWallpaper);
}

function saveUserPreferences(customBase64 = null) {
    localStorage.setItem('heartbeat_wallpaper', currentWallpaper);
    if (currentWallpaper === 'custom' && customBase64) {
        localStorage.setItem('heartbeat_custom_wallpaper', customBase64);
    }
    localStorage.setItem('heartbeat_unlocked', isUnlocked.toString());
    localStorage.setItem('heartbeat_click_index', currentClickMessageIndex.toString());
}

// ===== CLOCK SYSTEM =====
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}


// ===== WALLPAPER SYSTEM =====
function setupWallpaperSelector() {
    const themeToggle = document.getElementById('themeToggle');
    const themeWheel = document.getElementById('themeWheel');
    const wallpaperButtons = document.querySelectorAll('.wallpaper-btn');

    // Toggle menu
    if (themeToggle && themeWheel) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeWheel.classList.toggle('active');
            themeToggle.classList.toggle('active');
        });

        // Close when clicking outside
        window.addEventListener('click', (e) => {
            if (!themeWrapper.contains(e.target)) {
                themeWheel.classList.remove('active');
                themeToggle.classList.remove('active');
            }
        });
    }

    const themeWrapper = document.querySelector('.theme-wrapper');

    updateActiveWallpaperButton();

    wallpaperButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const wallpaper = btn.getAttribute('data-wallpaper');
            if (wallpaper !== currentWallpaper) {
                currentWallpaper = wallpaper;
                setWallpaper(wallpaper);
                updateActiveWallpaperButton();
                saveUserPreferences();
            }
        });
    });

    // Initialize Notebook
    NotebookManager.init();
}

function setWallpaper(wallpaper, customBase64 = null) {
    let url = CONFIG.wallpapers[wallpaper];

    // Support custom local pictures
    if (wallpaper === 'custom' && customBase64) {
        url = customBase64;
    }

    // Set body attribute for CSS theme changes
    document.body.setAttribute('data-wallpaper', wallpaper);

    if (url) {
        // Set as background image
        backgroundContainer.style.backgroundImage = `url('${url}')`;
    } else {
        // Fallback or empty
        backgroundContainer.style.backgroundImage = 'none';
    }
}

function updateActiveWallpaperButton() {
    const wallpaperButtons = document.querySelectorAll('.wallpaper-btn');
    wallpaperButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-wallpaper') === currentWallpaper) {
            btn.classList.add('active');
        }
    });
}

// ===== NOTEBOOK MANAGER =====
const NotebookManager = {
    pages: ["", "", "", "", ""], // 5 pages by default
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
        // Save current page content to array first
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
            toggleBtn.addEventListener('click', () => this.open());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        // Auto-save on input
        if (textarea) {
            textarea.addEventListener('input', () => this.save());
        }

        // Pagination
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changePage(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changePage(1));
        }

        // Key bindings
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') this.close();
        });

        // Set Date
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
        // Save current before switching
        this.save();

        const newIndex = this.currentPage + delta;
        if (newIndex >= 0) {
            // Expand pages if needed
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

// ===== DYNAMIC SECRET MESSAGE FETCHING =====
async function fetchSecretMessages() {
    try {
        let url = CONFIG.messagesJsonUrl;

        // Add cache-busting parameter
        if (CONFIG.cacheBustParam) {
            url += `?t=${Date.now()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        secretMessageData = data;

        // Render the appropriate message
        if (isUnlocked) {
            renderSecretContent();
        }

        console.log('✅ Secret messages loaded successfully');
    } catch (error) {
        console.warn('⚠️ Could not fetch messages.json, using fallback:', error.message);
        secretMessageData = { messages: [CONFIG.fallbackSecretContent] };

        if (isUnlocked) {
            renderSecretContent();
        }
    }
}

function renderSecretContent() {
    if (!secretMessageData || !secretMessageData.messages || secretMessageData.messages.length === 0) {
        // Use fallback
        const { title, paragraphs, signature } = CONFIG.fallbackSecretContent;
        let html = `<h2>${title}</h2>`;
        paragraphs.forEach(para => {
            html += `<p class="secret-message">${para}</p>`;
        });
        html += `<div class="secret-signature">${signature}</div>`;
        secretContentDiv.innerHTML = html;
        messageStatus.textContent = '(Using fallback message)';
        return;
    }

    // Sequential Mode Implementation: Start from a fixed date
    const startDate = new Date('2026-02-14T00:00:00'); // User requested to start on Feb 14
    const now = new Date();

    // Calculate days passed since start date
    const diffTime = now - startDate;
    const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (dayIndex >= 0) {
        // We have messages!
        const message = secretMessageData.messages[dayIndex];

        if (message) {
            const { title, paragraphs, signature } = message;
            let html = `<h2>${title}</h2>`;
            paragraphs.forEach(para => {
                html += `<p class="secret-message">${para}</p>`;
            });
            html += `<div class="secret-signature">${signature}</div>`;
            secretContentDiv.innerHTML = html;
            messageStatus.textContent = '';
        } else {
            // Out of messages
            secretContentDiv.innerHTML = `
                <h2>To be continued... ❤️</h2>
                <p class="secret-message">Every heartbeat brings us closer. Check back soon for more secrets.</p>
                <div class="secret-signature">— Always yours</div>
            `;
            messageStatus.textContent = '';
        }
    } else {
        // Not yet Feb 13
        secretContentDiv.innerHTML = `
            <h2>Hearts in Sync... ❤️</h2>
            <p class="secret-message">The heartbeat is counting down. Your secret journey officially begins on Valentine's Day.</p>
            <div class="secret-signature">— Always yours</div>
        `;
        messageStatus.textContent = '';
    }
}

// ===== TIME-BASED MESSAGES =====
function setupTimeBasedMessages() {
    messages.forEach((message, index) => {
        if (!message) return; // Safety check

        // Show message
        setTimeout(() => {
            // Check if a click message is active - if so, skip this reveal for priority
            if (isClickMessageActive) return;

            message.classList.add('visible');
            isTimedMessageActive = true;
            pauseIdleWordRotation(); // Pause idle words during timed reveals
        }, CONFIG.messageTimings[index]);

        // Fade out message
        setTimeout(() => {
            message.classList.add('fade-out');
            message.classList.remove('visible');

            // Resume idle words after last timed message only
            if (index === messages.length - 1) {
                setTimeout(() => {
                    isTimedMessageActive = false;
                    resumeIdleWordRotation();
                }, 1500);
            }
        }, CONFIG.messageTimings[index] + CONFIG.messageDuration);
    });
}

// ===== HEART CLICK INTERACTION =====
function setupHeartClick() {
    const handleHeartClick = (e) => {
        // Prevent click if clicking on lock
        if (e.target.closest('.lock-icon')) return;

        // Debounce clicks (prevent animation stacking)
        if (isHeartClickDebounced) return;
        isHeartClickDebounced = true;

        // Add skip animation
        if (heart) {
            heart.classList.add('skip');
            setTimeout(() => {
                heart.classList.remove('skip');
            }, 800);
        }

        // Show click message
        showClickMessage();
        SoundManager.playClick();

        // Reset debounce after animation completes
        setTimeout(() => {
            isHeartClickDebounced = false;
        }, 300); // Short debounce window
    };

    if (heart) {
        heart.addEventListener('click', handleHeartClick);

        // Keyboard support
        heart.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHeartClick(e);
            }
        });
    }
}

function showClickMessage() {
    if (!clickMessage) return; // Safety check

    const message = CONFIG.clickWords[currentClickMessageIndex];
    clickMessage.textContent = message;
    clickMessage.classList.add('show');

    // Set active state to block idle words
    isClickMessageActive = true;

    // Pause idle word rotation immediately
    pauseIdleWordRotation();

    // Also hide any current timed messages immediately for priority
    messages.forEach(m => m.classList.remove('visible', 'fade-out'));

    setTimeout(() => {
        if (clickMessage) clickMessage.classList.remove('show');

        // DELAY: Wait 3 seconds after message is gone before allowing idle words
        setTimeout(() => {
            isClickMessageActive = false; // Release block
            resumeIdleWordRotation();
        }, 3000);
    }, 2000);

    // Cycle to next message
    currentClickMessageIndex = (currentClickMessageIndex + 1) % CONFIG.clickWords.length;

    // Persist click index
    saveUserPreferences();
}

// ===== COORDINATION STATE (Additional) =====

// ===== SEARCH BAR =====
function setupSearchBar() {
    const searchBar = document.getElementById('pageSearchBar');
    if (!searchBar || !searchContainer) return;

    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            let query = searchBar.value.trim();
            if (!query) return;

            const isDomain = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(query);

            if (!query.startsWith('http://') && !query.startsWith('https://') && !query.startsWith('file://')) {
                if (isDomain && !query.includes(' ')) {
                    query = 'https://' + query;
                } else {
                    query = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                }
            }
            window.location.href = query;
        }
    });

    // Initialize Shortcuts
    ShortcutManager.init();
}

// ===== SHORTCUT MANAGER (Speed Dial) =====
const ShortcutManager = {
    defaults: [
        { name: "YouTube", url: "https://youtube.com", icon: "https://cdn.simpleicons.org/youtube/FF0000" },
        { name: "Spotify", url: "https://open.spotify.com", icon: "https://cdn.simpleicons.org/spotify/1DB954" },
        { name: "ChatGPT", url: "https://chatgpt.com", icon: "https://cdn.simpleicons.org/openai/412991" },
        { name: "Gmail", url: "https://mail.google.com", icon: "https://cdn.simpleicons.org/gmail/EA4335" },
        { name: "Netflix", url: "https://netflix.com", icon: "https://cdn.simpleicons.org/netflix/E50914" },
        { name: "Discord", url: "https://discord.com", icon: "https://cdn.simpleicons.org/discord/5865F2" },
        { name: "Reddit", url: "https://reddit.com", icon: "https://cdn.simpleicons.org/reddit/FF4500" },
        { name: "Instagram", url: "https://instagram.com", icon: "https://cdn.simpleicons.org/instagram/E4405F" },
        { name: "Prime Video", url: "https://www.primevideo.com", icon: "https://cdn.simpleicons.org/primevideo/00A8E1" },
        { name: "X", url: "https://twitter.com", icon: "https://cdn.simpleicons.org/x/000000", invert: true },
        { name: "GitHub", url: "https://github.com", icon: "https://cdn.simpleicons.org/github/181717", invert: true },
        { name: "Twitch", url: "https://twitch.tv", icon: "https://cdn.simpleicons.org/twitch/9146FF" }
    ],
    items: [],

    init() {
        this.load();
        this.setupModal();
        this.render();
    },

    load() {
        const saved = localStorage.getItem('heartbeat_shortcuts');
        if (saved) {
            try {
                let items = JSON.parse(saved);
                // Migration: Update Amazon to Prime Video and fix old URLs
                this.items = items.map(item => {
                    if (item.name === "Amazon") return this.defaults.find(d => d.name === "Prime Video");
                    if (item.name === "ChatGPT") return this.defaults.find(d => d.name === "ChatGPT");
                    return item;
                });
            } catch (e) {
                this.items = [...this.defaults];
            }
        } else {
            this.items = [...this.defaults];
        }
    },

    save() {
        localStorage.setItem('heartbeat_shortcuts', JSON.stringify(this.items));
        this.render();
    },

    add(name, url) {
        if (!url.startsWith('http')) url = 'https://' + url;

        let domain;
        try {
            domain = new URL(url).hostname;
        } catch (e) {
            domain = url;
        }

        // Automatic Icon Fetching via Google Facivon API
        const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        this.items.push({ name, url, icon });
        this.save();
    },

    render() {
        const grid = document.getElementById('speedDialGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.items.forEach((item) => {
            const a = document.createElement('a');
            a.href = item.url;
            a.target = "_blank";
            a.className = "quick-link";
            a.title = item.name;

            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = item.name;

            // Robust Fallback: if SimpleIcons or others fail, use Google Favicon API
            img.onerror = () => {
                try {
                    const domain = new URL(item.url).hostname;
                    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                } catch (e) {
                    img.src = 'https://www.google.com/s2/favicons?domain=amazon.com&sz=64'; // Extreme fallback
                }
                img.onerror = null;
            };

            if (item.invert) {
                img.classList.add('invert-icon');
            }

            const span = document.createElement('span');
            span.textContent = item.name;

            a.appendChild(img);
            a.appendChild(span);
            grid.appendChild(a);
        });

        // Add "+" Button
        const addBtn = document.createElement('button');
        addBtn.className = "quick-link add-shortcut-btn";
        addBtn.innerHTML = "<span>+</span>";
        addBtn.title = "Add Shortcut";
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openModal();
        });

        // Ensure "Add" button works even when container has pointer-events: none by default
        // The container handles pointer-events via CSS hover, so this is fine.

        grid.appendChild(addBtn);
    },

    setupModal() {
        const modal = document.getElementById('addLinkModal');
        const closeBtn = document.getElementById('closeAddLink');
        const saveBtn = document.getElementById('saveLinkBtn');
        const nameInput = document.getElementById('linkName');
        const urlInput = document.getElementById('linkUrl');

        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        if (saveBtn) saveBtn.onclick = () => {
            if (nameInput.value && urlInput.value) {
                this.add(nameInput.value, urlInput.value);
                modal.classList.remove('active');
                nameInput.value = '';
                urlInput.value = '';
            }
        };

        // Close on click outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    },

    openModal() {
        const modal = document.getElementById('addLinkModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('linkName').focus();
        }
    }
};

// ===== IDLE WORD ROTATION SYSTEM =====

function startIdleWordRotation() {
    // Strict check: DO NOT show if Timed Message OR Click Message is active
    if (isIdleWordPaused || isTimedMessageActive || isClickMessageActive) return;

    // Display current idle word
    showIdleWord();
}

function showIdleWord() {
    // Re-check state before showing
    if (isIdleWordPaused || isTimedMessageActive || isClickMessageActive) return;

    if (!idleWord) return; // Safety check

    const word = CONFIG.idleWords[currentIdleWordIndex];
    idleWord.textContent = word;
    idleWord.classList.add('show');

    // Schedule fade out
    idleWordFadeTimeout = setTimeout(() => {
        if (idleWord) idleWord.classList.remove('show');

        // Move to next word and schedule next display
        idleWordTimeout = setTimeout(() => {
            currentIdleWordIndex = (currentIdleWordIndex + 1) % CONFIG.idleWords.length;
            startIdleWordRotation(); // Recursively call start to re-verify state
        }, CONFIG.idleWordFadeTime);
    }, CONFIG.idleWordDuration);
}

function pauseIdleWordRotation() {
    isIdleWordPaused = true;
    if (idleWord) idleWord.classList.remove('show');
    if (searchContainer) searchContainer.classList.remove('visible');
    clearTimeout(idleWordTimeout);
    clearTimeout(idleWordFadeTimeout);
}

function resumeIdleWordRotation() {
    isIdleWordPaused = false;
    // Only restart if the coast is clear (no timed msg, no click msg)
    if (!isTimedMessageActive && !isClickMessageActive) {
        startIdleWordRotation();
    }
}


// ===== LOCK & UNLOCK SYSTEM =====
function setupLockClick() {
    if (!lockIcon || !unlockModal) return; // Safety check

    const handleLockClick = () => {
        if (!isUnlocked) {
            // Open unlock modal
            if (unlockModal && secretInput) {
                unlockModal.classList.add('active');
                secretInput.value = '';
                if (errorMsg) errorMsg.classList.remove('show');
                requestAnimationFrame(() => {
                    setTimeout(() => secretInput.focus(), 150);
                });
            }
        } else {
            // ALREADY UNLOCKED: Relock it
            isUnlocked = false;
            document.body.classList.remove('unlocked');
            if (lockIcon) lockIcon.classList.remove('unlocked');

            // Hide secret area
            if (secretArea) {
                secretArea.classList.remove('visible');
            }

            saveUserPreferences();
            console.log('🔒 Secret area relocked');
        }
    };

    lockIcon.addEventListener('click', handleLockClick);

    // Keyboard support
    lockIcon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLockClick();
        }
    });
}

function setupUnlockModal() {
    if (!unlockModal) return; // Safety check

    if (closeUnlock) {
        closeUnlock.addEventListener('click', closeModal);
    }

    if (submitSecret) {
        submitSecret.addEventListener('click', checkSecret);
    }

    if (secretInput) {
        secretInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkSecret();
            }
        });

        // Clear error on input
        secretInput.addEventListener('input', () => {
            if (errorMsg) errorMsg.classList.remove('show');
        });
    }

    // Close modal when clicking outside
    unlockModal.addEventListener('click', (e) => {
        if (e.target === unlockModal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && unlockModal && unlockModal.classList.contains('active')) {
            closeModal();
        }
    });
}

function closeModal() {
    if (!unlockModal) return;
    unlockModal.classList.remove('active');
    if (secretInput) secretInput.value = '';
    if (errorMsg) errorMsg.classList.remove('show');
}

function checkSecret() {
    if (!secretInput) return;

    const input = secretInput.value.toLowerCase().trim();

    if (input === CONFIG.secretPassword) {
        // Correct password
        isUnlocked = true;
        SoundManager.playUnlock();
        document.body.classList.add('unlocked');
        if (lockIcon) lockIcon.classList.add('unlocked');
        closeModal();
        saveUserPreferences();

        // Render secret content
        renderSecretContent();

        // Show secret area with delay
        if (secretArea) {
            setTimeout(() => {
                secretArea.classList.add('visible');
            }, 500);
        }
    } else {
        // Wrong password - show error feedback
        if (errorMsg) {
            errorMsg.textContent = 'Not quite... try again 💭';
            errorMsg.classList.add('show');
        }
        secretInput.value = '';
        secretInput.focus();

        // Shake animation for feedback
        const unlockContent = unlockModal?.querySelector('.unlock-content');
        if (unlockContent) {
            unlockContent.classList.add('shake-error');
            setTimeout(() => {
                unlockContent.classList.remove('shake-error');
            }, 500);
        }
    }
}

// ===== PROXIMITY EFFECT =====
function setupProximityEffect() {
    if (!heart || !heartSvg || !heartGlow) return; // Safety check

    let lastDistance = CONFIG.proximityThreshold;

    function updateProximity(e) {
        if (!heart || !heartSvg || !heartGlow) return;

        const heartRect = heart.getBoundingClientRect();
        const heartCenterX = heartRect.left + heartRect.width / 2;
        const heartCenterY = heartRect.top + heartRect.height / 2;

        // Get cursor/touch position
        const cursorX = e.clientX || (e.touches && e.touches[0]?.clientX);
        const cursorY = e.clientY || (e.touches && e.touches[0]?.clientY);

        if (!cursorX || !cursorY) return;

        // Calculate distance
        const deltaX = cursorX - heartCenterX;
        const deltaY = cursorY - heartCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Normalize distance (0 = on heart, 1 = far away)
        const targetNormalizedDistance = Math.min(distance / CONFIG.proximityThreshold, 1);

        // Smooth interpolation (lerp) to prevent jittery updates
        const lerpFactor = 0.15; // Lower = smoother, higher = more responsive
        currentProximityValue += (targetNormalizedDistance - currentProximityValue) * lerpFactor;

        // Calculate animation speed (closer = faster)
        const animationDuration = CONFIG.baseAnimationDuration -
            (CONFIG.baseAnimationDuration - CONFIG.minAnimationDuration) * (1 - currentProximityValue);

        // Update animation speed for SVG heart
        heartSvg.style.animationDuration = `${animationDuration}ms`;
        heartGlow.style.animationDuration = `${animationDuration}ms`;

        // Update glow intensity based on proximity
        const glowIntensity = 0.6 + (1 - currentProximityValue) * 0.4;
        heartGlow.style.opacity = glowIntensity;

        lastDistance = distance;
    }

    // Mouse move
    document.addEventListener('mousemove', updateProximity);

    // Touch move (for mobile)
    document.addEventListener('touchmove', updateProximity);

    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        if (heartSvg && heartGlow) {
            heartSvg.style.animationDuration = `${CONFIG.baseAnimationDuration}ms`;
            heartGlow.style.animationDuration = `${CONFIG.baseAnimationDuration}ms`;
            heartGlow.style.opacity = '0.6';
            currentProximityValue = 1; // Reset to far away
        }
    });
}

// ===== KEYBOARD ACCESSIBILITY =====
function setupKeyboardAccessibility() {
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = [heart, lockIcon, ...wallpaperButtons];

    interactiveElements.forEach(el => {
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }
    });
}

// ===== REDUCED MOTION SUPPORT =====
function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Disable animations
        document.body.style.setProperty('--animation-duration', '0s');
        console.log('ℹ️ Reduced motion preference detected - animations disabled');
    }

    // Listen for changes
    prefersReducedMotion.addEventListener('change', () => {
        if (prefersReducedMotion.matches) {
            document.body.style.setProperty('--animation-duration', '0s');
        } else {
            document.body.style.removeProperty('--animation-duration');
        }
    });
}

/* ===== SOUND SYSTEM (Web Audio API) ===== */
const SoundManager = {
    ctx: null,
    isMuted: true,

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.loadState();
            this.updateUI();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveState();
        this.resume();
        this.updateUI();

        // Play a test sound if unmuting
        if (!this.isMuted) {
            this.playClick();
        }

        return this.isMuted;
    },

    updateUI() {
        // No dashboard UI update needed, handled by global sync
    },

    saveState() {
        localStorage.setItem('heartbeat_muted', this.isMuted);
    },

    loadState() {
        const saved = localStorage.getItem('heartbeat_muted');
        // Default to muted (true) if not set, or use saved value
        this.isMuted = saved === null ? true : saved === 'true';
    },

    playTone(freq, type, duration, volume = 0.1, startTime = 0) {
        if (this.isMuted || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime + startTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration + 0.1);
    },

    playClick() {
        // Soft "droplet" sound (sine waves) - Louder
        this.playTone(300, 'sine', 0.15, 0.15);
        this.playTone(500, 'sine', 0.1, 0.1, 0.05);
    },

    playUnlock() {
        // Magical chime (ascending major chord) - Louder
        this.playTone(261.63, 'sine', 0.6, 0.1, 0);    // C4
        this.playTone(329.63, 'sine', 0.6, 0.1, 0.1);  // E4
        this.playTone(392.00, 'sine', 0.6, 0.1, 0.2);  // G4
        this.playTone(523.25, 'sine', 1.0, 0.15, 0.3);  // C5
    }
};

/* ===== UI CONTROLS ===== */
function setupControls() {
    const toggleSound = document.getElementById('toggleSound');
    const toggleBreathing = document.getElementById('toggleBreathing');
    const breathingGuide = document.getElementById('breathingGuide');

    // Sound Toggle
    if (toggleSound) {
        toggleSound.addEventListener('click', () => {
            SoundManager.toggleMute();
        });
    }

    // Breathing System
    window.BreathingMode = {
        isActive: false,
        toggle() {
            this.isActive = !this.isActive;
            const breathingGuide = document.getElementById('breathingGuide');

            if (breathingGuide) {
                breathingGuide.classList.toggle('active', this.isActive);
            }
            document.body.classList.toggle('breathing-active', this.isActive);

            // Play sound if starting
            if (this.isActive && typeof SoundManager !== 'undefined' && !SoundManager.isMuted) {
                SoundManager.playClick();
            }

            return this.isActive;
        }
    };

    if (toggleBreathing) {
        toggleBreathing.addEventListener('click', () => {
            window.BreathingMode.toggle();
        });
    }
}

/* ===== TIMER WIDGET (Countdown) ===== */
const TimerManager = {
    interval: null,
    totalSeconds: 300, // Default 5m
    remainingSeconds: 300,
    isRunning: false,

    init() {
        this.display = document.getElementById('timerDisplay');
        this.btnToggle = document.getElementById('timerToggle');
        this.btnReset = document.getElementById('timerReset');
        this.customInput = document.getElementById('timerCustom');
        this.presetBtns = document.querySelectorAll('.preset-btn');

        if (this.btnToggle) this.btnToggle.addEventListener('click', () => this.toggle());
        if (this.btnReset) this.btnReset.addEventListener('click', () => this.reset());

        if (this.customInput) {
            this.customInput.addEventListener('change', () => {
                const mins = parseInt(this.customInput.value);
                if (mins > 0) this.setTime(mins * 60);
            });
        }

        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const secs = parseInt(btn.dataset.time);
                this.setTime(secs);
            });
        });

        this.updateDisplay();
    },

    setTime(secs) {
        this.pause();
        this.totalSeconds = secs;
        this.remainingSeconds = secs;
        this.updateDisplay();
    },

    toggle() {
        if (this.isRunning) this.pause();
        else this.start();
    },

    start() {
        if (this.isRunning || this.remainingSeconds <= 0) return;
        this.isRunning = true;
        this.btnToggle.textContent = 'Pause';
        this.display.classList.remove('finished');

        this.interval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (this.remainingSeconds <= 0) {
                this.finish();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        if (this.btnToggle) this.btnToggle.textContent = 'Start';
        clearInterval(this.interval);
    },

    reset() {
        this.pause();
        this.remainingSeconds = this.totalSeconds;
        this.display.classList.remove('finished');
        this.updateDisplay();
    },

    finish() {
        this.pause();
        this.display.classList.add('finished');
        if (typeof SoundManager !== 'undefined' && !SoundManager.isMuted) {
            SoundManager.playUnlock();
        }
    },

    updateDisplay() {
        if (!this.display) return;
        const m = Math.floor(this.remainingSeconds / 60);
        const s = this.remainingSeconds % 60;
        this.display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        // Visual feedback when low
        if (this.remainingSeconds < 10 && this.remainingSeconds > 0) {
            this.display.style.color = 'var(--heart-color-end)';
        } else {
            this.display.style.color = '';
        }
    }
};

/* ===== TODO WIDGET ===== */
const TodoManager = {
    tasks: [],

    init() {
        this.list = document.getElementById('todoList');
        this.input = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addTodoBtn');

        this.load();
        this.render();

        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.addTask());
        }

        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }

        // Event delegation for delete/toggle
        if (this.list) {
            this.list.addEventListener('click', (e) => {
                if (e.target.closest('.delete-task')) {
                    const id = Number(e.target.closest('.todo-item').dataset.id);
                    this.deleteTask(id);
                } else if (e.target.classList.contains('todo-checkbox')) {
                    const id = Number(e.target.closest('.todo-item').dataset.id);
                    this.toggleTask(id);
                }
            });
        }
    },

    addTask() {
        const text = this.input.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false
        };

        this.tasks.push(task);
        this.save();
        this.render();
        this.input.value = '';
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    },

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
        }
    },

    render() {
        if (!this.list) return;
        this.list.innerHTML = '';

        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button class="delete-task" title="Delete">&times;</button>
            `;
            this.list.appendChild(li);
        });
    },

    save() {
        localStorage.setItem('heartbeat_todos', JSON.stringify(this.tasks));
    },

    load() {
        const saved = localStorage.getItem('heartbeat_todos');
        if (saved) {
            try {
                this.tasks = JSON.parse(saved);
            } catch (e) { console.error('Error loading todos', e); }
        }
    }
};

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', init);
