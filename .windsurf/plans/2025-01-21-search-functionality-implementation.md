# Search Functionality Implementation Plan

## Overview

Implement text search and tag filtering for Espanso packages with:

- **Text Search**: Instant fuzzy matching using Fuse.js (local state only)
- **Tag Filtering**: Multi-select with URL persistence for shareability
- **Pure HTML**: No CSS styling, focus on functionality only

## Current State Analysis

**Existing Implementation**:

- `app/model/packages.ts` - Package types with all required fields
- `app/services/packages.ts` - Package fetching with module-level caching
- `app/routes/search.tsx` - Basic route scaffold (just lists packages)
- `app/routes.ts` - Route configured as `/search`
- `fuse.js@7.1.0` - Installed as dependency

**Architecture Pattern** (from memory):

- `app/model/` - Domain models and validation schemas
- `app/services/` - Business logic layer
- `app/routes/` - UI route components

## Desired End State

### User Experience:

1. User visits `/search` → sees all packages
2. User types in search input → results filter instantly (no URL change)
3. User checks tag checkboxes → URL updates to `?t=tag1,tag2` and results filter
4. User can share tag filter URL with others
5. Combined filtering: text search AND tag filtering work together

### Technical Specification:

```typescript
// URL: /search?t=productivity,emoji

// State:
{
  textQuery: "espanso",           // Local state (not in URL)
  selectedTags: ["productivity", "emoji"]  // From URL query params
}

// Filtering logic:
allPackages
  → filter by text query (if exists)
  → filter by tags (if exists)
  → display results
```

### Success Criteria:

#### Automated Verification:

- [x] TypeScript compilation passes: `npm run typecheck`
- [x] No build errors: `npm run build`
- [x] Dev server starts: `npm run dev`

#### Manual Verification:

- [ ] Text search filters packages instantly as user types
- [ ] Tag filtering updates URL with `?t=tag1,tag2` format
- [ ] Tag URL is shareable (opening `/search?t=emoji` shows only emoji packages)
- [ ] Combined filters work (text + tags both applied)
- [ ] Results count displays correctly
- [ ] All packages display when no filters applied
- [ ] Empty state shows when no results found

## What We're NOT Doing

- No CSS styling or design
- No responsive layout (mobile/desktop)
- No debouncing on text input (instant filtering is fine for now)
- No search suggestions or autocomplete
- No Navbar integration (search input only on search page)
- No landing page hero search
- No performance optimizations (memoization, virtual scrolling)
- No accessibility enhancements (ARIA labels)

## Implementation Approach

1. **Service Layer First**: Pure functions for search logic
2. **Type Safety**: Leverage existing Valibot schemas
3. **URL State Pattern**: Use React Router's `useSearchParams` for tags
4. **Pure Functions**: Testable, stateless filtering functions

## Phase 1: Search Service Functions

### Overview

Create `app/services/search.ts` with pure functions for text and tag filtering.

### Changes Required:

#### File: `app/services/search.ts` (NEW)

**Purpose**: Business logic for search and filtering

```typescript
import Fuse from "fuse.js";
import type { Package } from "../model/packages";

/**
 * Performs fuzzy text search across package fields using Fuse.js
 * @param packages - Array of packages to search
 * @param query - Search query string
 * @returns Filtered packages matching the query
 */
export function textSearch(packages: Package[], query: string): Package[] {
  if (!query || query.trim() === "") {
    return packages;
  }

  const fuse = new Fuse(packages, {
    keys: ["name", "author", "description", "title"],
    threshold: 0.4, // Lower = more strict matching (0-1 scale)
  });

  return fuse.search(query).map((result) => result.item);
}

/**
 * Filters packages by tags (OR logic - package matches if it has ANY selected tag)
 * @param packages - Array of packages to filter
 * @param tags - Array of tag names to filter by
 * @returns Filtered packages containing at least one of the tags
 */
export function filterByTags(packages: Package[], tags: string[]): Package[] {
  if (!tags || tags.length === 0) {
    return packages;
  }

  // Case-insensitive tag matching
  const lowerTags = tags.map((t) => t.toLowerCase());

  return packages.filter((pkg) =>
    pkg.tags.some((pkgTag) => lowerTags.includes(pkgTag.toLowerCase())),
  );
}

/**
 * Counts how many packages have each tag
 * @param packages - Array of packages
 * @returns Array of {tag, count} sorted by count descending
 */
export type TagCount = {
  tag: string;
  count: number;
};

export function countTags(packages: Package[]): TagCount[] {
  // Extract all unique tags
  const tagCounts = new Map<string, number>();

  packages.forEach((pkg) => {
    pkg.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagCounts.set(lowerTag, (tagCounts.get(lowerTag) || 0) + 1);
    });
  });

  // Convert to array and sort by count (descending)
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Applies both text and tag filters to packages
 * @param packages - Array of packages
 * @param textQuery - Optional text search query
 * @param selectedTags - Optional array of tag filters
 * @returns Filtered packages
 */
export function applyFilters(
  packages: Package[],
  textQuery: string,
  selectedTags: string[],
): Package[] {
  let results = packages;

  // Apply text search first
  if (textQuery && textQuery.trim() !== "") {
    results = textSearch(results, textQuery);
  }

  // Then apply tag filtering
  if (selectedTags && selectedTags.length > 0) {
    results = filterByTags(results, selectedTags);
  }

  return results;
}
```

