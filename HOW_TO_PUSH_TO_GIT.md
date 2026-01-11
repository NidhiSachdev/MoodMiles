# How to Push Files to GitHub - Step by Step

## 🚀 Quick Guide: Push Your Files to GitHub

---

## ✅ Step 1: Open Command Prompt

1. **Press** `Win + R`
2. **Type**: `cmd`
3. **Press** Enter

---

## ✅ Step 2: Navigate to Your Project

**Copy and paste this command:**

```bash
cd "C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles"
```

**Press Enter**

---

## ✅ Step 3: Check What Files Changed

**Run this command:**

```bash
git status
```

**This shows:**
- Files that are modified (red)
- Files that are staged (green)
- Files that are new (untracked)

---

## ✅ Step 4: Add All Files

**To add all changed files:**

```bash
git add .
```

**OR to add specific files:**

```bash
git add googleSheetsConfig.js GoogleAppsScript.js package.json vercel.json
```

---

## ✅ Step 5: Commit Files

**Run this command:**

```bash
git commit -m "Update: Fix Google Sheets integration and build configuration"
```

**OR use a different message:**

```bash
git commit -m "Fix: Update Google Sheets config and Vercel settings"
```

---

## ✅ Step 6: Push to GitHub

**Run this command:**

```bash
git push origin main
```

**If asked for credentials:**
- **Username**: Your GitHub username
- **Password**: Use **Personal Access Token** (NOT your GitHub password)
  - Create token: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select "repo" scope
  - Copy token and use it as password

---

## 📋 Complete Command Sequence

**Copy and paste these commands one by one:**

```bash
cd "C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles"

git status

git add .

git commit -m "Update: Fix Google Sheets integration and build configuration"

git push origin main
```

---

## 🔍 Verify Push Worked

**After pushing:**

1. **Go to**: https://github.com/NidhiSachdev/MoodMiles
2. **Check**:
   - ✅ Latest commit shows your message
   - ✅ Files are updated
   - ✅ `googleSheetsConfig.js` has latest changes
   - ✅ `GoogleAppsScript.js` has latest changes

---

## 🆘 Troubleshooting

### Error: "not a git repository"

**Solution:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/NidhiSachdev/MoodMiles.git
git push -u origin main
```

### Error: "Authentication failed"

**Solution:**
- Use Personal Access Token instead of password
- Create token: https://github.com/settings/tokens
- Select "repo" scope

### Error: "nothing to commit"

**Solution:**
- Files might already be committed
- Check: `git log` to see commits
- If files are committed, just push: `git push origin main`

### Error: "remote origin already exists"

**Solution:**
- Check remote: `git remote -v`
- If wrong URL, fix it:
  ```bash
  git remote set-url origin https://github.com/NidhiSachdev/MoodMiles.git
  ```

---

## 🎯 Quick Checklist

- [ ] Opened Command Prompt
- [ ] Navigated to project folder
- [ ] Ran `git status` (checked files)
- [ ] Ran `git add .` (added files)
- [ ] Ran `git commit -m "message"` (committed)
- [ ] Ran `git push origin main` (pushed)
- [ ] Verified on GitHub (files updated)

---

## 📝 Example Session

**Here's what a successful push looks like:**

```bash
C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles>git status
On branch main
Changes not staged for commit:
  modified:   googleSheetsConfig.js
  modified:   GoogleAppsScript.js
  modified:   package.json

C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles>git add .

C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles>git commit -m "Update: Fix Google Sheets integration"
[main abc1234] Update: Fix Google Sheets integration
 3 files changed, 50 insertions(+), 10 deletions(-)

C:\Users\niddhis\OneDrive - AMDOCS\Backup Folders\Desktop\moodmiles>git push origin main
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.
To https://github.com/NidhiSachdev/MoodMiles.git
   old-commit..new-commit  main -> main
```

---

## ✅ Success Indicators

**After successful push:**

- ✅ Command shows "Writing objects" and "done"
- ✅ Shows "main -> main"
- ✅ No error messages
- ✅ GitHub shows new commit

---

**Follow these steps to push your files!** 🚀
