---
date: 2025-01-21T21:34:00+02:00
researcher: Cascade AI
git_commit: f8b5761d1cc87235cdd0a6996df529c7e73f0285
branch: main
repository: hub-frontend-new
topic: "Search Functionality Overview - Migration Reference"
tags:
  [
    research,
    codebase,
    search,
    filtering,
    fuse-js,
    migration-reference,
    feature-analysis,
  ]
status: complete
last_updated: 2025-01-21
last_updated_by: Cascade AI
based_on: 2025-01-21-espanso-hub-legacy-project-analysis.md
---

# Research: Search Functionality Overview - Migration Reference

**Date**: 2025-01-21T21:34:00+02:00  
**Researcher**: Cascade AI  
**Git Commit**: f8b5761d1cc87235cdd0a6996df529c7e73f0285  
**Branch**: main  
**Repository**: hub-frontend-new  
**Based On**: `.windsurf/research/2025-01-21-espanso-hub-legacy-project-analysis.md`

## Purpose

This document provides a comprehensive overview of the search and filtering functionality in the legacy Espanso Hub project. It serves as a migration reference for implementing similar functionality in the current React Router v7 project.

**Note**: The legacy code uses fp-ts and io-ts functional programming patterns. The new implementation should use modern, idiomatic TypeScript patterns instead.

## High-Level Overview

The search system provides two types of filtering that work together:

1. **Text Search**: Fuzzy text matching across package fields (name, author, description, title)
2. **Tag Filtering**: Multi-select tag filtering with checkbox UI

Both filters:

- Work simultaneously (AND logic between text and tags)
- Persist state in URL query parameters for shareability
- Execute client-side for instant results (no backend required)
- Operate on pre-fetched package data from static generation

## Architecture Components

### 1. Search Functions (`old/api/search.ts`)

Two core pure functions handle the filtering logic:

#### Text Search Function

```typescript
// Simplified version (without fp-ts)
export const textSearch =
  (packages: Package[]) =>
  (query: string): Package[] => {
    const fuse = new Fuse(packages, {
      useExtendedSearch: true, // enables '|' OR and ' ' AND operators
      keys: ["name", "author", "description", "title"],
    });
    return fuse.search(query).map((result) => result.item);
  };
```

**Key Details**:

- Uses **Fuse.js v7.0.0** for fuzzy matching
- Extended search enabled for operators (OR `|`, AND ` `)
- Searches across 4 fields: name, author, description, title
- Returns array of Package objects (not Fuse results)
- Pure function: same input = same output

#### Tag Search Function

```typescript
// Simplified version (without fp-ts)
export const tagsSearch =
  (packages: Package[]) =>
  (tags: string[]): Package[] => {
    return packages.filter((pkg) => pkg.tags.some((tag) => tags.includes(tag)));
  };
```

**Key Details**:

- Simple array filtering (no external library needed)
- **OR logic**: Package matches if it has ANY of the selected tags
- Case-sensitive string matching (tags are exact matches)
- Pure function with no side effects

### 2. Search State Management (`old/api/search.ts`)

The `usePackageSearch` hook manages search state and URL synchronization:

#### State Structure

```typescript
type SearchParams = {
  query: Option<TextSearch>; // Current text search query
  tags: Option<NonEmptyArray<string>>; // Selected tag filters
};
```

**Simplified Modern Version**:

```typescript
type SearchParams = {
  query: string | null;
  tags: string[] | null;
};
```

#### URL Parameter Format

- **Text Query**: `?q=search%20term` (URL-encoded string)
- **Tags**: `?t=tag1,tag2,tag3` (comma-separated, alphabetically sorted, URL-encoded)
- **Combined**: `?q=emoji&t=fun,productivity`

#### Hook API

```typescript
const {
  query, // Current search query (from URL)
  tags, // Current selected tags (from URL)
  setQuery, // Update search query and URL
  setTags, // Update selected tags and URL
  search, // Update both query and tags
} = usePackageSearch({ searchPathname: "/search" });
```

**Behavior**:

