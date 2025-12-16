---
name: update-app
description: Update dependencies, fix deprecations and warnings
---

# Dependency Update & Deprecation Fix

## Step 1: Check for Updates

```bash
npm outdated
```

## Step 2: Update Dependencies

```bash
npm update
npm audit fix
```

## Step 3: Check for Deprecations & Warnings

```bash
rm -rf node_modules package-lock.json
npm install
```

Read ALL output carefully. Look for:

- Deprecation warnings
- Security vulnerabilities
- Peer dependency warnings
- Breaking changes

## Step 4: Fix Issues

For each warning/deprecation:

1. Research the recommended replacement or fix
2. Update code/dependencies accordingly
3. Re-run installation
4. Verify no warnings remain

## Step 5: Run Quality Checks

```bash
npm run lint && npm run typecheck
```

Fix all errors before completing.

## Step 6: Verify Clean Install

```bash
rm -rf node_modules package-lock.json
npm install
```

Ensure ZERO warnings/errors.
