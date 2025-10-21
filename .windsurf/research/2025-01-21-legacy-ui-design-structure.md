---
date: 2025-01-21T21:58:00+02:00
researcher: Cascade AI
git_commit: 23b5ae74ba394552c74c81eefaf31f4532a3e83b
branch: main
repository: hub-frontend-new
topic: "Legacy Espanso Hub - UI/UX Design Structure and Component Architecture"
tags:
  [
    research,
    codebase,
    espanso-hub,
    legacy-analysis,
    ui-design,
    layout,
    components,
    design-patterns,
  ]
status: complete
last_updated: 2025-01-21
last_updated_by: Cascade AI
---

# Research: Legacy Espanso Hub - UI/UX Design Structure and Component Architecture

**Date**: 2025-01-21T21:58:00+02:00  
**Researcher**: Cascade AI  
**Git Commit**: 23b5ae74ba394552c74c81eefaf31f4532a3e83b  
**Branch**: main  
**Repository**: hub-frontend-new

## Research Question

Analyze the design structure, layout patterns, and UI component architecture of the legacy Espanso Hub to understand the design principles and patterns that should be preserved in the rewrite, independent of the specific UI library implementation (evergreen-ui).

## Summary

The legacy Espanso Hub follows a **component-based design system** with clear **layout primitives**, **responsive breakpoints**, and **design tokens**. The architecture emphasizes:

1. **Layout Composition** - Stack-based spacing, ContentRow containers, responsive utilities
2. **Design Token System** - Custom color palette (Espanso green), spacing scale (majorScale/minorScale), elevation levels
3. **Responsive Design** - Mobile-first with 3 device classes (mobile/tablet/desktop) and 6 breakpoints
4. **Component Hierarchy** - Layout primitives → UI components → Page compositions
5. **Visual Patterns** - Card-based layouts, badge system, tab interfaces, side sheets for mobile

**Key Design Principle**: The library (evergreen-ui) may change, but the spacing system, responsive breakpoints, color hierarchy, and component composition patterns should be preserved.

## Detailed Findings

### 1. Design Token System

#### Color Palette (`old/components/EspansoThemeProvider.tsx`)