1. Reads URL parameters on mount and when router updates
2. `setQuery` / `setTags` immediately update URL via `router.push()`
3. URL changes trigger router query updates
4. Component re-renders with new query/tags from URL
5. Search executes client-side with new parameters

### 3. Tag Counting (`old/api/tags.ts`)

Generates tag statistics for the filter UI:

```typescript
type TagCount = {
  tag: string;
  count: number;
};

// Simplified implementation
export const tagsCount = (packages: Package[]): TagCount[] => {
  // Extract all unique tags
  const allTags = [...new Set(packages.flatMap((p) => p.tags))];

  // Count packages per tag
  const counts = allTags.map((tag) => ({
    tag,
    count: packages.filter((p) => p.tags.includes(tag)).length,
  }));

  // Sort by count (descending)
  return counts.sort((a, b) => b.count - a.count);
};
```

**Usage**: Powers the checkbox labels like "emoji (42)" showing tag name + package count.

## UI Components

### 1. Search Page (`old/pages/search.tsx`)

Main search interface combining all components.

#### Data Flow in Component

```typescript
// 1. Get packages from static props
const { packages } = props;  // From getStaticProps

// 2. Get search state from URL
const { query, tags, setQuery, setTags } = usePackageSearch();

// 3. Apply filters sequentially
const filterBySearch = (packages: Package[]): Package[] => {
  if (!query) return packages;
  return textSearch(packages)(query);
};

const filterByTags = (packages: Package[]): Package[] => {
  if (!tags || tags.length === 0) return packages;
  return tagsSearch(packages)(tags);
};

const results = packages
  |> filterBySearch
  |> filterByTags;

// 4. Render results
return renderSearchResults(results);
```

#### Layout Structure

**Desktop**:

```
┌─────────────────────────────────────┐
│ Navbar with Search Input            │
├────────┬────────────────────────────┤
│ Tags   │ Results Summary            │
│ Filter │ ----------------------     │
│ Sidebar│ Selected Tag Badges        │
│        │ ----------------------     │
│ ☑ tag1 │ [Package Card]             │
│ ☑ tag2 │ [Package Card]             │
│ ☐ tag3 │ [Package Card]             │
│ ☐ tag4 │ ...                        │
│ ...    │                            │
└────────┴────────────────────────────┘
```

**Mobile/Tablet**:

```
┌─────────────────────────────────────┐
│ Navbar with Search Input            │
├─────────────────────────────────────┤
│ Results Summary                      │
│ "Filter by tags" button → opens     │
│ side sheet drawer                    │
│ ─────────────────────────            │
│ Selected Tag Badges                  │
│ ─────────────────────────            │
│ [Package Card]                       │
│ [Package Card]                       │
│ ...                                  │
└─────────────────────────────────────┘
```

#### Key Interactions

1. **Text Search**:
   - User types in Navbar search input
   - Presses Enter
   - `setQuery()` called → URL updates → results filter

2. **Tag Selection**:
   - User clicks checkbox in sidebar/sheet
   - `onCheckboxesChange()` → `setTags()` → URL updates → results filter

3. **Tag Badge Click** (in results):
   - Clicking a tag in package cards
   - Replaces current tag selection with single clicked tag
   - `setTags([clickedTag])`

4. **Tag Badge Remove** (in active filters):
   - Cross icon on active tag badges
   - Removes tag from selection
   - `setTags(remainingTags)`

5. **Clear Search**:
   - "Clear search" link
   - `setQuery(null)` → removes query parameter

### 2. Navbar Component (`old/components/Navbar.tsx`)

Persistent header with integrated search.

**Search Input**:

```typescript
<SearchInput
  appearance="navbar"
  placeholder="Search for wonderful packages!"
  onKeyDown={onEnter}  // Detect Enter key
  onChange={setSearchValue}
  value={searchValue}
/>

const onEnter = (event) => {
  if (event.key === "Enter") {
    props.onSearchEnter?.(event.currentTarget.value);
  }
};
```

**Responsive Behavior**:

- **Desktop**: Full-width search bar in navbar
- **Tablet**: Medium-width search bar
- **Mobile**: Full-width search OR hidden (on landing page)

**Integration**:

