# Git Quick Reference Guide

A beginner-friendly guide to using Git with this project.

## What is Git?

Git is a **version control system** that:
- Tracks changes to your code over time
- Lets you collaborate with others
- Allows you to revert mistakes
- Creates a backup of your work

Think of it like "Track Changes" in Microsoft Word, but much more powerful!

## Initial Setup (One Time)

```bash
# Navigate to your project
cd C:\Users\coleb\source\repos\contact

# Initialize Git repository
git init

# Configure your identity (first time using Git on this machine)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files to staging
git add .

# Create first commit
git commit -m "Initial commit: Contact Service API"

# Connect to GitHub (after creating repo on github.com)
git remote add origin https://github.com/YOUR_USERNAME/contact-service.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Daily Workflow

### The Three States of Git

```
Working Directory  →  Staging Area  →  Repository (Committed)
(modified files)      (ready to commit)  (saved in history)
```

### Basic Cycle

```bash
# 1. Check status - What changed?
git status

# 2. Stage files - Prepare to commit
git add .                              # Add all changed files
git add src/controllers/person.controller.ts  # Add specific file

# 3. Commit - Save snapshot with message
git commit -m "Add email validation to person endpoint"

# 4. Push - Send to GitHub
git push
```

## Common Commands

### Viewing Information

```bash
# What files changed?
git status

# What are the actual changes?
git diff                    # Unstaged changes
git diff --staged          # Staged changes

# View commit history
git log                    # Full history
git log --oneline         # Compact view
git log --oneline -5      # Last 5 commits

# View specific commit
git show HEAD             # Latest commit
git show abc123           # Specific commit by hash
```

### Making Changes

```bash
# Stage changes
git add filename.ts       # Single file
git add .                 # All files
git add src/              # Entire folder

# Commit staged changes
git commit -m "Your descriptive message"

# Stage and commit in one step (existing files only)
git commit -am "Quick commit message"

# Push to remote
git push                  # Push current branch
git push origin main      # Push to specific branch
```

### Undoing Changes

```bash
# Discard uncommitted changes to a file
git checkout -- filename.ts

# Unstage a file (keep changes)
git reset filename.ts

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - CAREFUL!
git reset --hard HEAD~1

# View file from previous commit
git show HEAD:src/server.ts
```

## Branching

Branches let you work on features without affecting the main code.

```bash
# View branches
git branch                # Local branches
git branch -a            # All branches (including remote)

# Create and switch to new branch
git checkout -b feature-name
# Example: git checkout -b add-household-endpoints

# Switch branches
git checkout main
git checkout feature-name

# Merge branch into current branch
git checkout main         # Switch to main
git merge feature-name   # Merge feature into main

# Delete branch (after merging)
git branch -d feature-name

# Push branch to GitHub
git push -u origin feature-name
```

## Working with Remote (GitHub)

```bash
# View remote repositories
git remote -v

# Add remote
git remote add origin https://github.com/username/repo.git

# Fetch changes from remote (doesn't merge)
git fetch

# Pull changes from remote (fetch + merge)
git pull

# Push changes to remote
git push
git push origin main

# Clone a repository
git clone https://github.com/username/repo.git
```

## Commit Message Best Practices

### Format

```
Short summary (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).
Explain what and why, not how.

- Bullet points are okay
- Use present tense: "Add feature" not "Added feature"
```

### Good Examples

```bash
git commit -m "Add pagination to person search endpoint"
git commit -m "Fix email validation bug in person creation"
git commit -m "Update README with AWS RDS deployment instructions"
git commit -m "Refactor database connection to use connection pooling"
```

### Bad Examples

```bash
git commit -m "fix"           # Too vague
git commit -m "update stuff"  # What stuff?
git commit -m "WIP"          # Work in progress - commit when done!
git commit -m "asdf"         # Random text
```

## Typical Workflow Scenarios

### Scenario 1: Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b add-household-endpoints

# 2. Make your changes (edit files)

# 3. Test your changes
npm run dev

# 4. Commit your work
git add .
git commit -m "Add CRUD endpoints for household management"

# 5. Push to GitHub
git push -u origin add-household-endpoints

# 6. Create Pull Request on GitHub (web interface)

# 7. After PR is merged, switch back and update main
git checkout main
git pull
git branch -d add-household-endpoints
```

