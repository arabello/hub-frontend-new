# Single Package Page Migration (Detail Route)

## Overview

Migrate the legacy Espanso Hub package detail page to the new React Router app using shadcn/ui components. Implement both latest and versioned package routes and replicate the legacy layout/UX patterns, while explicitly omitting the Source (YAML) tab and any markdown/MDX rendering work in this iteration.

## Current State Analysis

- **Routes**:
  - `app/routes.ts` defines `/:packageName` → `app/routes/package.tsx` only. No version route exists.
  - `app/routes/package.tsx` minimal loader/UI returning only `loaderData.package.title`.
  - `react-router.config.ts` prerenders `/` and `/:packageName` via `getUniquePackageNames()`.
- **Data services**:
  - `app/services/packages.ts` provides `getPackagesIndex()`, `getUniquePackageNames()`, and `getPackageByName(name)` for the latest version only. No version-specific accessors.
- **Components**:
  - shadcn/ui primitives used across the app (`button`, `card`, `badge`, `separator`, `sheet`, etc.).
  - `Header` and `Footer` exist and are used on pages.
  - `PackageCard` navigates to `/${pkg.name}` for latest.
- **UX parity inputs** (from research):
  - Legacy package page layout includes header with title, featured badge, author, package name (mono), description, tags; right column installation command (desktop only); tabbed content (Description, Source). See: `.windsurf/research/2025-01-21-legacy-ui-design-structure.md` → "Package Detail Page Structure".

## Desired End State

- **Routes**:
  - `/:packageName` renders latest version page.
  - `/:packageName/v/:version` renders a specific version page.
- **UI/UX** (shadcn/ui, Tailwind):
  - Sticky `Header` (already present globally) and footer (via `root.tsx`).
  - Package header section replicating legacy composition:
    - Title with optional "Featured" badge.
    - Package name (mono), author, short description.
    - Clickable tag badges navigate to `/search?t={tag}`.
    - Actions: Share button (desktop/mobile), GitHub link derived heuristically from `archive_url` (surface now), Version dropdown to navigate between versions.
    - Desktop-only right column with installation command box.
  - Content area:
    - Single "Description" section rendering the plain `description` field (confirmed; no MDX/README; Source tab omitted).
- **SEO**:
  - `<title>` `${title} - Espanso Hub` and `<meta name="description">` from package description for both routes.
- **SSG**:
  - Prerender latest and version-specific routes based on the package index.

## What We're NOT Doing

- No YAML Source tab UI or code viewer.
- No MDX/markdown README rendering pipeline in this iteration.
- No YAML file sidebar/side sheet behavior.

## Implementation Approach

Incremental addition of data accessors, routing, and UI components following existing patterns (e.g., `search.tsx` composition and shadcn/ui usage).

## Phase 1: Data Services & Routing ✅

### Changes Required:

- **File**: `app/services/packages.ts`
- **Changes**:
  - Add helpers:
    - `getPackageByNameAndVersion(name: string, version: string): Promise<Package | null>`
    - `getVersionsForPackage(name: string): Promise<string[]>` (sorted desc)
    - `getAllPackageVersionPaths(): Promise<string[]>` to produce `/:name/v/:version` paths for prerender.

```ts
export async function getPackageByNameAndVersion(
  name: string,
  version: string,
): Promise<Package | null> {
  const index = await getPackagesIndex();
  return (
    index.packages.find((p) => p.name === name && p.version === version) || null
  );
}

export async function getVersionsForPackage(name: string): Promise<string[]> {
  const index = await getPackagesIndex();
  const versions = index.packages
    .filter((p) => p.name === name)
    .map((p) => p.version)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  return Array.from(new Set(versions));
}

export async function getAllPackageVersionPaths(): Promise<string[]> {
  const index = await getPackagesIndex();
  return index.packages.map((p) => `/${p.name}/v/${p.version}`);
}
```

- **File**: `app/routes.ts`
- **Changes**:
  - Add version route configuration:

```ts
route(":packageName/v/:version", "routes/package.version.tsx");
```

- **File**: `react-router.config.ts`
- **Changes**:
  - Include versioned paths for prerender in addition to latest paths:

