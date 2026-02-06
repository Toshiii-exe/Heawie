# 🫀 Heartbeat - Quick Start Guide

## 🌐 Website (Enhanced)

### **Instant Use**
1. Open `index.html` in any modern browser
2. The heartbeat starts immediately with Spring theme
3. All features work offline

### **Exploring Seasons**
- **Right sidebar**: 4 season buttons (🌸 ☀️ 🍂 ❄️)
- **Hover** over any season to see 3 variants
- **Click** a variant to change the theme instantly
- Your choice is **saved automatically**

### **All Original Features Still Work**
- Move cursor close to heart → beats faster
- Click heart → romantic messages appear
- Wait 10s/25s/45s → time-based messages
- Click lock icon → enter "juwie" → secret unlocks

### **New Features**
- **12 themes**: 4 seasons × 3 variants each
- **Pixel art backgrounds**: Procedurally generated
- **Dynamic messages**: Edit `messages.json` anytime
- **Persistent**: Returns to your last theme

---

## 🖥️ Desktop Browser App

### **Build & Install (One-Time Setup)**

#### Step 1: Install Node.js
- Download from https://nodejs.org/
- Choose LTS version
- Install with default settings
- Restart computer

#### Step 2: Setup Project
```powershell
# Navigate to browser-app folder
cd C:\Users\santh\OneDrive\Desktop\Heawie\browser-app

# Install dependencies (takes 2-3 minutes)
npm install

# Copy Heartbeat files
New-Item -ItemType Directory -Force -Path heartbeat
Copy-Item ..\index.html heartbeat\
Copy-Item ..\styles.css heartbeat\
Copy-Item ..\script.js heartbeat\
Copy-Item ..\messages.json heartbeat\
```

#### Step 3: Test (Optional but Recommended)
```powershell
npm start
```
This opens the browser app in development mode. Test all features work.

#### Step 4: Build Windows Executable
```powershell
npm run build:win
```
Wait 3-5 minutes. Output: `dist/Heartbeat Browser Setup 1.0.0.exe`

#### Step 5: Install
- Double-click `Heartbeat Browser Setup 1.0.0.exe`
- Choose installation location
- Click Install
- Launch from Start Menu or Desktop

### **Using the Browser**
- **Home button** (heart icon): Returns to Heartbeat
- **Address bar**: Type URLs or search queries
- **Back/Forward**: Navigate like any browser
- **Heartbeat**: Works exactly like the website

---

## 📝 Updating Secret Messages

### **Edit messages.json**
```json
{
  "messages": [
    {
      "title": "For Juwie 💕",
      "paragraphs": [
        "Your message here...",
        "Another paragraph..."
      ],
      "signature": "— Your signature",
      "timestamp": "2026-01-28T20:00:00Z"
    }
  ]
}
```

### **Add New Messages**
Just add more objects to the array:
```json
{
  "messages": [
    { /* message 1 */ },
    { /* message 2 */ },
    { /* message 3 - newest */ }
  ]
}
```

### **Modes**
In `script.js` line 18:
- `messageFetchMode: 'latest'` - Shows newest message
- `messageFetchMode: 'random'` - Shows random message

### **For GitHub Pages**
1. Push `messages.json` to your repo
2. Site auto-fetches with cache-busting
3. No rebuild needed!

---

## 🎨 Season Guide

### 🌸 **Spring** (Fresh & Awakening)
- **Early**: Light green grass, soft pink flowers
- **Bloom**: Full bloom, vibrant pinks
- **Late**: Lush greenery, yellow-green

### ☀️ **Summer** (Bright & Warm)
- **Sunset**: Warm oranges, romantic glow
- **Day**: Bright blue sky, golden sun
- **Midnight**: Deep blue, stars, purple nebula

### 🍂 **Autumn** (Cozy & Rich)
- **Golden**: Gold/orange falling leaves
- **Harvest**: Deep reds, earth tones
- **Deep**: Dark browns, maroons

### ❄️ **Winter** (Calm & Magical)
- **Snowy**: White snowflakes, pale blue
- **Aurora**: Northern lights (green/purple/blue)
- **Frost**: Ice crystals, turquoise

---

## 🔧 Troubleshooting

### Website Issues

**Pixel art not showing**
- Hard refresh: `Ctrl + F5`
- Clear browser cache
- Try different browser

**Messages not loading**
- Check `messages.json` is in same folder
- Check JSON syntax (use jsonlint.com)
- Check browser console (F12)

**Theme not saving**
- Check localStorage is enabled
- Check browser isn't in private mode
- Try different browser

### Desktop App Issues

**"npm: command not found"**
- Install Node.js from nodejs.org
- Restart terminal after install
- Verify: `node --version`

**Build fails**
```powershell
# Delete and reinstall
Remove-Item -Recurse -Force node_modules
npm install
npm run build:win
```

**App won't start**
- Check all files in `heartbeat/` folder
- Run `npm start` to see errors
- Check console output

---

## 📊 File Checklist

### Website Files (Required)
- ✅ `index.html` - Main page
- ✅ `styles.css` - All styles
- ✅ `script.js` - All logic
- ✅ `messages.json` - Secret messages

### Browser App Files (Required)
- ✅ `package.json` - Dependencies
- ✅ `main.js` - Electron main
- ✅ `preload.js` - IPC bridge
- ✅ `renderer.js` - Browser logic
- ✅ `browser.html` - Browser UI
- ✅ `browser.css` - Browser styles
- ✅ `heartbeat/` folder with all 4 website files

### Optional
- 📄 `README.md` - Instructions
- 📄 `UPGRADE_SUMMARY.md` - What changed
- 🖼️ `assets/icon.ico` - App icon

---

## 💡 Pro Tips

1. **Keyboard Navigation**: Tab through all controls, Enter/Space to activate
2. **Reduced Motion**: System preference automatically disables animations
3. **Mobile**: Fully responsive, touch works like mouse proximity
4. **Offline**: Everything works without internet (except external URLs in browser)
5. **Customization**: All colors in CSS variables, easy to tweak
6. **Performance**: Pixel art auto-adjusts to screen size
7. **Accessibility**: ARIA labels, keyboard support, high contrast

---

## 🆘 Need Help?

1. Check `UPGRADE_SUMMARY.md` for detailed documentation
2. Check `browser-app/README.md` for build instructions
3. Check browser console (F12) for errors
4. Verify all files are in correct locations
5. Try in different browser

---

**Made with 💕 for Juwie**
