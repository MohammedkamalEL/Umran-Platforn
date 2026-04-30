# Umran | عمران – Product Specification Document

## 1. Vision
Umran (عمران) is a bridge between communities and infrastructure authorities. It empowers citizens in developing regions (like Sudan) to actively participate in maintaining and improving their physical environment, even with limited connectivity.

## 2. Target Users
- **Community Members**: Reporting issues, joining neighborhood fix-it campaigns.
- **Municipal Authorities**: Managing work orders, viewing hot-spot maps.
- **Private Partners**: Sourcing contractors for small-scale community-led repairs.

## 3. MVP Core Features
- **Smart Reporting**: Bilingual (AR/EN) text, image, and voice reporting with GPS.
- **Offline-First Sync**: Local storage architecture with background sync.
- **Impact Map**: Color-coded visualization of infrastructure health.
- **Priority Engine**: Scoring system (Severity x Reports x Impact).
- **Campaign Module**: Peer-to-peer mobilization for minor infrastructure fixes.

## 4. Technical Constraints
- **Connectivity**: Must work 100% offline for reporting.
- **Bandwidth**: Images are compressed on-device before sync.
- **Literacy**: High reliance on visual icons and voice-to-text.

---

# Umran | عمران – MVP Scope Definition

## Included in MVP:
- **Auth**: Google Social Login + Anonymous fallback.
- **Reporting**: GPS tagging, camera integration, voice note recording.
- **Dashboard**: Leaflet/Mapbox-style map with clusters.
- **Sync**: Last-write-wins conflict resolution.
- **Priority**: Simple weighting: `Severity (1-3) * Count`.

## Post-MVP (Phase 2):
- **IoT Integration**: Water pressure sensors.
- **Satellite Analysis**: Automated detection of road erosion.
- **Governance**: Advanced RBAC for national ministry access.
