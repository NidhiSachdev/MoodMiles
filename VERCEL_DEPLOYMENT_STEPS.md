# Vercel Deployment - Step by Step Guide

## 🎯 Goal: Deploy MoodMiles Website on Vercel

**Your code is now on GitHub! Let's deploy it to Vercel.**

---

## ✅ PART 1: Sign Up/Login to Vercel

### Step 1: Go to Vercel

1. **Open browser**
2. **Go to**: https://vercel.com
3. **Click "Sign Up"** (or "Log In" if you have an account)

### Step 2: Connect GitHub Account

1. **Choose "Continue with GitHub"**
2. **Authorize** Vercel to access your GitHub account
3. **Complete** sign up process

**You'll be redirected to Vercel dashboard.**

---

## ✅ PART 2: Import Your GitHub Repository

### Step 3: Add New Project

1. **In Vercel dashboard**, click **"Add New Project"** button
   (or "New Project" if you see it)

2. **You'll see** a list of your GitHub repositories

### Step 4: Find and Import MoodMiles

1. **Look for** `MoodMiles` in the repository list
2. **Click "Import"** next to `MoodMiles`

**If you don't see MoodMiles:**
- Click "Adjust GitHub App Permissions"
- Make sure repositories are accessible
- Refresh the page

---

## ✅ PART 3: Configure Project Settings

### Step 5: Project Configuration Page

**You'll see "Configure Project" page. Fill in these settings:**

#### Framework Preset:
- **Click dropdown**
- **Select**: `Other`
- **NOT** React, Next.js, or any other preset

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

### Step 6: Review Settings

**Before deploying, verify:**
- ✅ Framework Preset: `Other`
- ✅ Build Command: `npm run build:web`
- ✅ Output Directory: `web-build`
- ✅ Install Command: `npm install --legacy-peer-deps`

---

## ✅ PART 4: Deploy

### Step 7: Start Deployment

1. **Click "Deploy"** button (bottom of page)
2. **Wait 2-5 minutes** for build to complete
3. **Watch the build logs** - you'll see:
   - Installing dependencies
   - Running build command
   - Building your app
   - Deployment progress

### Step 8: Monitor Build Process

**During build, you'll see:**
- ✅ Installing dependencies (npm install)
- ✅ Running build command (npm run build:web)
- ✅ Building web app (expo export:web)
- ✅ Copying vercel.json
- ✅ Deployment completing

**If build fails:**
- Check build logs for errors
- See troubleshooting section below

---

## ✅ PART 5: Verify Deployment

### Step 9: Check Deployment Status

**After deployment completes:**

1. **You'll see**:
   - ✅ **"Ready"** status (green checkmark)
   - ✅ **Your website URL**: `https://moodmiles-xxxxx.vercel.app`
   - ✅ **Deployment details**

### Step 10: Test Your Website

1. **Click** on your deployment
2. **Click** the **URL** (or copy it)
3. **Open** in a new browser tab
4. **Verify**:
   - ✅ Website loads without 404 errors
   - ✅ Login screen appears
   - ✅ Navigation works
   - ✅ All routes function correctly

---

## 🔧 PART 6: Troubleshooting

### Issue 1: Build Fails

**Check build logs:**
1. **Click** on failed deployment
2. **Click "Build Logs"** tab
3. **Look for** error messages

**Common fixes:**
- Verify Build Command: `npm run build:web`
- Verify Output Directory: `web-build`
- Check if `package.json` has `build:web` script
- Ensure `vercel.json` is in GitHub repo

### Issue 2: 404 Error After Deployment

**Solution:**
1. **Verify** `vercel.json` is in GitHub repo root
2. **Check** Build Command includes copying vercel.json
3. **Redeploy** after fixing

### Issue 3: Routes Don't Work

**Solution:**
1. **Verify** `vercel.json` has rewrites configuration
2. **Ensure** vercel.json is copied to web-build folder
3. **Redeploy**

---

## 📋 Complete Checklist

### Before Deployment:
- [ ] Code is on GitHub
- [ ] GitHub repository is accessible
- [ ] Vercel account created
- [ ] GitHub connected to Vercel

### During Configuration:
- [ ] Framework Preset: `Other`
- [ ] Build Command: `npm run build:web`
- [ ] Output Directory: `web-build`
- [ ] Install Command: `npm install --legacy-peer-deps`

### After Deployment:
- [ ] Deployment status: "Ready"
- [ ] Website URL works
- [ ] No 404 errors
- [ ] Login screen appears
- [ ] Navigation works

---

## 🎯 Quick Reference

**Vercel Settings:**
- **Framework Preset**: `Other`
- **Build Command**: `npm run build:web`
- **Output Directory**: `web-build`
- **Install Command**: `npm install --legacy-peer-deps`

**Your Website URL:**
- Format: `https://moodmiles-xxxxx.vercel.app`
- Or custom domain (if configured)

---

## 🚀 Next Steps After Deployment

1. **Share your website URL** with users
2. **Set up custom domain** (optional in Vercel settings)
3. **Monitor deployments** - every GitHub push auto-deploys
4. **Check analytics** in Vercel dashboard

---

## ✅ Success Indicators

**After successful deployment:**

- ✅ Website loads successfully
- ✅ No 404 errors
- ✅ All routes work
- ✅ Login screen appears
- ✅ Navigation functions correctly
- ✅ Automatic deployments enabled (pushes to GitHub auto-deploy)

---

**Follow these steps and your website will be live!** 🎉