```typescript
// In search page
<Navbar
  searchInitialValue={query || ""}
  onSearchEnter={(value) => setQuery(value)}
/>
```

### 3. SearchBar Component (`old/components/SearchBar.tsx`)

**Note**: Different from Navbar search input. Used on landing page hero section.

Simpler component with:

- Controlled input with internal state
- Search icon button
- Enter key submission
- Callback on search: `onSearch(text: string)`

**Landing Page Usage**:

```typescript
<SearchBar
  onSearch={(text) => router.push(`/search?q=${encodeURIComponent(text)}`)}
  placeholder="Search packages..."
/>
```

### 4. CheckboxGroup Component (`old/components/CheckboxGroup.tsx`)

Renders tag filter checkboxes with counts.

**Props**:

```typescript
type CheckboxItem = {
  key: string; // Tag name
  label: string; // Display text: "emoji (42)"
  checked: boolean; // Is currently selected
};

type Props = {
  title: string;
  items: CheckboxItem[];
  onChange: (items: CheckboxItem[], lastUpdated: string) => void;
  limit?: number; // Show only first N items (with "More" button)
};
```

**Features**:

- Checkbox list with custom labels
- "More" button to expand beyond limit (default: 15 visible)
- Calls onChange with ALL items when any checkbox changes
- Internal state synchronized with prop changes

**Usage in Search Page**:

```typescript
// Build checkbox items from tag counts
const tagsCheckboxes = tagsCount(packages).map(({ tag, count }) => ({
  key: tag,
  label: `${tag} (${count})`,
  checked: selectedTags.includes(tag),
}));

<CheckboxGroup
  title="Tags"
  items={tagsCheckboxes}
  onChange={(items) => {
    const selected = items.filter(i => i.checked).map(i => i.key);
    setTags(selected.length > 0 ? selected : null);
  }}
  limit={15}
/>
```

### 5. TagBadgeGroup Component (`old/components/Tags/TagBadgeGroup.tsx`)

Displays active tag filters as removable badges.

**Props**:

```typescript
type Props = {
  tags: string[];
  onClick: (tag: string) => void; // Click badge body
  onRemove?: (tags: string[], removed: string) => void; // Click X icon
};
```

**Features**:

- Displays unique tags (case-insensitive deduplication)
- Removable badges (with X icon) if `onRemove` provided
- Clickable badges to trigger actions (e.g., single-tag filter)
- Horizontal flex layout with wrapping

**Usage in Search Page**:

```typescript
{tags && tags.length > 0 && (
  <TagBadgeGroup
    tags={tags}
    onClick={(tag) => setTags([tag])}  // Click badge → filter to only this tag
    onRemove={(remainingTags) => setTags(remainingTags.length > 0 ? remainingTags : null)}
  />
)}
```

### 6. PackageCard Component

Displays individual package in search results.

**Relevant Props**:

```typescript
type Props = {
  package: Package;
  onTagClick?: (tag: string) => void; // Make tags clickable
};
```

**Tag Click Behavior**:

- Each tag badge in package card is clickable
- Clicking tag → navigates to search page with that tag selected
- `onTagClick={(tag) => setTags([tag])}`

## Data Flow Diagram

