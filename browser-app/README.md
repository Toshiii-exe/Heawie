# 🫀 Heartbeat Browser

A minimal, privacy-focused Windows desktop browser built with Electron, featuring the Heartbeat experience as your home page.

## ✨ Features

- **🏠 Heartbeat as Home**: The beautiful Heartbeat page is your default home page
- **🔍 Smart Address Bar**: Enter URLs or search with DuckDuckGo
- **🎯 Simple Navigation**: Back, Forward, Reload, and Home buttons
- **🔒 Privacy-Focused**: Uses DuckDuckGo for searches (no tracking)
- **⚡ Fast**: Built on Chromium engine via Electron
- **🖥️ Native Windows App**: Standalone .exe installer

## 📋 Prerequisites

Before building the browser, you need:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Install with default settings
   - **Important**: Restart your computer after installation

2. **Windows 10 or 11**

## 🚀 Quick Start (Automated)

### Option 1: Use the Setup Script (Easiest)

1. Open PowerShell in the `browser-app` folder:
   - Right-click the `browser-app` folder
   - Select "Open in Terminal" or "Open PowerShell window here"

2. Run the setup script:
   ```powershell
   .\setup.bat
   ```

3. The script will:
   - Check Node.js installation
   - Install all dependencies
   - Copy Heartbeat files
   - Set everything up

4. Done! Skip to "Testing the Browser" section below.

## 🛠️ Manual Setup

### Step 1: Install Dependencies

Open PowerShell in the `browser-app` folder and run:

```powershell
npm install
```

This will take 2-3 minutes. It installs:
- Electron (the browser engine)
- electron-builder (to create Windows installers)

### Step 2: Copy Heartbeat Files

Create a `heartbeat` folder and copy the Heartbeat files:

```powershell
# Create folder
New-Item -ItemType Directory -Force -Path heartbeat

# Copy files
Copy-Item ..\index.html heartbeat\
Copy-Item ..\styles.css heartbeat\
Copy-Item ..\script.js heartbeat\
Copy-Item ..\messages.json heartbeat\
```

### Step 3: Create Icon (Optional)

1. Create an `assets` folder:
   ```powershell
   New-Item -ItemType Directory -Force -Path assets
   ```