**Primary Brand Color** - Espanso Green (#00a595):

- `green25` - `#e6f6f4` (lightest, backgrounds)
- `green100` - `#ccedea` (input backgrounds)
- `green500` - `#00a595` (primary brand, navbar, buttons)
- `green600` - `#008477` (footer background)
- `green700` - `#006359` (text on light backgrounds)
- `green900` - `#00211e` (darkest)

**Usage Pattern**:

- Primary blue colors are overridden with green for brand consistency
- Neutral colors (gray, muted) from base theme for secondary elements
- `white` for high-contrast text on dark backgrounds
- `blueTint` for banner backgrounds
- `tint2` for search page background
- `gray200` for content area backgrounds

#### Spacing System

**MajorScale** - Primary spacing unit (8px base)

- `majorScale(1)` = 8px
- `majorScale(2)` = 16px (standard padding)
- `majorScale(3)` = 24px
- `majorScale(4)` = 32px (section spacing)
- `majorScale(6)` = 48px (large spacing)
- `majorScale(8)` = 64px (navbar height)

**MinorScale** - Fine-tuned spacing (4px base)

- Used for small padding, border radius

**Application**:

- Cards: `padding={majorScale(2)}` (16px)
- Section margins: `marginTop={majorScale(6)}` (48px)
- Component spacing via Stack units parameter

#### Elevation System

- `elevation={0}` - Flat (inline badges)
- `elevation={1}` - Slight lift (content cards, navbar)
- `elevation={2}` - Medium lift (code blocks, navbar sticky)
- `hoverElevation={2}` - Interactive cards on hover

### 2. Layout Primitives

#### ContentRow Component (`old/components/layout/ContentRow.tsx`)

**Purpose**: Horizontal content wrapper with max-width constraints

**Structure**:

```
<Pane (outer: full-width, centered)>
  <Pane className="content-row" (inner: constrained-width)>
    {children}
  </Pane>
</Pane>
```

**Responsive Max-Widths** (`old/pages/index.css:28-62`):

- Mobile (< 576px): `100%` with 16px side padding
- Small (576px-767px): `100%`
- Medium (768px-991px): `100%`
- Large (992px-1199px): `992px` centered
- XL (1200px-1399px): `1024px` centered
- XXL (≥ 1400px): `1280px` centered

**Props Passthrough**: Accepts background, elevation, zIndex, flexGrow

**Usage**: Every major page section wrapped in ContentRow for consistent content width

#### Stack Component (`old/components/layout/Stack.tsx`)

**Purpose**: Flexbox layout with automatic spacing between children

**Key Features**:

- **Automatic spacing insertion** - Adds spacer `<Pane>` between child elements
- **Direction** - `row` (horizontal) or `column` (vertical)
- **Units** - Spacing magnitude using majorScale (e.g., units={2} = 16px gaps)
- **Filters nulls** - Removes null/undefined/false children before spacing

**Pattern**:

```tsx
<Stack units={2} direction="column">
  {item1}
  {item2}
  {item3}
</Stack>
// Renders: item1 + 16px space + item2 + 16px space + item3
```

**Common Uses**:

- `<Stack units={1}>` - Tight horizontal spacing (icon + text)
- `<Stack units={2}>` - Standard component spacing
- `<Stack units={3}` to `{6}>` - Section-level spacing

### 3. Responsive Design System

#### Breakpoints (`old/components/layout/useResponsive.tsx:14-21`)

**Six breakpoints** (matches Bootstrap):

- `xs`: 0px+
- `s`: 576px+
- `m`: 768px+ (tablet threshold)
- `l`: 992px+ (desktop threshold)
- `xl`: 1200px+
- `xxl`: 1400px+

**Three device categories**:

- **mobile**: xs, s (< 768px)
- **tablet**: m (768px-991px)
- **desktop**: l, xl, xxl (≥ 992px)

#### useResponsive Hook Pattern

**Returns**:

- `breakpoint` - Current breakpoint string
- `device` - Current device category
- `foldBreakpoints(match)` - Pattern match on breakpoints
- `foldDevices(match)` - Pattern match on devices

**Usage Pattern**:

```tsx
foldDevices({
  mobile: () => <MobileLayout />,
  tablet: () => <TabletLayout />,
  desktop: () => <DesktopLayout />,
});
```

**Responsive Adaptations**:

- Mobile: Single column, side sheets for filters/navigation, smaller font sizes
- Tablet: 2-column grids, some side sheets, medium font sizes
- Desktop: 3-column grids, sidebars, larger font sizes, additional features (e.g., copy button)

### 4. Component Architecture

#### Hierarchy

**Level 1: Layout Primitives**

- `ContentRow` - Page-width container
- `Stack` - Spaced flex layouts
- `useResponsive` - Breakpoint detection
- `useTabs` - Tab state management

**Level 2: UI Building Blocks**

- `PackageCard` - Package preview card
- `TagBadge` / `IconBadge` / `TagBadgeGroup` - Tag display
- `FeaturedBadge` - Featured indicator
- `SearchBar` - Search input with icon
- `CheckboxGroup` - Checkbox list with expand
- `CodeBlock` - Syntax-highlighted code (3 variants)
- `MDXRenderer` - Markdown rendering

**Level 3: Composite Components**

- `Navbar` - Header with search & navigation
- `Footer` - Footer with links
- `FeaturedShowcase` - Featured packages grid
- `ShareButton` - Share functionality
- `BetaBanner` - Dismissible banner

**Level 4: Page Layouts**

- `index.tsx` - Landing page
- `search.tsx` - Search/exploration page
- `[version].tsx` - Package detail page

### 5. Key UI Patterns

#### Card-Based Design

**Package Cards** (`old/components/PackageCard.tsx`):

- White background, border, hover elevation
- Min-height constraint (`majorScale(15)` = 120px)
- Flex column: Header (title + badges) → Description → Tags
- Clickable with Next.js Link wrapper
- Consistent padding (`majorScale(2)`)

**Content Cards**:

- Background variations: `white`, `default`, `muted`
- Elevation for depth: 1-2 typically
- Padding: `majorScale(5)` for large content (40px)

#### Badge System

**FeaturedBadge** (`old/components/featured/FeaturedBadge.tsx`):

- Green background (`green25`)
- BadgeIcon + "FEATURED" text in uppercase
- Small size (300), green text (`green700`)
- Rounded corners (`borderRadius={majorScale(2)}`)

**TagBadge** (`old/components/Tags/TagBadge.tsx`):

- Neutral color scheme
- Interactive (clickable)
- Capitalized text display

**IconBadge** (`old/components/Tags/IconBadge.tsx`):

- Tag with removable icon (CrossIcon)
- Separate click handlers for badge and icon
- Padding: `majorScale(2)`
- Height: `majorScale(4)` (32px)

**TagBadgeGroup**:

- Flex wrap with gap (`majorScale(1)`)
- Supports removable tags (optional onRemove)
- Deduplicates tags (case-insensitive)

#### Tab Interface Pattern (`old/components/layout/useTabs.tsx`)

**Two Variants**:

1. **Topbar** - Horizontal tabs at top (primary appearance)
2. **Sidebar** - Vertical tabs on side (secondary appearance)

**Features**:

- Zipper data structure for focus management
- Icon + label per tab
- Controlled visibility (show only selected panel)
- Auto-height: `majorScale(5)` (40px) for topbar

**Usage**:

```tsx
const tabs: TabProps[] = [
  {
    id: "desc",
    label: "Description",
    icon: <Icon />,
    render: () => <Content />,
  },
];
const [tabList, panels, currentTab] = useTabs(tabs, "topbar");
```

#### Side Sheet Pattern (Mobile)

**Usage**:

- Filter panel on search page
- YAML file navigation on package page

**Pattern**:

```tsx
<SideSheet
  position={Position.LEFT}
  isShown={showSideSheet}
  onCloseComplete={() => setShowSideSheet(false)}
  width="80%"
>
  <Pane>{content}</Pane>
</SideSheet>
```

**Trigger**: Icon + text link (e.g., "Filter by tags")

#### Code Display System (`old/components/CodeBlock.tsx`)

**Three Variants**:

1. **Default** - Block code with syntax highlighting
   - Background: `default` (dark)
   - Optional copy button with popover feedback
   - Syntax: yaml, shell, plaintext
   - Uses highlight.js with atom-one-dark theme

2. **Inline** - Inline code snippets
   - Background: `muted` (light gray)
   - No elevation, minimal padding
   - Used for: `<code>`, `<inlineCode>`, `<kbd>` in markdown

3. **Incremental** - Large files loaded in chunks
   - Shows N lines at a time (100 line chunks)
   - "Show more" button to load next chunk
   - Used for YAML source files

**Color Coding**:

- YAML: Green text (`#98c379`)
- Other: White text

### 6. Page Layout Patterns

#### Landing Page Structure (`old/pages/index.tsx`)

**Two Full-Height Sections**:

1. **Hero Section** (`minHeight: 100vh`):
   - Background image (SVG layered-waves pattern)
   - Centered content with Stack layout
   - Heading (size 1000) + Subheading (size 600)
   - Large search bar (600px width on desktop/tablet, 100% mobile)
   - Chevron down scroll indicator

2. **Featured Showcase** (`minHeight: 90vh`):
   - ContentRow wrapping
   - Featured packages in responsive grid:
     - Mobile: Single column
     - Tablet: 2 columns (45% width each)
     - Desktop: 3 columns (30% width each)
   - Margin top: `majorScale(6)` between cards

**Color Hierarchy**:

- Hero: Transparent navbar, white text
- Featured: White background, default navbar (green)
- Footer: Green background

#### Search Page Structure (`old/pages/search.tsx`)

**Three ContentRow Sections**:

1. **BetaBanner** - Dismissible info banner (`background="blueTint"`)

2. **Navbar** - Sticky header (`background="green500", elevation={2}, zIndex={1}`)

3. **Main Content** (`background="tint2", flexGrow={1}`):
   - **Desktop**: Sidebar (flex 1) + Results (flex 3)
   - **Mobile/Tablet**: Side sheet for filters + full-width results

**Layout Flow**:

```
[Query summary (if searching)]
[Filter button (mobile/tablet only)]
[Selected tags (if any)]
[Package cards list OR empty state]
```

**Filter Panel**:

- CheckboxGroup with 15 visible tags (desktop)
- "More" expand button for additional tags
- Tag counts shown: "tag-name (count)"

#### Package Detail Page Structure (`old/pages/[packageName]/v/[version].tsx`)

**Four ContentRow Sections**:

1. **BetaBanner** (`background="blueTint"`)

2. **Navbar** (`background="green500", elevation={2}, zIndex={1}`)

3. **Package Header** (`elevation={1}, zIndex={1}, paddingTop={majorScale(4)}`):
   - **Desktop**: Two columns
     - Left (flex 2): Title, author, description, tags
     - Right (flex 1): Installation command box
   - **Mobile/Tablet**: Single column, no installation box

   **Header Elements**:
   - Title (900/800/600 heading size)
   - Featured badge (if applicable)
   - Share button + GitHub link + Version dropdown
   - Package name (muted text)
   - Author name (muted text)
   - Description paragraph
   - Tag badges (clickable for filtering)

4. **Tabbed Content** (`background="gray200", flexGrow={1}`):
   - **Description Tab**: MDXRenderer with custom markdown components
   - **Source Tab**:
     - Desktop: Sidebar YAML file selector + code viewer
     - Mobile: Side sheet YAML file selector + code viewer
   - Content wrapped in Card with elevation={1}, white background, padding={majorScale(5)}

**Version Management**:

- SelectMenu dropdown in header
- Dynamic routing: `/[packageName]` (latest) or `/[packageName]/v/[version]` (specific)
- Installation command shows version flag only if not latest

### 7. Typography & Text Hierarchy

#### Heading Sizes (evergreen-ui mapping):

- **1000**: 42px - Hero titles
- **900**: Large page titles (desktop package name)
- **800**: Section titles, tablet package name
- **700**: Subsections
- **600**: Medium headings, mobile package name
- **400-300**: Small headings, fine print

#### Text Sizes:

- **600**: Links in navbar
- **500**: Body text, results summary
- **400**: Secondary text, author info, package name
- **300**: Muted text, tag labels, fine print

#### Text Colors:

- **Primary**: Default (black/dark gray)
- **Muted**: Secondary information
- **Green700**: Featured badge text
- **Green500**: Links, accents
- **White**: Text on dark backgrounds (navbar, footer)

### 8. Interaction Patterns

#### Clickable Elements

**Cursor Feedback** (`index.css:6-8`):

```css
.clickable:hover {
  cursor: pointer;
}
```

**Applied to**:

- Cards (package cards have hover elevation)
- Icons (search icon, menu icon, chevron down)
- Text links with underline
- Badges (tags, featured)
- "Show more" buttons

#### Search Behavior

**SearchBar** (`old/components/SearchBar.tsx`):

- Enter key triggers search
- Icon click triggers search
- No auto-search on type (controlled behavior)
- Redirects to `/search?q={query}`

**Navbar Search**:

- Appears on all pages except landing (where it's in hero)
- Persistent across navigation
- Pre-filled with current query on search page

#### Tag Interaction

**Two Modes**:

1. **Non-removable** (package cards, package header):
   - Click → Navigate to `/search?t={tag}`
   - Single-tag filter

2. **Removable** (search results):
   - Click badge → Refocus on that tag
   - Click X icon → Remove from active filters
   - Multi-tag filtering supported

#### Share Functionality

**Two Methods**:

1. **Native Share API** (mobile devices):
   - Uses `navigator.share()`
   - Title + description + URL

2. **Link Sharing** (desktop fallback):
   - Copy link to clipboard (with toast notification)
   - Email link (feature-flagged, disabled)
   - Popover menu with options

### 9. Markdown Rendering (`old/components/MDXRenderer.tsx`)

#### Custom Component Mapping

**Tables**:

- `<table>` → `Table` component
- `<thead>` → `Table.Head` with `Table.TextHeaderCell`
- `<tbody>` → `Table.Body`
- `<tr>` → `Table.Row`
- `<td>` → `Table.Cell` with `Text` wrapper

**Headings**:

- `<h1>` → size 900, `marginTop={majorScale(4)}`, `marginBottom={majorScale(2)}`
- `<h2>` → size 800, same margins
- `<h3>` → size 700, same margins
- `<h4>` → size 600, `marginTop={majorScale(2)}`, `marginBottom={majorScale(2)}`
- `<h5>`, `<h6>` → size 400, 300

**Text & Code**:

- `<p>` → Paragraph size 500, `marginTop={majorScale(2)}`, `marginBottom={majorScale(2)}`
- `<code>` → CodeBlock default variant with copy button
- `<inlineCode>`, `<kbd>` → CodeBlock inline variant
- `<span>` → Text with flex display

**Lists**:

- `<ul>` → UnorderedList
- `<li>` → ListItem

**Images**:

- GitHub URL resolution (raw.githubusercontent.com)
- Relative path → Absolute GitHub raw URL
- `maxWidth="100%"`, `display="block"`

#### Asset Resolution (`old/api/assets.ts`)

**GitHub URL Types**:

1. `raw.githubusercontent.com` - Direct raw content
2. `github.com/*/raw/*` - Raw file view
3. `github.com/*/blob/*` - Blob view → Convert to raw
4. Relative paths → Construct full GitHub URL from repository homepage

### 10. Mobile Optimization Patterns

#### Navigation

**Desktop**:

- Full navbar with visible links (Documentation, Create Package, Explore)
- Logo with full text

**Mobile**:

- Hamburger menu (Popover with Menu)
- Compact logo (icon only)
- Search input takes priority

#### Filters

**Desktop**:

- Persistent sidebar (flex 1)
- 15 visible tags with "More" expand

**Mobile/Tablet**:

- Collapsible side sheet (80% width)
- "Filter by tags" button with ChevronRightIcon

#### Content

**Desktop**:

- Installation command visible in package header
- Sidebar tab navigation for YAML files
- 3-column featured packages grid

**Mobile**:

- No installation command (space constraint)
- Side sheet for YAML file selection
- Single column featured packages

**Font Size Scaling**:

- Package title: 900 → 800 → 600
- Text: 500 → 400 → 300
- Responsive via `foldDevices()`

### 11. Empty States

#### No Search Results (`old/pages/search.tsx:157-171`)

**Layout**:

- Centered Stack (units={3}, direction="column")
- EmptyResultsIcon (SVG illustration)
- Heading: "Sorry! No results found!"
- Subtext: "Can't find what you're looking for?"
- CTA link: "create your own package!"

#### Fallback Content

**Package Detail Page**:

- If no README: Show fallback tab with "No data available"
- Graceful degradation for missing data

### 12. Visual Design Tokens Summary

**Border Radius**:

- Small: 2px (Tab selector, Input)
- Medium: `minorScale(1)` = 4px (SearchBar)
- Large: `majorScale(2)` = 16px (FeaturedBadge)

**Borders**:

- Default: 1px solid
- Right border: Used for column dividers (desktop package header)

**Shadows** (via elevation):

- Controlled by evergreen-ui elevation prop
- 0 = none, 1 = subtle, 2 = medium

**Transitions**:

- Hover effects: 0.4s transition on link colors
- Color shift: `#d8dae5` (faded white)

## Code References

### Layout & Spacing

- `old/components/layout/ContentRow.tsx:8-14` - ContentRow component structure
- `old/components/layout/Stack.tsx:16-41` - Stack spacing logic
- `old/pages/index.css:28-62` - Responsive max-widths
- `old/components/EspansoThemeProvider.tsx:6-30` - Color palette

### Responsive System

- `old/components/layout/useResponsive.tsx:14-21` - Breakpoint definitions
- `old/components/layout/useResponsive.tsx:45-55` - Device mapping
- `old/components/layout/useResponsive.tsx:61-62` - foldDevices utility

### Component Patterns

- `old/components/PackageCard.tsx:21-57` - Card layout structure
- `old/components/Navbar.tsx:47-238` - Responsive navbar variants
- `old/components/featured/FeaturedShowcase.tsx:23-51` - Responsive grid
- `old/components/layout/useTabs.tsx:35-136` - Tab management system

### Page Layouts

- `old/pages/index.tsx:45-49` - FullHeightSection wrapper
- `old/pages/index.tsx:94-175` - Landing page structure
- `old/pages/search.tsx:270-339` - Search page layout
- `old/pages/[packageName]/v/[version].tsx:179-332` - Package header layout
- `old/pages/[packageName]/v/[version].tsx:334-430` - Tabbed content structure

### Design Tokens

- `old/components/EspansoThemeProvider.tsx:33-116` - Theme customization
- `old/pages/index.css:1-63` - Global styles and utilities

## Architecture Insights

### Design Principles

1. **Composition Over Configuration**
   - Small, focused layout primitives (ContentRow, Stack)
   - Combine simple components to build complex layouts
   - Props passthrough for flexibility

2. **Responsive by Default**
   - Mobile-first CSS
   - foldDevices pattern enforces responsive thinking
   - Three device categories simplify decision-making

3. **Consistent Spacing**
   - majorScale creates visual rhythm
   - Stack units parameter standardizes gaps
   - Reduces arbitrary spacing decisions

4. **Token-Based Design**
   - Color palette in theme
   - Spacing via scale functions
   - Elevation levels for depth
   - Typography sizes defined

5. **Progressive Enhancement**
   - Base layout works on all devices
   - Desktop adds features (installation command, persistent sidebar)
   - Mobile uses overlays (side sheets) to save space

### Layout Patterns

**Page Structure Template**:

```tsx
<Pane flexDirection="column" minHeight="100vh">
  <ContentRow background="X"><BetaBanner /></ContentRow>
  <ContentRow background="Y" elevation={2}><Navbar /></ContentRow>
  <ContentRow background="Z" flexGrow={1}>{Main Content}</ContentRow>
  <ContentRow background="W"><Footer /></ContentRow>
</Pane>
```

**Responsive Content Template**:

```tsx
foldDevices({
  mobile: () => <SingleColumn />,
  tablet: () => <TwoColumn />,
  desktop: () => <ThreeColumn />,
});
```

**Card Grid Template**:

```tsx
<Pane display="flex" flexWrap="wrap" justifyContent="space-between">
  {items.map((item) => (
    <Pane flexBasis="30%" marginTop={majorScale(6)}>
      <Card />
    </Pane>
  ))}
</Pane>
```

### Component Composition Patterns

**Badge + Icon Pattern**:

```tsx
<Stack units={1}>
  <Icon />
  <Text>{label}</Text>
</Stack>
```

**Header with Actions Pattern**:

```tsx
<Pane display="flex">
  <Stack units={3}>{Title + Badges}</Stack>
  <Pane flexGrow={1} />
  <Stack units={1}>{Action Buttons}</Stack>
</Pane>
```

**Vertical Section Pattern**:

```tsx
<Stack units={2} direction="column">
  {items.map((item) => (
    <Component key={item.id} />
  ))}
</Stack>
```

## Design System Translation Guide

### From evergreen-ui to Modern UI Library

**Mapping Concepts (Library-Agnostic)**:

| Concept    | Evergreen-UI                     | Generic Pattern                           |
| ---------- | -------------------------------- | ----------------------------------------- |
| Container  | `<Pane>`                         | `<div>` with flexbox/grid                 |
| Spacing    | `majorScale(n)`, `minorScale(n)` | CSS custom properties: `--spacing-{size}` |
| Colors     | `espansoTheme.colors.green500`   | CSS variables: `--color-primary-500`      |
| Elevation  | `elevation={1}`                  | `box-shadow` utility classes              |
| Responsive | `foldDevices()`                  | Media queries or container queries        |
| Typography | `size={600}`                     | Font size scale: `text-lg`, `text-base`   |

**Preservation Priorities**:

1. ✅ **Spacing Scale**: Keep 8px base (majorScale), 4px minor
2. ✅ **Breakpoints**: 768px (tablet), 992px (desktop)
3. ✅ **Color Palette**: Espanso green with 9 shades
4. ✅ **ContentRow Max-Widths**: 992px → 1024px → 1280px
5. ✅ **Component Composition**: Stack, ContentRow patterns
6. ✅ **Responsive Grid**: 1 col → 2 col → 3 col for featured packages
7. ⚠️ **Tab Variants**: Top bar (horizontal) and sidebar (vertical)
8. ⚠️ **Code Highlighting**: atom-one-dark theme feel

**New Implementation Recommendations**:

- Use **Tailwind CSS** or **CSS-in-JS** with design tokens
- Implement **Stack** as utility (gap-2, gap-4, etc.) or component
- Use **React hooks** for responsive (no fp-ts fold pattern needed)
- **shadcn/ui** or **Radix UI** for accessible primitives
- Keep **card hover effects**, **badge system**, **side sheets**

## Open Questions

1. **Design System Tooling**: Should design tokens be managed via CSS variables, Tailwind theme, or TypeScript constants?
2. **Icon Library**: Legacy uses evergreen-ui icons - switch to Lucide, Heroicons, or custom SVGs?
3. **Accessibility**: What ARIA patterns should be added to improve keyboard navigation and screen reader support?
4. **Dark Mode**: Should the new design system support dark mode from the start?
5. **Animation**: Are there specific animation/transition requirements beyond hover states?
6. **Custom Fonts**: Legacy uses default + Quicksand for logo - should this be expanded?
7. **Grid System**: Should the rewrite use CSS Grid more extensively vs. flexbox?
8. **Component Library**: Build custom or use headless UI library (Radix, HeadlessUI, etc.)?

## Related Research

- `.windsurf/research/2025-01-21-espanso-hub-legacy-project-analysis.md` - Full feature and data flow analysis
- `.windsurf/research/2025-01-21-search-functionality-overview.md` - Search implementation details

---

**End of Research Document**
