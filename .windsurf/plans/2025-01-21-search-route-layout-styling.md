# Search Route Layout & Styling Implementation Plan

## Overview

Implement the visual layout and styling for the `/search` route using shadcn/ui components and Tailwind CSS, following the design patterns from the legacy Espanso Hub while using default light theme colors (custom colors will be applied later).

## Current State Analysis

**Existing Implementation**:

- ✅ Search logic functional in `app/routes/search.tsx`
- ✅ Instant text filtering with local state
- ✅ URL-based tag filtering (`?t=tag1,tag2`)
- ✅ shadcn/ui configured in `components.json`
- ✅ Tailwind CSS v4 with design tokens in `app/app.css`
- ❌ No UI components installed
- ❌ No styling or layout applied (basic HTML elements)
- ❌ No responsive design
- ❌ No reusable Header component

**Legacy Design Patterns to Preserve**:

- ContentRow max-widths: 992px (desktop) → 1024px (xl) → 1280px (xxl)
- Responsive breakpoints: mobile (<768px), tablet (768-991px), desktop (≥992px)
- Stack-based spacing with consistent gaps
- Card hover effects with elevation
- Side sheet for mobile filters
- 15 tag limit with "More" button

## Desired End State

A fully styled search page with:

1. **Reusable Header** component (navbar) for all routes
2. **Responsive layout** following legacy patterns
3. **PackageCard** components with hover states and clickable links
4. **Filter sidebar** (desktop) / Sheet (mobile)
5. **Tag badges** (removable for active filters)
6. **Empty state** UI when no results
7. **Proper spacing** and typography using Tailwind utilities

## What We're NOT Doing

- ❌ Custom color theming (using default shadcn colors)
- ❌ Dark mode support (light theme only for now)
- ❌ Package detail page implementation
- ❌ Search functionality changes (logic stays the same)
- ❌ Advanced animations (basic hover/transition only)

## Implementation Approach

**Component-First Strategy**: Build reusable UI components using shadcn/ui primitives, then compose them into the search page layout. Create layout utilities (ContentRow pattern) using Tailwind utilities instead of custom components.

## Phase 1: Setup shadcn/ui Components

### Overview

Install necessary shadcn/ui components and create utility helpers.

### Changes Required

#### 1. Install shadcn/ui Components

**Command**:

```bash
npx shadcn@latest add card button input checkbox badge sheet separator
```

**Components Added**:

- `card` - For PackageCard and content containers
- `button` - For actions (clear filters, show more)
- `input` - For search input
- `checkbox` - For tag filters
- `badge` - For tag badges
- `sheet` - For mobile filter drawer
- `separator` - For visual dividers

#### 2. Create Tailwind Utility Classes

**File**: `app/app.css`

Add after the `@layer base` section:

```css
@layer utilities {
  /* ContentRow - Responsive max-width containers */
  .content-row {
    @apply w-full px-4 mx-auto;
  }

  @media (min-width: 992px) {
    .content-row {
      @apply max-w-[992px];
    }
  }

  @media (min-width: 1200px) {
    .content-row {
      @apply max-w-[1024px];
    }
  }

  @media (min-width: 1400px) {
    .content-row {
      @apply max-w-[1280px];
    }
  }
}
```

#### 3. Create lib/utils.ts (if not exists)

**File**: `app/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Success Criteria

#### Automated Verification:

- [ ] Components installed: Check `app/components/ui/` directory exists
- [ ] Type checking passes: `npm run typecheck`
- [ ] No build errors: `npm run build`

#### Manual Verification:

- [ ] shadcn/ui components render without errors

---

## Phase 2: Create Reusable Header Component

### Overview

Build the navbar/header component that will be reused across all routes.

### Changes Required

#### 1. Header Component

**File**: `app/components/Header.tsx`

```tsx
import { Search } from "lucide-react";
import { Link } from "react-router";
import { Input } from "./ui/input";

