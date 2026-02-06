const fs = require('fs');
const path = require('path');
try {
    const debugInfo = {
        execPath: process.execPath,
        versions: process.versions,
        env: {
            ELECTRON_RUN_AS_NODE: process.env.ELECTRON_RUN_AS_NODE,
            ELECTRON_NO_ATTACH_CONSOLE: process.env.ELECTRON_NO_ATTACH_CONSOLE
        },
        electronRequire: typeof require('electron'),
        electronRequireValue: require('electron') // might be string or object
    };
    fs.writeFileSync(path.join(__dirname, 'debug_log.txt'), JSON.stringify(debugInfo, null, 2));
} catch (e) {
    // ignore
}

const { app, BrowserWindow, ipcMain } = require('electron');
/* const path = require('path'); */ // Already defined above

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        backgroundColor: '#1a1a2e',
        show: false
    });

    // Load the browser UI
    mainWindow.loadFile('browser.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for browser controls
ipcMain.on('navigate', (event, url) => {
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
        // Treat as search query - use DuckDuckGo
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
    }
    event.reply('navigate-to', url);
});

ipcMain.on('go-back', (event) => {
    event.reply('go-back');
});

ipcMain.on('go-forward', (event) => {
    event.reply('go-forward');
});

ipcMain.on('reload', (event) => {
    event.reply('reload');
});

ipcMain.on('go-home', (event) => {
    const homePath = path.join(__dirname, 'heartbeat', 'index.html');
    // Use file:// protocol with proper path (forward slashes on Windows)
    const homeUrl = `file:///${homePath.replace(/\\/g, '/')}`;
    event.reply('navigate-to', homeUrl);
});