### Complete Search Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BUILD TIME (Static Site Generation)                      │
├─────────────────────────────────────────────────────────────┤
│ Fetch Package Index → getStaticProps                        │
│         ↓                                                    │
│ Group Packages by Name → Latest Versions                    │
│         ↓                                                    │
│ Serialize into Static Page Props                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PAGE LOAD (Client-Side Hydration)                        │
├─────────────────────────────────────────────────────────────┤
│ Static HTML + Props → React Hydration                       │
│         ↓                                                    │
│ usePackageSearch Hook Initialization                        │
│         ↓                                                    │
│ Read URL Query Params (?q= and ?t=)                         │
│         ↓                                                    │
│ Parse & Decode → Initial State                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FILTERING (Client-Side, Instant)                         │
├─────────────────────────────────────────────────────────────┤
│ All Packages (from props)                                   │
│         ↓                                                    │
│ Apply Text Search (if query exists)                         │
│    → Fuse.js fuzzy matching                                 │
│         ↓                                                    │
│ Apply Tag Filter (if tags exist)                            │
│    → Array.filter with tag inclusion                        │
│         ↓                                                    │
│ Filtered Results                                            │
│         ↓                                                    │
│ Render Package Cards                                        │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────────┐
│ 4. USER INTERACTION (Triggers Re-Filter)                    │
├─────────────────────────────────────────────────────────────┤
│ User Action:                                                │
│   • Types in search input + Enter                           │
│   • Checks/unchecks tag checkbox                            │
│   • Clicks tag badge (in card or active filters)            │
│   • Removes tag from active filters                         │
│         ↓                                                    │
│ Call setQuery() or setTags()                                │
│         ↓                                                    │
│ Update URL Query Parameters                                 │
│    → router.push({ query: newParams })                      │
│         ↓                                                    │
│ Router State Change                                         │
│         ↓                                                    │
│ usePackageSearch Re-Reads URL                               │
│         ↓                                                    │
│ Component Re-Renders                                        │
│         ↓                                                    │
│ Filters Re-Execute (goto step 3) ────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Fuse.js Configuration

**Version**: 7.0.0

**Search Options**:

```typescript
const textSearchOptions: IFuseOptions<Package> = {
  useExtendedSearch: true, // Enables special operators
  keys: ["name", "author", "description", "title"],
};
```

**Extended Search Operators**:

- `'word` - Exact match
- `^word` - Prefix-exact-match
- `!word` - Exclude
- `word1 word2` - AND (implicit)
- `word1 | word2` - OR

**Search Quality**:

- No threshold specified (uses Fuse.js default: 0.6)
- No distance or location configured (searches entire text)
- No weights (all keys equally important)

### URL State Management

**Why URL-based state?**

1. **Shareability**: Users can copy/paste search URLs
2. **Browser History**: Back/forward buttons work naturally
3. **Bookmarkability**: Save specific searches
4. **No Extra State Library**: Uses Next.js router (built-in)

**URL Encoding**:

```typescript
// Query encoding
const encodeQuery = (query: string) => encodeURIComponent(query);
const decodeQuery = (param: string) => decodeURIComponent(param);

// Tags encoding (comma-separated, sorted)
const encodeTags = (tags: string[]) =>
  encodeURIComponent(tags.sort().join(","));

const decodeTags = (param: string) => decodeURIComponent(param).split(",");
```

**Router Push Strategy**:

- Uses `router.push()` (not `replace`) to maintain history
- Shallow routing (no page reload, props unchanged)
- Query parameters only (pathname stays `/search`)

### Responsive Design

**Breakpoints** (via `useResponsive` hook):

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Filter UI Adaptation**:

- **Desktop**: Sidebar always visible (flex: 1, left side)
- **Mobile/Tablet**: Side sheet drawer (80% width, slides from left)

**Search Input Adaptation**:

- **Desktop**: Full width in navbar
- **Tablet**: Medium width
- **Mobile**: Full width or hidden (landing page variant)

### Case Sensitivity

**Text Search** (Fuse.js):

- Case-insensitive by default
- "Emoji" matches "emoji", "EMOJI", "eMoJi"

**Tag Filtering**:

- Custom case-insensitive equality:

```typescript
const tagEq = {
  equals: (x: string, y: string) => x.toLowerCase() === y.toLowerCase(),
};
```

- Tag "Fun" matches filter "fun"

### Performance Characteristics

**Search Execution**:

- **Client-side only** (no server requests)
- **Instant results** (no debouncing on filter changes)
- **Linear complexity** with package count
- **Memory**: All packages loaded in browser

**Scalability Limits**:

- Package count: ~100-500 packages (reasonable performance)
- Beyond 1000 packages: Consider server-side search or indexing
- Fuse.js index: Re-created on every search execution (not cached)

**Optimization Opportunities**:

1. Memoize Fuse instance (create once, reuse)
2. Debounce text input (wait for typing to stop)
3. Virtual scrolling for large result sets
4. Web Workers for search execution

## Empty States

### No Results Found

When `results.length === 0`:

```
┌─────────────────────────────────┐
│         🔍                      │
│                                 │
│   Sorry! No results found!      │
│                                 │
│   Can't find what you're        │
│   looking for?                  │
│   create your own package!      │
│   (links to docs)               │
└─────────────────────────────────┘
```

### Has Results

Every search result page shows at bottom:

```
[Package Card]
[Package Card]
...

─────────────────────────
Nothing fits you?
Create your own package!
(links to docs)
─────────────────────────
```

## Migration Checklist for New Project

### Core Functionality

- [ ] Install Fuse.js (`npm install fuse.js`)
- [ ] Create search service/utility functions
  - [ ] `textSearch(packages, query)` function
  - [ ] `tagsSearch(packages, tags)` function
  - [ ] `tagsCount(packages)` function
- [ ] Create search state hook
  - [ ] Read URL query parameters
  - [ ] Provide `query`, `tags`, `setQuery`, `setTags`
  - [ ] Update URL on state changes
- [ ] Handle URL encoding/decoding properly

### UI Components

- [ ] Search input component (in navbar/header)
- [ ] Search page with filter sidebar
- [ ] Checkbox group for tag filtering
- [ ] Tag badge group for active filters
- [ ] Package card with clickable tags
- [ ] Empty state components
- [ ] Responsive side sheet/drawer for mobile

### Data Integration

- [ ] Fetch packages in loader/getStaticProps
- [ ] Pass packages to search page
- [ ] Ensure package type includes: name, author, description, title, tags
- [ ] Group packages by version (show latest by default)

### Features

- [ ] Text search with fuzzy matching
- [ ] Multi-tag filtering
- [ ] URL-based state persistence
- [ ] Combined text + tag filtering
- [ ] Tag count display
- [ ] Tag limit with "More" button (15 default)
- [ ] Clickable tags in package cards
- [ ] Removable tag badges
- [ ] Clear search functionality
- [ ] Results count display
- [ ] Responsive layout (mobile/tablet/desktop)

### Nice-to-Have Enhancements

- [ ] Debounced text input
- [ ] Memoized Fuse instance
- [ ] Search suggestions/autocomplete
- [ ] Advanced filters (sort, date range)
- [ ] Search analytics
- [ ] Keyboard navigation
- [ ] Accessibility (ARIA labels, screen reader support)

## Code Modernization Notes

**Replace fp-ts patterns with:**

```typescript
// OLD (fp-ts):
pipe(
  option.fromNullable(value),
  option.map(transform),
  option.getOrElse(constant(default))
)

// NEW (modern TS):
const result = value ? transform(value) : default;
// or
const result = value ?? default;
```

```typescript
// OLD (fp-ts):
pipe(array, array.filter(predicate), array.map(transform));

// NEW (modern TS):
array.filter(predicate).map(transform);
```

**Replace io-ts validation with Valibot** (already used in current project):

```typescript
// OLD:
const Package = t.type({
  name: t.string,
  tags: tp.nonEmptyArray(t.string),
});

// NEW (Valibot):
const PackageSchema = v.object({
  name: v.string(),
  tags: v.array(v.string(), [v.minLength(1)]),
});
```

## Key Files for Reference

### Core Logic

- `old/api/search.ts:11-29` - Search functions and Fuse.js config
- `old/api/search.ts:40-124` - usePackageSearch hook implementation
- `old/api/tags.ts:17-37` - Tag counting logic

### UI Components

- `old/pages/search.tsx:54-342` - Main search page with all interactions
- `old/components/Navbar.tsx:47-238` - Navbar with integrated search
- `old/components/SearchBar.tsx:16-59` - Standalone search input
- `old/components/CheckboxGroup.tsx:20-94` - Tag filter checkboxes
- `old/components/Tags/TagBadgeGroup.tsx:19-58` - Tag badge display

### Data Types

- `old/api/domain.ts:54-65` - Package type definition
- `old/api/tags.ts:6-9` - TagCount type

## Related Research

- `.windsurf/research/2025-01-21-espanso-hub-legacy-project-analysis.md` - Full legacy project analysis

---

**End of Research Document**