### Success Criteria:

#### Automated Verification:

- [x] File compiles without errors: `npm run typecheck`
- [x] All functions are properly typed

#### Manual Verification:

- [x] Functions can be imported in search route
- [x] Pure functions (same input = same output)

---

## Phase 2: URL State Management

### Overview

Implement tag filtering with URL persistence using React Router's `useSearchParams`.

### Changes Required:

#### File: `app/routes/search.tsx` (MODIFY)

**Changes**: Add URL state management for tag filtering

```typescript
import type { Route } from "./+types/search";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { getPackagesIndex } from "../services/packages";
import { applyFilters, countTags } from "../services/search";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search Packages - Espanso Hub" },
    { name: "description", content: "Search and browse all Espanso packages" },
  ];
}

export async function loader() {
  const packagesIndex = await getPackagesIndex();
  return { packages: packagesIndex.packages };
}

export default function Search({
  loaderData: { packages },
}: Route.ComponentProps) {
  // Local state for text search (instant filtering, no URL)
  const [textQuery, setTextQuery] = useState("");

  // URL state for tag filtering (shareable)
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse tags from URL (?t=tag1,tag2)
  const selectedTags = searchParams.get("t")?.split(",").filter(Boolean) || [];

  // Apply filters
  const filteredPackages = applyFilters(packages, textQuery, selectedTags);

  // Get tag counts for filter UI
  const tagCounts = countTags(packages);

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    const newTags = selectedTags.includes(lowerTag)
      ? selectedTags.filter((t) => t !== lowerTag)
      : [...selectedTags, lowerTag];

    if (newTags.length > 0) {
      setSearchParams({ t: newTags.sort().join(",") });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <h1>Search Packages</h1>

      {/* Text Search Input */}
      <form>
        <label htmlFor="search-input">Search:</label>
        <input
          id="search-input"
          type="text"
          value={textQuery}
          onChange={(e) => setTextQuery(e.target.value)}
          placeholder="Search packages..."
        />
      </form>

      {/* Tag Filters */}
      <fieldset>
        <legend>Filter by Tags:</legend>
        {tagCounts.map(({ tag, count }) => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggleTag(tag)}
            />
            {tag} ({count})
          </label>
        ))}
      </fieldset>

      {/* Results Summary */}
      <p>
        {filteredPackages.length} result{filteredPackages.length !== 1 ? "s" : ""}
      </p>

      {/* Results List */}
      {filteredPackages.length > 0 ? (
        <ul>
          {filteredPackages.map((pkg) => (
            <li key={pkg.id}>
              <strong>{pkg.title}</strong>
              <p>{pkg.description}</p>
              <p>Author: {pkg.author}</p>
              <p>Tags: {pkg.tags.join(", ")}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No packages found. Try adjusting your search or filters.</p>
      )}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [x] TypeScript compilation passes: `npm run typecheck`
- [x] Build succeeds: `npm run build`
- [x] Dev server runs: `npm run dev`

#### Manual Verification:

- [ ] Typing in search input filters results instantly
- [ ] Checking tags updates URL to `?t=tag1,tag2`
- [ ] URL can be copied and shared (reopening shows filtered results)
- [ ] Unchecking all tags removes `?t=` from URL
- [ ] Text search + tag filters work together (AND logic)
- [ ] Results count updates correctly
- [ ] Empty state shows when no results

---

## Phase 3: Enhanced UI Elements

### Overview

Add quality-of-life improvements: clear filters, active filter display, better layout.

### Changes Required:

#### File: `app/routes/search.tsx` (MODIFY)

**Changes**: Add clear filters, active tags display, improved structure

```typescript
export default function Search({
  loaderData: { packages },
}: Route.ComponentProps) {
  const [textQuery, setTextQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTags = searchParams.get("t")?.split(",").filter(Boolean) || [];
  const filteredPackages = applyFilters(packages, textQuery, selectedTags);
  const tagCounts = countTags(packages);

  const toggleTag = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    const newTags = selectedTags.includes(lowerTag)
      ? selectedTags.filter((t) => t !== lowerTag)
      : [...selectedTags, lowerTag];

    if (newTags.length > 0) {
      setSearchParams({ t: newTags.sort().join(",") });
    } else {
      setSearchParams({});
    }
  };

  const clearAllFilters = () => {
    setTextQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = textQuery.trim() !== "" || selectedTags.length > 0;

  return (
    <div>
      <h1>Search Packages</h1>

      {/* Search Input Section */}
      <section>
        <h2>Text Search</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search-input">Search:</label>
          <input
            id="search-input"
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder="Search by name, author, description..."
          />
        </form>
      </section>

      {/* Tag Filters Section */}
      <section>
        <h2>Filter by Tags</h2>
        <fieldset>
          <legend>Select tags to filter:</legend>
          {tagCounts.map(({ tag, count }) => (
            <div key={tag}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag} ({count})
              </label>
            </div>
          ))}
        </fieldset>
      </section>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <section>
          <h3>Active Filters:</h3>
          <ul>
            {textQuery.trim() !== "" && (
              <li>Text: "{textQuery}"</li>
            )}
            {selectedTags.length > 0 && (
              <li>Tags: {selectedTags.join(", ")}</li>
            )}
          </ul>
          <button type="button" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </section>
      )}

      {/* Results Section */}
      <section>
        <h2>
          Results ({filteredPackages.length} package
          {filteredPackages.length !== 1 ? "s" : ""})
        </h2>

        {filteredPackages.length > 0 ? (
          <ul>
            {filteredPackages.map((pkg) => (
              <li key={pkg.id}>
                <h3>{pkg.title}</h3>
                <p><strong>Description:</strong> {pkg.description}</p>
                <p><strong>Author:</strong> {pkg.author}</p>
                <p><strong>Version:</strong> {pkg.version}</p>
                <p><strong>Tags:</strong> {pkg.tags.join(", ")}</p>
                <hr />
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>No packages found matching your criteria.</p>
            <p>Try adjusting your search or clearing filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [x] TypeScript compilation passes: `npm run typecheck`
- [x] Build succeeds: `npm run build`

#### Manual Verification:

- [ ] Active filters section shows current filters
- [ ] "Clear All Filters" button removes all filters and resets URL
- [ ] Semantic HTML structure (sections, headings)
- [ ] Package details display correctly

---

## Testing Strategy

### Manual Testing Steps:

1. **Navigate to `/search`**
   - [ ] All packages display
   - [ ] Tag checkboxes show counts

2. **Text Search**
   - [ ] Type "emoji" → results filter instantly
   - [ ] URL remains `/search` (no query param)
   - [ ] Clear text → all packages return

3. **Tag Filtering**
   - [ ] Check "productivity" tag
   - [ ] URL updates to `/search?t=productivity`
   - [ ] Results filter to productivity packages
   - [ ] Check "emoji" tag (while productivity checked)
   - [ ] URL updates to `/search?t=emoji,productivity`
   - [ ] Results show packages with EITHER tag

4. **Combined Filtering**
   - [ ] Type "espanso" in search
   - [ ] Check "fun" tag
   - [ ] Results show packages matching both text AND tag

5. **URL Sharing**
   - [ ] Copy URL `/search?t=emoji`
   - [ ] Open in new tab
   - [ ] Emoji packages are filtered on load

6. **Clear Filters**
   - [ ] Click "Clear All Filters"
   - [ ] Text input clears
   - [ ] All tags uncheck
   - [ ] URL becomes `/search` (no params)
   - [ ] All packages display

7. **Edge Cases**
   - [ ] Search with no results → shows empty state
   - [ ] Uncheck all tags → URL clears
   - [ ] Special characters in search work
   - [ ] Case-insensitive tag matching works

## References

- Research document: `.windsurf/research/2025-01-21-search-functionality-overview.md`
- Legacy implementation: `/old/api/search.ts`, `/old/pages/search.tsx`
- Current package service: `app/services/packages.ts`
- Current package model: `app/model/packages.ts`

---

**Implementation Notes**:

- Fuse.js threshold of 0.4 balances precision/recall (can adjust based on testing)
- Tag filtering uses OR logic (package matches if it has ANY selected tag)
- Text + tag filters use AND logic (must match both)
- Case-insensitive tag matching for better UX
- Tags in URL are comma-separated and alphabetically sorted for consistency
