---
name: OTA Deployment Protocol
description: Standard operating procedure for building and deploying Over-The-Air (OTA) updates using EAS for the Glowapp. Use this when deploying or building the app.
---
# OTA Deployment Protocol

Before performing any Over-The-Air (OTA) update via EAS, you must follow these steps in exact order to ensure version traceability and stable rollouts:

1. **Bump Version Markers**: Modify the internal version markers accordingly in `app.config.js`.
2. **Commit Changes**: Commit the version bump to version control (e.g., `git commit -m "Bump version for OTA update"`).
3. **Deploy via EAS**: Execute the `eas update` command to distribute the changes.
