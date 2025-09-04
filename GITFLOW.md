# GitFlow Workflow for DollhouseMCP Website

## Branch Structure

- **main** - Production branch (live website)
- **develop** - Integration branch for development
- **feature/** - New features
- **fix/** - Bug fixes  
- **hotfix/** - Emergency production fixes

## Workflow

### New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "Add my feature"
git push -u origin feature/my-feature
# Create PR to develop
```

### Bug Fix
```bash
git checkout develop
git pull origin develop  
git checkout -b fix/bug-description
# Fix bug
git add .
git commit -m "Fix bug description"
git push -u origin fix/bug-description
# Create PR to develop
```

### Hotfix (Emergency)
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue
# Fix issue
git add .
git commit -m "Hotfix: critical issue"
git push -u origin hotfix/critical-issue
# Create PR to main AND develop
```

### Release
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
# Final testing/tweaks
git push -u origin release/v1.0.0
# Create PR to main
# After merge, tag the release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

## Rules

1. **Never commit directly to main or develop**
2. **All changes go through pull requests**
3. **Feature branches merge to develop**
4. **Only release and hotfix branches merge to main**
5. **After merging to main, always merge back to develop**

## Current Status
- ✅ Main branch (production)
- ✅ Develop branch created
- ✅ GitFlow structure ready