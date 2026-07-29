# Hotfix Deploy Process

A hotfix is an urgent fix that needs to bypass the normal PR pipeline and be
deployed directly to production. This document outlines the step-by-step process
for creating, testing, and merging a hotfix.

---

## Overview

```
hotfix-your-fix  →  build image (automatic)  →  deploy to test  →  deploy to prod  →  rebase main
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

## Step 2 - Deploy to Test First

**Never deploy straight to prod.** Always validate in test first.

The workflow will **automatically build a fresh container image** from your
hotfix branch commit and deploy it. There is no need to find or provide a tag
manually.

1. Go to **GitHub Actions** → **Hotfix Deploy**
2. Click **Run workflow**
3. Select your `hotfix-*` branch from the branch dropdown
4. Fill in the inputs:
   - **app** - select `admin` or `public`
   - **environment** - select `test`
5. Click **Run workflow**

The workflow will run three jobs in sequence:

1. **Validate hotfix branch** - ensures the branch name starts with `hotfix-`
2. **Build Hotfix Image** - builds and pushes the container image tagged with
   the branch's commit SHA
3. **Deploy to AWS** - deploys the newly built image to the selected environment

Wait for the workflow to complete successfully before proceeding.

✅ Verify the fix works as expected in the test environment before moving on.

---

## Step 3 - Deploy to Prod

Once test is confirmed working:

1. Go to **GitHub Actions** → **Hotfix Deploy**
2. Click **Run workflow**
3. Select **the same `hotfix-*` branch** (important — must be the same commit)
4. Fill in the inputs:
   - **app** - same app as deployed to test
   - **environment** - select `prod`
5. Click **Run workflow**

> ⚠️ Always trigger from the **same branch and same commit** that was deployed
> to test. If you push new commits between test and prod deployments, the image
> will be rebuilt with a different SHA, and you will be deploying untested code
> to prod.

✅ Verify the fix in production after deployment completes.

---

## Step 4 - Rebase Main with the Hotfix

Once the production deployment is successful, bring the hotfix back into `main`
so the fix is not lost when the next regular release goes out.

### Why rebase and not merge?

Rebasing replays your hotfix commit(s) on top of `main`, keeping a clean linear
history without a merge commit. This is preferred because the hotfix was a small
targeted fix and does not need a merge bubble in the history.

### Steps

```bash
# Make sure main is up to date
git checkout main
git pull origin main

# Rebase main onto the hotfix branch
# This replays the hotfix commit(s) on top of main
git rebase hotfix-your-fix-description

# Push the updated main
git push origin main
```

> If `main` has moved ahead since you branched (which is likely), git will
> replay your hotfix commit(s) **on top of** the current `main`. This is what
> you want — the hotfix is now part of `main`'s history.

### Resolving conflicts during rebase

If there are conflicts (e.g. the same file was changed in `main` and in your
hotfix):

```bash
# Git will pause and tell you which files conflict
# Open the conflicting files, resolve the conflict markers, then:
git add <resolved-file>
git rebase --continue

# If you want to abort and start over:
git rebase --abort
```

After a successful rebase, verify the fix commit is visible in `main`:

```bash
git log --oneline main | head -10
```

---

## Step 5 - Clean Up

Delete the hotfix branch after merging back to main:

```bash
# Delete remote branch
git push origin --delete hotfix-your-fix-description

# Delete local branch
git branch -d hotfix-your-fix-description
```

---

## Full Checklist

- [ ] Branch created with `hotfix-` prefix (e.g. `hotfix-fix-description`)
- [ ] Fix committed and pushed to the hotfix branch
- [ ] Deployed to **test** via the Hotfix Deploy workflow and verified
- [ ] Deployed to **prod** via the Hotfix Deploy workflow (same branch/commit as
      test) and verified
- [ ] `main` rebased with the hotfix branch
      (`git rebase hotfix-your-fix-description`)
- [ ] Rebase pushed to `main`
- [ ] Hotfix branch deleted (remote + local)

---

## Hotfix Deploy Workflow Reference

**File:** `.github/workflows/hotfix-deploy.yml`

| Input         | Description                                    |
| ------------- | ---------------------------------------------- |
| `app`         | The application to deploy: `admin` or `public` |
| `environment` | Target environment: `test` or `prod`           |

> The container image is built automatically from the hotfix branch commit
> (`github.sha`). No manual image tag is required.

> ⚠️ The workflow will fail if triggered from a branch that does not start with
> `hotfix-`.

**Always deploy to `test` before `prod`.**

---

## Tips

- Keep hotfixes small and focused - one fix per hotfix branch
- Write a clear commit message describing what was broken and what was fixed
- Do not push new commits to the hotfix branch between your test and prod
  deployments — the image will be rebuilt with a new SHA
- If the fix is complex or risky, consider opening a PR for peer review before
  deploying to prod
- Communicate with your team before deploying to production
