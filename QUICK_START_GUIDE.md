# 🚀 Quick Start Guide - Heartbeat Project

## For the Heartbeat Website

### Option 1: Open Directly
1. Navigate to: `C:\Users\santh\OneDrive\Desktop\Heawie`
2. Double-click `index.html`
3. Enjoy! ✨

### What You'll See:
- ✅ Idle words rotating slowly (calm, home-like vibes)
- ✅ Click the heart → See intimate messages
- ✅ Mouse near heart → Beats faster
- ✅ Wallpaper buttons (✨🌌⭐🌠🌈) → Change themes
- ✅ Lock icon → Unlock secret area (password: "juwie")

---

## For the Desktop Browser

### Step 1: Setup (First Time Only)

Open PowerShell and run:

```powershell
cd C:\Users\santh\OneDrive\Desktop\Heawie\browser-app
.\setup.bat
```

**Wait 2-3 minutes while it:**
- Checks Node.js
- Installs dependencies
- Copies Heartbeat files

### Step 2: Test (Optional)

```powershell
npm start
```

This opens the browser in development mode. Test everything works!

### Step 3: Build Windows Installer

```powershell
npm run build:win
```

**Wait 3-5 minutes.** Output will be in:
```
C:\Users\santh\OneDrive\Desktop\Heawie\browser-app\dist\Heartbeat Browser Setup 1.0.0.exe
```

### Step 4: Install

1. Navigate to the `dist` folder
2. Double-click the installer
3. Follow the wizard
4. Launch from Start Menu!

---

## ❓ Need Help?

### "Node.js is not recognized"
Install from: https://nodejs.org/
Then restart computer and try again.

### "Cannot find module"
Run: `npm install` in the browser-app folder

### More Help
See: `browser-app\README.md` for complete documentation

---

## 📝 What's New?

### ✨ Just Implemented:
1. **Idle Word Rotation** - 50 calm words cycle slowly
2. **Click Messages** - 50 intimate messages on heart clicks
3. **Click Index Persistence** - Remembers your place
4. **Desktop Browser** - Complete Windows app
5. **DuckDuckGo Search** - Privacy-focused search
6. **Full Documentation** - Everything you need

---

## 🎯 Next Steps (Optional)

### Customize the Browser:
1. Add your own icon: `browser-app\assets\icon.ico`
2. Change window size: Edit `browser-app\main.js`
3. Update version: Edit `browser-app\package.json`

### Share Your Browser:
- The .exe installer is portable
- Share it with friends
- They can install and use it immediately

---

**Enjoy your Heartbeat experience! 🫀💕**

Made with love on January 28, 2026
