# Version Management Guide

## Version Strategy

### When to Update Version
- ✅ **Update on EVERY publish** - Each release should have a unique version
- ✅ **Use semantic versioning** - MAJOR.MINOR.PATCH
- ✅ **Auto-updates only work with higher versions**

### Version Types

| Type | When to Use | Example |
|------|-------------|---------|
| **PATCH** | Bug fixes, small improvements | `1.0.0` → `1.0.1` |
| **MINOR** | New features, backward compatible | `1.0.0` → `1.1.0` |
| **MAJOR** | Breaking changes, major updates | `1.0.0` → `2.0.0` |

## Manual Version Management

### Quick Commands
```bash
# Update patch version (bug fixes)
npm run version:patch

# Update minor version (new features)
npm run version:minor

# Update major version (breaking changes)
npm run version:major
```

### Manual Steps
1. **Update version in package.json**
2. **Commit changes**
3. **Create git tag**
4. **Push to GitHub**
5. **GitHub Actions will auto-release**

## Automated Publishing

### One-Command Publishing
```bash
# Publish patch update (most common)
npm run publish:all

# Publish minor update
npm run publish:minor

# Publish major update
npm run publish:major

# Platform-specific publishing
npm run publish:win    # Windows only
npm run publish:mac    # macOS only
```

### What Happens Automatically
1. ✅ **Version bump** (patch/minor/major)
2. ✅ **Git commit** with version message
3. ✅ **Git tag** created
4. ✅ **Build** React app
5. ✅ **Package** Electron app
6. ✅ **Publish** to GitHub Releases
7. ✅ **Users get auto-update** notification

## GitHub Actions Workflow

### Automated Release Process
- **Trigger**: Push a tag (e.g., `v1.0.1`)
- **Build**: Both Windows and macOS
- **Publish**: Automatic upload to GitHub Releases
- **Update**: Users receive auto-update notification

### Manual Release Steps
```bash
# 1. Update version and create tag
npm run version:patch

# 2. Push tag to trigger release
git push origin v1.0.1

# 3. GitHub Actions builds and publishes automatically
```

## Best Practices

### ✅ Do's
- Update version for every release
- Use semantic versioning
- Test updates in development
- Include release notes
- Tag releases in git

### ❌ Don'ts
- Skip version updates
- Use random version numbers
- Publish without testing
- Forget to tag releases

## Release Checklist

Before publishing:
- [ ] Test the app thoroughly
- [ ] Update version number
- [ ] Write release notes
- [ ] Commit all changes
- [ ] Create git tag
- [ ] Push to GitHub
- [ ] Verify GitHub Actions success
- [ ] Test auto-update in production

## Troubleshooting

### Version Issues
```bash
# Check current version
npm run version

# Reset version if needed
npm version 1.0.0 --no-git-tag-version
```

### Auto-Update Issues
- Ensure version is higher than current
- Check GitHub Releases exist
- Verify app ID matches
- Check network connectivity

## Version History Example

```
v1.0.0 - Initial release
v1.0.1 - Bug fix: Fixed login issue
v1.1.0 - Feature: Added dark mode
v1.1.1 - Bug fix: Fixed dark mode toggle
v2.0.0 - Breaking: New UI design
v2.0.1 - Bug fix: Fixed navigation
```
