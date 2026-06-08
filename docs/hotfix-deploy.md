# Hotfix Deploy Process

A hotfix is an urgent fix that needs to bypass the normal PR pipeline and be
deployed directly to production. This document outlines the step-by-step process
for creating, testing, and merging a hotfix.

---

## Overview

```
hotfix-your-fix  →  deploy to test  →  deploy to prod  →  rebase main
```

---

## Step 1 - Create a Hotfix Branch

Branch off from the point that reflects what is currently in production. This
may not always be the latest commit on `main` - if new changes have been merged
that are not yet deployed, you want to branch from the last deployed commit or
tag instead.

**Option A - Branch from the last deployed tag (recommended):**

```bash
git fetch --tags
git checkout -b hotfix-your-fix-description v1.2.3  # replace with your prod tag
```

**Option B - Branch from the last deployed commit:**

```bash
# Find the commit hash that is currently in prod (from your CI deploy logs or git log)
git log --oneline main

git checkout -b hotfix-your-fix-description <commit-hash>
```

**Option C - Branch from main if main matches prod exactly:**

```bash
git checkout main
git pull origin main
git checkout -b hotfix-your-fix-description
```

> **Naming convention:** `hotfix-<short-description>` e.g.
> `hotfix-fix-null-pointer-login`

> ⚠️ **Important:** Do not branch from the latest `main` if there are commits on
> `main` that have not been deployed to prod yet. Branching from those would
> include undeployed changes in your hotfix.

Make your changes, then commit and push:

```bash
git add .
git commit -m "hotfix: <short description of the fix>"
git push origin hotfix-your-fix-description
```

---

## Step 2 - Get the Container Tag

After pushing, your CI pipeline will build and tag the container. Note the tag
(PR number or build number) - you will need it in the next step.

You can find the tag in:

- The GitHub Actions build summary
- Your container registry (ECR, etc.)

---

## Step 3 - Deploy to Test First

**Never deploy straight to prod.** Always validate in test first.

1. Go to **GitHub Actions** → **Hotfix Deploy**
2. Click **Run workflow**
3. Fill in the inputs:
   - **tag** - the container tag from Step 2
   - **environment** - select `test`
4. Click **Run workflow**

Wait for the workflow to complete successfully before proceeding.

✅ Verify the fix works as expected in the test environment before moving on.

---

## Step 4 - Deploy to Prod

Once test is confirmed working:

1. Go to **GitHub Actions** → **Hotfix Deploy**
2. Click **Run workflow**
3. Fill in the inputs:
   - **tag** - same tag as used in test
   - **environment** - select `prod`
4. Click **Run workflow**

✅ Verify the fix in production after deployment completes.

---

## Step 5 - Rebase Main with the Hotfix Branch

Once the production deployment is successful, bring the hotfix back into `main`:

```bash
git checkout main
git pull origin main
git rebase hotfix-your-fix-description
git push origin main
```

If there are conflicts, resolve them and continue:

```bash
# After resolving conflicts
git add .
git rebase --continue
git push origin main
```

---

## Step 6 - Clean Up

Delete the hotfix branch after merging:

```bash
# Delete remote branch
git push origin --delete hotfix-your-fix-description

# Delete local branch
git branch -d hotfix-your-fix-description
```

---

## Full Checklist

- [ ] Branch created with `hotfix-` prefix (e.g. `hotfix-fix-description`)
- [ ] Fix committed and pushed
- [ ] Container built and tag noted
- [ ] Deployed to **test** and verified
- [ ] Deployed to **prod** and verified
- [ ] `main` rebased with hotfix branch
- [ ] Hotfix branch deleted

---

## Hotfix Deploy Workflow Reference

**File:** `.github/workflows/hotfix-deploy.yml`

| Input         | Description                          |
| ------------- | ------------------------------------ |
| `tag`         | The container image tag to deploy    |
| `environment` | Target environment: `test` or `prod` |

> ⚠️ The workflow will fail if triggered from a branch that does not start with
> `hotfix-`.

**Always deploy to `test` before `prod`.**

---

## Tips

- Keep hotfixes small and focused - one fix per hotfix branch
- Write a clear commit message describing what was broken and what was fixed
- If the fix is complex or risky, consider opening a PR for peer review before
  deploying to prod
- Communicate with your team before deploying to production
