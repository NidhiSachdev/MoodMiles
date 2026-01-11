# Complete Step-by-Step Deployment Guide
## Deploy MoodMiles Website Using GitHub & Vercel

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account (create at https://github.com if needed)
- [ ] Vercel account (create at https://vercel.com if needed)
- [ ] All project files ready in: `C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles`

---

## 🚀 PART 1: Prepare Your Code for GitHub

### Step 1: Verify Required Files Exist

**Check these files exist in your project folder:**

- ✅ `package.json` (with `build:web` script)
- ✅ `vercel.json` (routing configuration)
- ✅ `.nvmrc` (Node version)
- ✅ `app.json` (Expo configuration)
- ✅ `scripts/copy-vercel-config.js` (build script)
- ✅ All source files (App.js, screens, etc.)

**All files have been created/updated for you!** ✅

---

## 📤 PART 2: Upload Code to GitHub

### Step 2: Initialize Git Repository (If Not Already Done)

**Open Command Prompt or Git Bash:**

1. **Press** `Win + R`
2. **Type**: `cmd` and press Enter
3. **Navigate to project**:
   ```bash
   cd "C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles"
   ```

**Check if git is initialized:**
```bash
git status
```

**If you see "not a git repository", initialize it:**
```bash
git init
```

### Step 3: Add Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status
```

**You should see files like:**
- `package.json`
- `vercel.json`
- `.nvmrc`
- `App.js`
- `app.json`
- All screen files
- etc.

### Step 4: Create First Commit

```bash
git commit -m "Initial commit: MoodMiles app ready for deployment"
```

### Step 5: Create GitHub Repository

1. **Go to**: https://github.com
2. **Sign in** to your account
3. **Click** the **"+"** icon (top right) → **"New repository"**
4. **Fill in**:
   - **Repository name**: `MoodMiles`
   - **Description**: "Staycation Planner App" (optional)
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (we're uploading existing files)
5. **Click "Create repository"**

### Step 6: Connect Local Repository to GitHub

**Copy the repository URL from GitHub** (it will show after creating repo)

**Then in Command Prompt, run:**

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/MoodMiles.git

# Verify remote was added
git remote -v
```

**Should show:**
```
origin  https://github.com/YOUR_USERNAME/MoodMiles.git (fetch)
origin  https://github.com/YOUR_USERNAME/MoodMiles.git (push)
```

### Step 7: Push Code to GitHub

```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If prompted for credentials:**
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (NOT your GitHub password)
  - Create token: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select "repo" scope
  - Copy the token and use it as password

### Step 8: Verify Upload on GitHub

1. **Go to**: https://github.com/YOUR_USERNAME/MoodMiles
2. **Verify**:
   - ✅ All files are visible
   - ✅ `package.json` exists
   - ✅ `vercel.json` exists
   - ✅ `.nvmrc` exists
   - ✅ All source files are there

---

## 🌐 PART 3: Deploy to Vercel

### Step 9: Sign Up/Login to Vercel

1. **Go to**: https://vercel.com
2. **Click "Sign Up"** (or "Log In" if you have an account)
3. **Choose "Continue with GitHub"**
4. **Authorize** Vercel to access your GitHub account

### Step 10: Import GitHub Repository

1. **After login**, you'll see the Vercel dashboard
2. **Click "Add New Project"** (or "New Project")
3. **You'll see** a list of your GitHub repositories
4. **Find** `MoodMiles` in the list
5. **Click "Import"** next to your repository

### Step 11: Configure Project Settings

**In the "Configure Project" page:**

#### Framework Preset:
- **Select**: `Other` (NOT React, NOT Next.js)

#### Root Directory:
- **Leave empty** (use root directory)

#### Build and Output Settings:

**Build Command:**
```
npm run build:web
```

**Output Directory:**
```
web-build
```

**Install Command:**
```
npm install --legacy-peer-deps
```

**Environment Variables:**
- **Leave empty** for now (add later if needed)

### Step 12: Deploy

1. **Click "Deploy"** button
2. **Wait 2-5 minutes** for build to complete
3. **Watch the build logs** - you should see:
   - ✅ Installing dependencies
   - ✅ Running `npm run build:web`
   - ✅ `npx expo export:web` running
   - ✅ Build completing successfully

---

## ✅ PART 4: Verify Deployment

### Step 13: Check Deployment Status

1. **After deployment completes**, you'll see:
   - ✅ **"Ready"** status (green)
   - ✅ **Your website URL**: `https://your-project-name.vercel.app`

### Step 14: Test Your Website

1. **Click** on your deployment
2. **Click** the **URL** (or copy it)
3. **Open** in a new browser tab
4. **Verify**:
   - ✅ Website loads without 404 errors
   - ✅ Login screen appears
   - ✅ Navigation works
   - ✅ All routes function correctly

### Step 15: Check Build Logs (If Issues)

1. **In Vercel dashboard**, click on your deployment
2. **Click "Build Logs"** tab
3. **Verify** you see:
   - ✅ `npm run build:web` running
   - ✅ `npx expo export:web` completing
   - ✅ `Copied vercel.json to web-build/` message
   - ✅ Build successful

---

## 🔧 PART 5: Troubleshooting

### Issue 1: 404 Error After Deployment

**Solution:**
1. **Verify** `vercel.json` is in your GitHub repo root
2. **Check** Build Command: `npm run build:web`
3. **Check** Output Directory: `web-build`
4. **Redeploy** after fixing

### Issue 2: Build Fails

**Check:**
1. **Build logs** - Look for error messages
2. **Verify** all files are committed to GitHub
3. **Ensure** `package.json` has `build:web` script

**Common fixes:**
- Use Build Command: `npx expo export:web && cp vercel.json web-build/vercel.json`
- Check Node version compatibility

### Issue 3: Routes Don't Work

**Solution:**
1. **Verify** `vercel.json` contains rewrites configuration
2. **Ensure** `vercel.json` is copied to `web-build` folder
3. **Redeploy** after fixing

---

## 📋 Complete Checklist

### GitHub Setup:
- [ ] Git repository initialized
- [ ] Files committed (`git commit`)
- [ ] GitHub repository created
- [ ] Local repo connected to GitHub (`git remote add origin`)
- [ ] Files pushed to GitHub (`git push`)
- [ ] All files visible on GitHub

### Vercel Setup:
- [ ] Vercel account created/logged in
- [ ] GitHub repository imported
- [ ] Framework Preset: `Other`
- [ ] Build Command: `npm run build:web`
- [ ] Output Directory: `web-build`
- [ ] Install Command: `npm install --legacy-peer-deps`
- [ ] Project deployed successfully

### Verification:
- [ ] Website loads without errors
- [ ] No 404 errors
- [ ] Login screen appears
- [ ] Navigation works
- [ ] All routes function

---

## 🎯 Quick Reference Commands

### Git Commands:
```bash
cd "C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles"

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/MoodMiles.git
git branch -M main
git push -u origin main
```

### Vercel Settings:
- **Build Command**: `npm run build:web`
- **Output Directory**: `web-build`
- **Install Command**: `npm install --legacy-peer-deps`
- **Framework Preset**: `Other`

---

## ✅ Success Indicators

**After completing all steps:**

- ✅ Your code is on GitHub
- ✅ Your website is live on Vercel
- ✅ Website URL works: `https://your-project.vercel.app`
- ✅ All features work correctly
- ✅ Automatic deployments enabled (pushes to GitHub auto-deploy)

---

## 🆘 Need Help?

**If deployment fails:**

1. **Check build logs** in Vercel dashboard
2. **Verify** all files are in GitHub
3. **Ensure** Vercel settings are correct
4. **Share** error messages for specific help

---

## 🚀 Next Steps After Deployment

1. **Share your website URL** with users
2. **Set up custom domain** (optional in Vercel settings)
3. **Monitor deployments** - every GitHub push auto-deploys
4. **Check analytics** in Vercel dashboard

---

**Follow these steps and your app will be live!** 🎉