interface HeaderProps {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export function Header({
  onSearchChange,
  searchValue = "",
  showSearch = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="content-row">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Espanso Hub</span>
          </Link>

          {/* Search Input - Desktop */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search for wonderful packages!"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="https://espanso.org/docs/get-started/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            <a
              href="https://espanso.org/docs/next/packages/creating-a-package/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Package
            </a>
            <Link
              to="/search"
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              Explore
            </Link>
          </nav>

          {/* Mobile Menu - TODO: Add hamburger menu */}
          <div className="md:hidden">
            {/* Placeholder for future mobile menu */}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Success Criteria

#### Automated Verification:

- [ ] Type checking passes: `npm run typecheck`
- [ ] Component imports successfully

#### Manual Verification:

- [ ] Header renders with logo and links
- [ ] Search input appears on desktop (hidden on mobile)
- [ ] Links are clickable and navigate correctly
- [ ] Sticky positioning works when scrolling

---

## Phase 3: Create PackageCard Component

### Overview

Build the card component for displaying package information with hover effects and clickable links.

### Changes Required

#### 1. PackageCard Component

**File**: `app/components/PackageCard.tsx`

```tsx
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { Package } from "~/model/packages";

interface PackageCardProps {
  package: Package;
  onTagClick: (tag: string) => void;
}

export function PackageCard({ package: pkg, onTagClick }: PackageCardProps) {
  return (
    <Link to={`/package/${pkg.name}`} className="block">
      <Card className="h-full transition-all hover:shadow-md hover:border-foreground/20 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{pkg.title}</CardTitle>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              v{pkg.version}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {pkg.description}
          </p>
          <p className="text-xs text-muted-foreground">By {pkg.author}</p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Success Criteria

#### Automated Verification:

- [ ] Type checking passes: `npm run typecheck`
- [ ] Component imports Package type correctly

#### Manual Verification:

- [ ] Card displays package information
- [ ] Hover effect shows shadow and border change
- [ ] Cursor changes to pointer on hover
- [ ] Clicking card navigates to package detail (404 is OK for now)
- [ ] Clicking tag badge filters without navigation

---

## Phase 4: Create Filter Components

### Overview

Build checkbox group for tag filtering and removable badge for active filters.

### Changes Required

#### 1. CheckboxFilterGroup Component

**File**: `app/components/CheckboxFilterGroup.tsx`

```tsx
import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface CheckboxFilterGroupProps {
  title: string;
  items: Array<{ tag: string; count: number; checked: boolean }>;
  onToggle: (tag: string) => void;
  limit?: number;
}

export function CheckboxFilterGroup({
  title,
  items,
  onToggle,
  limit = 15,
}: CheckboxFilterGroupProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <div className="space-y-2">
        {displayedItems.map(({ tag, count, checked }) => (
          <div key={tag} className="flex items-center space-x-2">
            <Checkbox
              id={`tag-${tag}`}
              checked={checked}
              onCheckedChange={() => onToggle(tag)}
            />
            <Label
              htmlFor={`tag-${tag}`}
              className="text-sm font-normal capitalize cursor-pointer flex-1"
            >
              {tag} ({count})
            </Label>
          </div>
        ))}
      </div>
      {hasMore && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          Show More
        </Button>
      )}
    </div>
  );
}
```

**Note**: Need to add `label` to shadcn components:

```bash
npx shadcn@latest add label
```

#### 2. RemovableBadge Component

**File**: `app/components/RemovableBadge.tsx`

```tsx
import { X } from "lucide-react";
import { Badge } from "./ui/badge";

interface RemovableBadgeProps {
  children: React.ReactNode;
  onRemove: () => void;
  onClick?: () => void;
}

export function RemovableBadge({
  children,
  onRemove,
  onClick,
}: RemovableBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1 pl-2.5 pr-1"
      onClick={onClick}
    >
      <span>{children}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="rounded-full hover:bg-background/50 p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
```

### Success Criteria

#### Automated Verification:

- [ ] Type checking passes: `npm run typecheck`

#### Manual Verification:

- [ ] Checkboxes toggle correctly
- [ ] "Show More" button reveals additional tags
- [ ] RemovableBadge X button removes the badge
- [ ] Clicking badge body triggers onClick (if provided)

---

## Phase 5: Create EmptyState Component

### Overview

Build the empty state UI for when no search results are found.

### Changes Required

#### 1. EmptyState Component

**File**: `app/components/EmptyState.tsx`

```tsx
import { FileX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filters",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
}
```

### Success Criteria

#### Automated Verification:

- [ ] Type checking passes: `npm run typecheck`

#### Manual Verification:

- [ ] Empty state displays icon, title, and description
- [ ] Optional action slot renders correctly

---

## Phase 6: Update Search Route with New Components

### Overview

Replace the basic HTML in the search route with the new styled components.

### Changes Required

#### 1. Update Search Route

**File**: `app/routes/search.tsx`

Replace the entire return statement with:

```tsx
import { Header } from "~/components/Header";
import { PackageCard } from "~/components/PackageCard";
import { CheckboxFilterGroup } from "~/components/CheckboxFilterGroup";
import { RemovableBadge } from "~/components/RemovableBadge";
import { EmptyState } from "~/components/EmptyState";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { SlidersHorizontal } from "lucide-react";

// ... existing imports and functions ...

export default function Search({
  loaderData: { packages },
}: Route.ComponentProps) {
  // ... existing state and logic ...

  // Prepare checkbox items
  const checkboxItems = tagCounts.map(({ tag, count }) => ({
    tag,
    count,
    checked: selectedTags.includes(tag),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearchChange={setTextQuery} searchValue={textQuery} />

      <main className="flex-1 bg-muted/20">
        <div className="content-row py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <CheckboxFilterGroup
                  title="Filter by Tags"
                  items={checkboxItems}
                  onToggle={toggleTag}
                  limit={15}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filter by Tags
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filter by Tags</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <CheckboxFilterGroup
                        title=""
                        items={checkboxItems}
                        onToggle={toggleTag}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Results Summary */}
              {(textQuery || selectedTags.length > 0) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredPackages.length} result
                      {filteredPackages.length !== 1 ? "s" : ""}
                      {textQuery && (
                        <span className="font-medium text-foreground">
                          {" "}
                          for "{textQuery}"
                        </span>
                      )}
                    </p>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear all
                    </Button>
                  </div>

                  {/* Active Tag Filters */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <RemovableBadge
                          key={tag}
                          onRemove={() => toggleTag(tag)}
                          onClick={() => {
                            // Keep focus on this tag
                          }}
                        >
                          {tag}
                        </RemovableBadge>
                      ))}
                    </div>
                  )}

                  <Separator />
                </div>
              )}

              {/* Results Grid */}
              {filteredPackages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {filteredPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      onTagClick={toggleTag}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No packages found"
                  description="Can't find what you're looking for?"
                  action={
                    <a
                      href="https://espanso.org/docs/next/packages/creating-a-package/"
                      className="text-sm text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Create your own package
                    </a>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Success Criteria

#### Automated Verification:

- [ ] Type checking passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] No linting errors

#### Manual Verification:

- [ ] Page renders with proper layout
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Filters work correctly
- [ ] Search input in header updates results
- [ ] Mobile sheet opens and closes
- [ ] Package cards are clickable
- [ ] Tag badges filter results
- [ ] Empty state shows when no results
- [ ] "Clear all" button resets filters

---

## Testing Strategy

### Manual Testing Steps

1. **Desktop Layout (≥992px)**:
   - [ ] Sidebar visible on left with 15 tags
   - [ ] "Show More" button expands full tag list
   - [ ] Content grid shows 1 column on lg, 2 columns on xl
   - [ ] Header search input visible

2. **Tablet Layout (768-991px)**:
   - [ ] Filter button shows (sidebar hidden)
   - [ ] Sheet opens from left on button click
   - [ ] Content shows 2 columns

3. **Mobile Layout (<768px)**:
   - [ ] Filter button visible
   - [ ] Single column layout
   - [ ] Header search hidden (mobile menu placeholder shown)

4. **Interactions**:
   - [ ] Type in search → instant results update
   - [ ] Click checkbox → URL updates with `?t=tag`
   - [ ] Click tag badge → adds to filters
   - [ ] Click X on active tag → removes filter
   - [ ] Click "Clear all" → resets everything
   - [ ] Hover package card → shadow appears
   - [ ] Click package card → navigates (even if 404)

5. **Edge Cases**:
   - [ ] Zero results → empty state shows
   - [ ] Clear filters from empty state → shows all packages
   - [ ] Multiple tags selected → all show in URL and badges

## References

- Original research: `.windsurf/research/2025-01-21-legacy-ui-design-structure.md`
- shadcn/ui docs: https://ui.shadcn.com
- Legacy search page: `old/pages/search.tsx`

---

**End of Implementation Plan**