```ts
const packageNames = await getUniquePackageNames();
const versionPaths = await getAllPackageVersionPaths();
const paths = ["/", ...packageNames.map((n) => `/${n}`), ...versionPaths];
return paths;
```

### Success Criteria

- `:packageName` and `:packageName/v/:version` resolve without 404.
- Typegen succeeds: `pnpm run typecheck`.
- Build succeeds with expanded prerender list.

## Phase 2: Latest Package Page UI (`/:packageName`) ✅

### Changes Required:

- **File**: `app/routes/package.tsx`
- **Changes**:
  - Loader: keep `getPackageByName`, also fetch `versions = getVersionsForPackage(packageName)`.
  - Meta: as-is, from package.
  - UI: Replace placeholder with full layout using shadcn/ui:
    - Responsive header section with title + badge, package name (mono), author, description text, tag badges.
    - Actions row: share link (copy-to-clipboard), GitHub link derived heuristically from `archive_url`, version `Select` that navigates to either `/${name}` (if latest) or `/${name}/v/${version}`.
    - Desktop right column: "Install" card showing `espanso install ${name}` (or `espanso install ${name} --version ${version}` on version page), with copy button. No additional flags beyond `--version`.
    - Content section: a Card with a "Description" header and the plain `description` field (confirmed).

```tsx
// In component body
// - use shadcn/ui Card, Badge, Button, Select, Separator
// - tag badge onClick → navigate(`/search?t=${tag}`)
// - version select onValueChange → navigate(path)
```

### Success Criteria

- Page visually matches legacy layout structure and spacing using Tailwind classes and shadcn/ui.
- Tags navigate to search with tag preselected.
- Version dropdown navigates correctly.

## Phase 3: Versioned Package Page UI (`/:packageName/v/:version`) ✅

### Changes Required:

- **File**: `app/routes/routes/package.version.tsx` (new)
- **Changes**:
  - Loader: resolve `getPackageByNameAndVersion(name, version)`, get `versions` for dropdown, 404 if not found.
  - Meta: same pattern as latest.
  - UI: Reuse same layout as Phase 2 but with the selected version preselected in the dropdown and the install command including `--version` (no other flags). Include the same GitHub link derived heuristically from `archive_url`.

```ts
// Loader shape
return { package: p, versions, isLatest: versions[0] === version };
```

### Success Criteria

- Route displays exact version data and correct install command.
- Dropdown can navigate to latest route when choosing latest.

## Phase 4: Error States, SEO and Polish ✅

### Changes Required:

- **404 handling**: Maintain throwing 404 in loaders when package/version missing.
- **Meta**: Ensure `<title>` and `<meta description>` in both routes.
- **Accessibility**: Add `aria-label`s for buttons and selects, ensure keyboard navigation for dropdown.
- **Responsive behavior**: Hide install box on small screens.

### Success Criteria

- Keyboard-accessible controls.
- Mobile layout collapses to a single column; desktop shows two columns with sticky install box if needed.

---

## Testing Strategy

### Automated Verification

- [x] Type generation & TS: `pnpm run typecheck`
- [x] Build: `pnpm run build`

### Manual Testing Steps

1. Navigate to `/:packageName` for a known package:
   - Verify header content (title, badges, author, name, description, tags).
   - Verify install box appears on desktop only and copies to clipboard.
   - Verify version dropdown lists versions, selecting latest routes to `/:name`, others to `/:name/v/:version`.
2. Navigate directly to `/:packageName/v/:version` for multiple versions:
   - Validate meta tags, content, install command includes `--version`.
3. Click tag badges → navigates to `/search?t={tag}` and filters.
4. Validate 404 for unknown package or invalid version.

## References

- Research doc: `.windsurf/research/2025-01-21-legacy-ui-design-structure.md` → Package Detail sections (lines ~411–446) and layout patterns.
- Current search page as UI reference for shadcn/ui usage: `app/routes/search.tsx`.
- Current services: `app/services/packages.ts`.

## Decisions

- Surface the GitHub repo link now using a best-effort heuristic derived from `archive_url`.
- Do not include any install flags beyond `--version` on versioned pages.
- Use only the plain `description` string for content (no README/MDX) in this iteration.
