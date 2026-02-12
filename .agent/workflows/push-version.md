---
description: How to push a new version of the Heawie application to GitHub
---

Follow these steps to update the version and push it to GitHub properly:

1. **Update the App Version**
   In `browser-app/package.json`, update the `"version"` field (e.g., from `1.3.0` to `1.4.0`).
   
2. **Stage your changes**
   Run: `git add .`
   
3. **Commit your changes**
   Run: `git commit -m "Your descriptive message here"`
   
4. **Push the code to the main branch**
   Run: `git push`
   
5. **Create a new Tag (the Release)**
   Run: `git tag vX.X.X` (replace with your version, e.g., `v1.4.0`)
   
6. **Push the Tag to GitHub**
   Run: `git push origin vX.X.X`
   
7. **Official Release (GitHub UI)**
   Go to your repository on GitHub.com:
   - Click on **Tags**
   - Find your new tag and click **Create Release**
   - Click **Publish Release**