### Scenario 2: Fixing a Bug

```bash
# 1. Create bugfix branch
git checkout -b fix-email-validation

# 2. Fix the bug

# 3. Commit
git add src/middleware/validator.ts
git commit -m "Fix email validation to allow plus signs in addresses"

# 4. Push and create PR
git push -u origin fix-email-validation
```

### Scenario 3: Daily Development

```bash
# Morning: Get latest changes
git pull

# Work on features
# ... edit files ...

# Check what changed
git status
git diff

# Commit changes
git add .
git commit -m "Add phone number formatting helper function"

# Push to GitHub
git push

# End of day: Make sure everything is pushed
git status  # Should be "nothing to commit, working tree clean"
```

## Checking What Will Be Committed

Always review before committing!

```bash
# See which files changed
git status

# See the actual changes
git diff

# See changes that are staged
git diff --staged
```

## .gitignore

This file tells Git what to ignore. Already configured for you:

- `node_modules/` - Dependencies (huge, reinstallable)
- `.env` - **SECRETS! NEVER COMMIT THIS!**
- `dist/` - Compiled code (regenerable)
- Log files
- IDE settings

### If You Accidentally Commit .env

```bash
# Remove from Git tracking (keep local file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from version control"

# Push
git push

# Make sure .env is in .gitignore
echo .env >> .gitignore
git add .gitignore
git commit -m "Add .env to .gitignore"
git push
```

## Troubleshooting

### "fatal: not a git repository"
**Problem**: Git not initialized
**Solution**: `git init`

### "Please tell me who you are"
**Problem**: Git identity not configured
**Solution**:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### "Your branch is behind 'origin/main'"
**Problem**: Remote has changes you don't have locally
**Solution**: `git pull`

### "Your branch is ahead of 'origin/main'"
**Problem**: You have local commits not pushed
**Solution**: `git push`

### "merge conflict"
**Problem**: Same file edited in two places
**Solution**:
1. Open conflicted file (Git marks conflicts with `<<<<<<<`)
2. Choose which changes to keep
3. Remove conflict markers
4. `git add filename`
5. `git commit`

### "fatal: remote origin already exists"
**Problem**: Trying to add remote that exists
**Solution**:
```bash
git remote remove origin
git remote add origin https://github.com/username/repo.git
```

## GitHub Integration

### Creating a Repository on GitHub

1. Go to github.com
2. Click "+" → "New repository"
3. Name: `contact-service`
4. Description: `Contact management API`
5. **Don't** initialize with README (you already have files)
6. Click "Create repository"
7. Follow GitHub's instructions to push existing repo

### Creating a Pull Request

1. Push your branch: `git push origin feature-branch`
2. Go to GitHub repository
3. Click "Compare & pull request"
4. Write description of changes
5. Click "Create pull request"
6. Wait for review/approval
7. Click "Merge pull request"

## Tips for This Project

### Before Committing

```bash
# Make sure code compiles
npm run build

# Format code (if you have prettier)
npm run format

# Check what you're committing
git status
git diff
```

### Commit Often

- Commit after completing a small unit of work
- Don't wait until end of day
- Each commit should be one logical change

### Write Meaningful Messages

```bash
# Good - explains what and why
git commit -m "Add transaction support to person creation to ensure data consistency"

# Bad - doesn't explain anything
git commit -m "update code"
```

## Learning Resources

- **Git Tutorial**: https://git-scm.com/docs/gittutorial
- **GitHub Guides**: https://guides.github.com/
- **Interactive Tutorial**: https://learngitbranching.js.org/
- **Visualize Git**: https://git-school.github.io/visualizing-git/

## Cheat Sheet

```bash
# Status & Info
git status              # What changed?
git log --oneline      # Commit history
git diff               # See changes

# Basic Workflow
git add .              # Stage all files
git commit -m "msg"    # Commit
git push               # Push to GitHub

# Branching
git branch             # List branches
git checkout -b name   # Create & switch
git merge name         # Merge branch

# Remote
git pull               # Get latest changes
git push               # Send your changes
git clone URL          # Copy repository

# Undo
git checkout -- file   # Discard changes
git reset HEAD~1       # Undo last commit
```

---

**Remember**: Git is your safety net. Commit often, write clear messages, and push regularly!
