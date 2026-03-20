---
description: EduVerse Official Git Branching Workflow Guide
---

# Git Branching Workflow Guide (Project Standard Manual)

## Purpose
This document defines the official branching strategy, rules, and workflow for the EduVerse project. All contributors (including Antigravity) must follow these instructions exactly.

## 1. Branch Structure Overview
We use 4 main branches:
* **`dev`**: development work (developers)
* **`main`**: stable backup (protected)
* **`prod`**: release-ready code (maintainer)
* **`test`**: testing code (testers/QA)

*Simple meaning:*
`dev` = coding | `test` = checking | `prod` = ready | `main` = safe copy

## 2. Branch Responsibility Rules
You are ONLY allowed to write code in:
* `dev` (via feature branches)

Never write code directly in:
* `test`
* `prod`
* `main`

## 3. Default Branch Rule
Default branch must always be: **`dev`**
*Reason:*
prevents accidental production merges
keeps development safe

## 4. Protected Branches
These branches are locked: **`main`**, **`prod`**
*Restrictions:*
cannot push directly
cannot delete
cannot rewrite history
must use Pull Request

## 5. Official Workflow Pipeline
All code must follow this path:
`feature` → `dev` → `test` → `prod` → `main`
*Never skip steps.*

## 6. Daily Developer Workflow
**Step 1 — Start Work**
```bash
git checkout dev
git pull
git checkout -b feature/feature-name
```

**Step 2 — Code**
Write your code normally.

**Step 3 — Save Changes**
```bash
git add .
git commit -m "feat: description"
```

**Step 4 — Push Feature Branch**
```bash
git push -u origin feature/feature-name
```

**Step 5 — Merge Feature → dev**
Create Pull Request: base = `dev`, compare = `feature branch`

**Step 6 — Move dev → test**
After feature complete and stable. Create PR: `dev` → `test`

**Step 7 — Move test → prod**
After testing success: `test` → `prod`

**Step 8 — Release Snapshot**
`prod` → `main`. `main` always stores stable release history.

## 7. Branch Naming Rules
* Feature: `feature/login-system`
* Bug fix: `fix/payment-error`
* Hotfix: `hotfix/server-crash`
* Release: `release/v1.0`

## 8. Pull Request Rules
Every PR must:
* have clear title
* describe change
* pass review
* be approved
Never merge your own PR without review (if team exists).

## 9. Golden Rules (Mandatory)
*Never:*
* push directly to `prod`
* push directly to `main`
* skip testing branch
* merge untested code

*Always:*
* create feature branch
* use PR
* test before production

## 10. Mental Model (Easy Way)
Think of branches like rooms:
* `dev`: work room
* `test`: testing lab
* `prod`: ready room
* `main`: vault

Code must walk room by room.

## 11. Maintainer Responsibilities
* view PRs
* ensure workflow followed
* prevent direct pushes
* approve production merges

## 12. Contributor Checklist
Before submitting PR:
* code works
* no console errors
* no debug logs
* files organized
* commit message clean

## 13. Why This System Exists
This workflow prevents broken production, lost code, unstable releases, accidental overwrites.
It ensures safe development, testing stage, controlled releases, traceable history.

**Final Rule**: If unsure what to do, work from `dev`. Never start work from any other branch.
