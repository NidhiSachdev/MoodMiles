# Fix: expo export:web Error - Use expo export Instead

## 🚨 Error: expo export:web can only be used with Webpack

**Your project uses Metro bundler, not Webpack. Need to use `expo export` instead.**

---

## ✅ Solution: Update Build Command

**I've updated your `package.json` build script:**

**Changed from:**
```json
"build:web": "npx expo export:web && cp vercel.json web-build/vercel.json"
```

**Changed to:**
```json
"build:web": "npx expo export --platform web && cp vercel.json dist/vercel.json"
```

**Also need to update Vercel Output Directory:**
- **Change from**: `web-build`
- **Change to**: `dist`

---

## 📤 Step 1: Commit and Push Updated package.json

**Run these commands:**

```bash
cd "C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles"

# Add updated package.json
git add package.json

# Commit
git commit -m "Fix: Use expo export instead of expo export:web"

# Push to GitHub
git push origin main
```

---

## ⚙️ Step 2: Update Vercel Settings

**After pushing, update Vercel:**

1. **Go to**: Vercel Dashboard → Your Project → **Settings** → **General**
2. **Build & Development Settings**:
   - **Build Command**: `npm run build:web` (already correct)
   - **Output Directory**: Change to `dist` (was `web-build`)
   - **Install Command**: `npm install --legacy-peer-deps` (keep as is)
3. **Click "Save"**

---

## 🔄 Step 3: Redeploy

**After updating settings:**

1. **Vercel Dashboard** → **Deployments** tab
2. **Click "Redeploy"** on latest deployment
3. **Wait** for build to complete

---

## ✅ What Changed

**Build Command:**
- **Old**: `npx expo export:web` (Webpack only)
- **New**: `npx expo export --platform web` (Works with Metro)

**Output Directory:**
- **Old**: `web-build`
- **New**: `dist` (Expo's default output)

---

## 🔍 Verify Fix

**After redeploying, build logs should show:**
- ✅ `npx expo export --platform web` running
- ✅ Building web app successfully
- ✅ Deployment completing

**Should NOT see:**
- ❌ "expo export:web can only be used with Webpack"
- ❌ "CommandError"

---

## 📋 Quick Checklist

- [ ] Updated package.json committed and pushed
- [ ] Vercel Output Directory changed to `dist`
- [ ] Vercel settings saved
- [ ] Redeployed
- [ ] Build succeeds

---

## 🎯 Quick Fix Summary

1. **Push updated package.json** (commands above)
2. **Update Vercel Output Directory** to `dist`
3. **Redeploy**

---

**The package.json has been updated. Push it and update Vercel settings!** 🚀