2. Place your `icon.ico` file in the `assets` folder
   - Icon should be 256x256 px
   - Use a tool like [IcoFX](https://icofx.ro/) or online converters

## 🧪 Testing the Browser

Before building the installer, test that everything works:

```powershell
npm start
```

This will:
- Open the browser in development mode
- Load the Heartbeat page
- Allow you to test all features

**Test checklist:**
- ✅ Heartbeat page loads correctly
- ✅ Heart animation works
- ✅ Click messages appear
- ✅ Idle words rotate slowly
- ✅ Address bar accepts URLs (e.g., `https://example.com`)
- ✅ Address bar searches with DuckDuckGo (e.g., type `hello world`)
- ✅ Back/Forward buttons work
- ✅ Reload button works
- ✅ Home button (heart icon) returns to Heartbeat

Close the browser when done testing.

## 📦 Building the Windows Installer

Once testing is complete, build the production installer:

```powershell
npm run build:win
```

**What happens:**
- Takes 3-5 minutes
- Downloads Windows build tools (first time only)
- Creates the installer

**Output location:**
```
browser-app\dist\Heartbeat Browser Setup 1.0.0.exe
```

## 💻 Installing & Using

1. **Install**:
   - Navigate to `browser-app\dist\`
   - Double-click `Heartbeat Browser Setup 1.0.0.exe`
   - Follow the installation wizard
   - Choose installation location
   - Create desktop shortcut (recommended)

2. **Launch**:
   - From Start Menu: Search "Heartbeat Browser"
   - From Desktop: Double-click the shortcut
   - Opens directly to the Heartbeat page

3. **Use**:
   - Click the heart icon (Home button) anytime to return to Heartbeat
   - Type URLs in the address bar (e.g., `github.com`)
   - Type search queries (e.g., `how to make cookies`)
   - Navigate with Back/Forward buttons

## 🎨 Customization

### Change Home Page

Edit `renderer.js`, line 10:
```javascript
const HOME_URL = 'heartbeat/index.html'; // Change this
```

### Change Window Size

Edit `main.js`, lines 8-9:
```javascript
width: 1200,  // Default width
height: 800,  // Default height
```

### Change App Name

Edit `package.json`, line 24:
```json
"productName": "Heartbeat Browser",
```

### Update Version

Edit `package.json`, line 3:
```json
"version": "1.0.0",
```

## 🔧 Troubleshooting

### "Node.js is not recognized"
- Node.js is not installed or not in PATH
- **Fix**: Install Node.js from https://nodejs.org/ and restart computer

### "Cannot find module 'electron'"
- Dependencies not installed
- **Fix**: Run `npm install` in the `browser-app` folder

### Heartbeat page doesn't load
- Heartbeat files not copied correctly
- **Fix**: Check that `heartbeat` folder contains all 4 files:
  - index.html
  - styles.css
  - script.js
  - messages.json

### Build fails with "icon not found"
- Missing icon file
- **Fix**: Remove icon reference from `package.json` or add `icon.ico` to `assets` folder

### Webview is blank
- Security settings blocking content
- **Fix**: Already configured correctly in `main.js` with `webviewTag: true`

### Search doesn't work
- Check internet connection
- DuckDuckGo should open automatically
- **Fix**: Try navigating to `https://duckduckgo.com` manually

## 📁 Project Structure

```
browser-app/
├── main.js           # Electron main process (window creation)
├── preload.js        # Security bridge (IPC)
├── renderer.js       # Browser UI logic (address bar, navigation)
├── browser.html      # Browser interface
├── browser.css       # Browser styling
├── package.json      # Dependencies & build config
├── setup.bat         # Automated setup script
├── README.md         # This file
├── heartbeat/        # Heartbeat website files
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── messages.json
└── assets/           # App icon (optional)
    └── icon.ico
```

## 🔒 Security

**Privacy-focused features:**
- ✅ DuckDuckGo search (no tracking)
- ✅ Context isolation enabled
- ✅ Node integration disabled for web content
- ✅ Secure IPC communication
- ✅ No analytics or telemetry

**Security settings** (`main.js`):
```javascript
webPreferences: {
    contextIsolation: true,    // Isolates web content
    nodeIntegration: false,     // Prevents direct Node.js access
    webviewTag: true           // Allows webview for browser
}
```

## 📝 Build Configuration

The `package.json` includes complete build configuration:

```json
{
  "name": "heartbeat-browser",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win --x64"
  },
  "build": {
    "appId": "com.heartbeat.browser",
    "productName": "Heartbeat Browser",
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

## 🌟 Features Explained

### Address Bar Intelligence

The address bar automatically detects what you type:

1. **Full URL**: `https://example.com` → Opens directly
2. **Domain**: `example.com` → Adds `https://` and opens
3. **Local file**: `file:///C:/...` → Opens local file
4. **Search**: `cute cats` → Searches on DuckDuckGo

### Home Button

The heart icon (🫀) button:
- Always returns to Heartbeat
- Works from any page
- No matter how deep you navigate

### Webview vs BrowserView

This browser uses `<webview>` tag because:
- ✅ Simpler implementation
- ✅ Better isolation
- ✅ Easier to control
- ✅ Works reliably on Windows

## 🎯 What's Next?

### Suggested Enhancements

1. **Bookmarks**: Add a bookmarks bar
2. **Tabs**: Support multiple tabs
3. **Download Manager**: Handle file downloads
4. **Developer Tools**: Add DevTools shortcut (F12)
5. **Settings Page**: Customize home page, search engine
6. **Keyboard Shortcuts**: Ctrl+L for address bar, etc.

### Version Updates

When updating Heartbeat:
1. Edit the Heartbeat files in the main folder
2. Copy updated files to `browser-app/heartbeat/`
3. Test with `npm start`
4. Rebuild with `npm run build:win`

## 💡 Tips

- **Development**: Use `npm start` for quick testing
- **Production**: Use `npm run build:win` for distributable installer
- **Updates**: Just overwrite the `heartbeat` folder and rebuild
- **Clean Build**: Delete `node_modules` and `dist` folders, then run `npm install` again

## 🆘 Support

If you run into issues:

1. Check this README thoroughly
2. Verify Node.js is installed: `node --version`
3. Check all files are in the right place
4. Try running `npm install` again
5. Delete `node_modules` and `dist` folders and start fresh

## 📜 License

MIT License - Feel free to modify and distribute

---

**Made with 💕 by the Heartbeat team**

Enjoy your personal Heartbeat browser! 🫀✨
