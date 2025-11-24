# Page Design Pattern Guidelines

Reference documentation for maintaining structural consistency across all pages in the RUCKUS 1 API Workbench.

**Source of Truth:** `frontend/src/components/VenuesPage.tsx`

---

## Philosophy

- **Structure is documented here** (component ordering, state patterns, handler patterns)
- **Styling references VenuesPage** (copy classes from the canonical implementation)
- **When design changes**, only update components - documentation stays valid

---

## Page Structure Pattern

### Component Architecture

```typescript
export const YourPage: React.FC = () => {
  // 1. Core state
  const [items, setItems] = useState<YourType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 2. Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 3. Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMaxConcurrent, setDeleteMaxConcurrent] = useState(5);
  const [deleteDelayMs, setDeleteDelayMs] = useState(500);
  const [deleteWaitMode, setDeleteWaitMode] = useState<'track' | 'fire'>('track');
  const [isDeleting, setIsDeleting] = useState(false);

  // 4. Session tracking
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  // 5. Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 6. Fetch function (NOT useCallback)
  const fetchItems = async () => { /* ... */ };

  // 7. Single useEffect with auto-refresh
  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, []);

  // 8. Handler functions with inline comments
  // 9. Conditional views (progress → form → main)
  // 10. Main return
};
```

### Conditional Views Order (CRITICAL)

```typescript
// Check in this exact order:
if (deleteSessionId) {
  return <ProgressTrackingView />;
}

if (showCreateForm) {
  return <CreateFormView />;
}

return <MainPageView />;
```

---

## Main View Section Order

```typescript
return (
  <div className="space-y-6">
    {/* 1. Header Section */}
    {/* 2. Error Message */}
    {/* 3. Loading State */}
    {/* 4. Delete Confirmation Dialog */}
    {/* 5. Main Table/Content */}
    {/* 6. API Logs Panel */}
  </div>
);
```

**Rule:** Delete dialog MUST come before the main table section.

---

## Component Patterns

### 1. Header Section

**Structure:**
```typescript
<div className="[COPY CONTAINER STYLES FROM VENUESPAGE]">
  <div className="flex justify-between items-center">
    <div>
      <h2 className="[COPY TITLE STYLES]">Page Title</h2>
      <p className="[COPY DESCRIPTION STYLES]">
        Description text
        {lastRefresh && (
          <span className="ml-2">
            • Last updated: {formatTimestamp(lastRefresh)}
          </span>
        )}
      </p>
    </div>
    <button
      onClick={handleRefresh}
      disabled={isRefreshing || isLoading}
      className="[COPY REFRESH BUTTON STYLES FROM VENUESPAGE]"
    >
      <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>
</div>
```

**Key:** Copy exact styling from VenuesPage header.

### 2. Error Message

**Structure:**
```typescript
{error && (
  <div className="[COPY ERROR CONTAINER STYLES]">
    <div className="flex items-start gap-3">
      <span className="[COPY ICON STYLES]">⚠</span>
      <div className="flex-1">
        <h3 className="[COPY ERROR TITLE STYLES]">Error Loading Items</h3>
        <p className="[COPY ERROR TEXT STYLES]">{error}</p>
        <button
          onClick={handleRefresh}
          className="[COPY RETRY BUTTON STYLES]"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
)}
```

### 3. Loading State

**Structure:**
```typescript
{isLoading && (
  <div className="[COPY LOADING CONTAINER STYLES]">
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="[COPY SPINNER STYLES]"></div>
      <p className="[COPY LOADING TEXT STYLES]">Loading items...</p>
    </div>
  </div>
)}
```

### 4. Delete Confirmation Dialog

**Structure:**
```typescript
{showDeleteDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="[COPY DIALOG CONTAINER STYLES]">
      <h3 className="[COPY DIALOG TITLE STYLES]">Delete Items</h3>
      <p className="[COPY DIALOG TEXT STYLES]">
        You are about to delete <span className="[COPY EMPHASIS STYLES]">{selectedIds.size}</span> item(s).
        This action cannot be undone.
      </p>

      <div className="space-y-4 mb-6">
        {/* Max Concurrent input */}
        {/* Delay Between Ops input */}
        {/* Wait Mode radio buttons */}
      </div>

      <div className="flex gap-3">
        <button className="flex-1 [COPY SECONDARY BUTTON CLASS]">Cancel</button>
        <button className="flex-1 [COPY DANGER BUTTON CLASS]">
          {isDeleting ? 'Starting...' : 'Confirm Delete'}
        </button>
      </div>
    </div>
  </div>
)}
```

**Critical Pattern:** Dialog content uses `space-y-4 mb-6`, buttons use `flex gap-3` (no extra margin).

### 5. Table Structure

**Structure:**
```typescript
<div className="[COPY TABLE CONTAINER STYLES]">
  {/* Table Header with Actions */}
  <div className="[COPY TABLE HEADER STYLES]">
    <div className="flex justify-between items-center">
      <h3 className="[COPY TABLE TITLE STYLES]">
        All Items ({items.length})
      </h3>
      <div className="flex gap-3">
        <button className="[COPY SUCCESS BUTTON CLASS]">Create Items</button>
        <button className="[COPY DANGER BUTTON CLASS]">
          Delete Selected {selectedIds.size > 0 && `(${selectedIds.size})`}
        </button>
      </div>
    </div>
  </div>

  {/* Empty State or Table */}
  {items.length === 0 ? (
    <div className="[COPY EMPTY STATE STYLES]">
      <div className="[COPY EMPTY ICON STYLES]">📦</div>
      <h3 className="[COPY EMPTY TITLE STYLES]">No Items Found</h3>
      <p className="[COPY EMPTY TEXT STYLES]">Description</p>
    </div>
  ) : (
    <div className="[COPY TABLE SCROLL CONTAINER STYLES]">
      <table className="w-full">
        {/* thead and tbody */}
      </table>
    </div>
  )}
</div>
```

---

## Table Cell Pattern (CRITICAL)

### Rule: ALL table cells MUST wrap content in divs

**Reference:** See VenuesPage.tsx lines 387-404

```typescript
{/* ❌ WRONG */}
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
  {item.name}
</td>

{/* ✅ CORRECT */}
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm font-medium text-gray-900">
    {item.name}
  </div>
</td>
```

### Table Header Pattern

**Reference:** See VenuesPage.tsx lines 363-379

```typescript
<thead className="[COPY THEAD STYLES]">
  <tr>
    <th className="[COPY CHECKBOX COLUMN STYLES]">
      <input
        type="checkbox"
        checked={selectedIds.size === items.length && items.length > 0}
        onChange={handleSelectAll}
        className="[COPY CHECKBOX STYLES FROM VENUESPAGE]"
      />
    </th>
    <th className="[COPY HEADER CELL STYLES]">Column Name</th>
  </tr>
</thead>
```

**Critical:** Checkbox column must have `w-12` class.

### Table Body Pattern

**Reference:** See VenuesPage.tsx lines 382-406

```typescript
<tbody className="[COPY TBODY STYLES]">
  {items.map((item) => (
    <tr key={item.id} className="[COPY ROW STYLES]">
      <td className="[COPY CELL STYLES]">
        <input
          type="checkbox"
          checked={selectedIds.has(item.id)}
          onChange={() => handleSelectItem(item.id)}
          className="[COPY CHECKBOX STYLES]"
        />
      </td>
      <td className="[COPY CELL STYLES]">
        <div className="[COPY TEXT STYLES]">{item.name}</div>
      </td>
    </tr>
  ))}
</tbody>
```

---

## Handler Function Patterns

### Include Inline Comments

**Reference:** See VenuesPage.tsx lines 96-167

```typescript
const handleConfirmDelete = async () => {
  setIsDeleting(true);
  try {
    const response = await apiService.bulkDeleteItems(request);

    if (response.success && response.data) {
      if (deleteWaitMode === 'track') {
        // Switch to progress tracking view
        setDeleteSessionId(response.data.sessionId);
        setShowDeleteDialog(false);
      } else {
        // Fire and forget mode
        setShowDeleteDialog(false);
        setSelectedIds(new Set());
        // Refresh list after a short delay
        setTimeout(() => {
          handleRefresh();
        }, 1000);
      }
    } else {
      setError(response.error || 'Failed to start delete operation');
    }
  } catch (err: any) {
    setError(err.response?.data?.error || err.message || 'Failed to delete items');
  } finally {
    setIsDeleting(false);
  }
};

const handleProgressComplete = () => {
  // When progress tracking is complete, return to item list
  setDeleteSessionId(null);
  setSelectedIds(new Set());
  handleRefresh();
};
```

---

## Form Patterns

### Grid Layouts (Responsive Breakpoints)

**Reference:** See BulkVenueForm.tsx lines 103, BulkWlanForm.tsx lines 135

```typescript
// For 3 fields
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// For 4 fields
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// For 2 fields (Operation Options)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Pattern:** Always use `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-{N}`

### Form Section Structure

**Reference:** See BulkVenueForm.tsx lines 101-143

```typescript
<div className="[COPY FORM SECTION CONTAINER STYLES]">
  <h3 className="[COPY SECTION TITLE STYLES]">Section Title</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Form fields */}
  </div>

  {/* Optional preview box */}
  <div className="mt-4 p-3 bg-gray-50 rounded">
    <p className="text-sm text-gray-600">Preview: {/* ... */}</p>
  </div>
</div>
```

### Submit Button

**Reference:** See BulkVenueForm.tsx lines 225-231

```typescript
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full [COPY BUTTON CLASS] font-semibold"
>
  {isSubmitting ? 'Starting...' : `Create ${count} Items`}
</button>
```

---

## State Management Pattern

### useEffect Pattern (CRITICAL)

**Reference:** See VenuesPage.tsx lines 46-52

```typescript
// ❌ WRONG - Don't use useCallback or split effects
const fetchItems = useCallback(async () => { /* ... */ }, []);

useEffect(() => {
  fetchItems();
}, [fetchItems]);

useEffect(() => {
  const interval = setInterval(fetchItems, 30000);
  return () => clearInterval(interval);
}, [fetchItems]);

// ✅ CORRECT - Single effect, regular function
const fetchItems = async () => { /* ... */ };

useEffect(() => {
  fetchItems();

  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchItems, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## Button Text Conventions

**Reference:** Check current implementation in VenuesPage.tsx

### Pattern:
- **Delete button:** "Delete Selected (X)" where X is count
- **Submit button loading state:** "Starting..."
- **Submit button normal:** "Confirm Action" or "Create X Items"

---

## Styling Reference Points

When implementing, copy exact styles from:

1. **VenuesPage.tsx** - All page-level styling
2. **BulkVenueForm.tsx** - All form-level styling
3. **index.css** - Button classes (btn-primary, btn-secondary, etc.)
4. **Shadow/spacing utilities** - Use whatever is defined in current components

**Never hardcode styles** - always use existing utility classes and patterns.

---

## Checklist for New Pages

- [ ] State structure matches VenuesPage pattern
- [ ] useEffect uses single effect with auto-refresh (no useCallback)
- [ ] Sections in correct order (Header → Error → Loading → Dialog → Table → Logs)
- [ ] Delete dialog comes BEFORE table section
- [ ] Dialog spacing: content has `space-y-4 mb-6`, buttons have `flex gap-3`
- [ ] ALL table cells wrap content in divs
- [ ] Checkbox styling copied from VenuesPage
- [ ] Table header has sticky top and border-bottom
- [ ] Button classes copied from VenuesPage (btn-primary, btn-danger, etc.)
- [ ] Delete button says "Delete Selected (X)"
- [ ] Submit button shows "Starting..." when submitting
- [ ] Inline comments in all handler functions
- [ ] Grid layouts use responsive breakpoints (md:, lg:)
- [ ] Progress view has "Back to [Page]" button
- [ ] Conditional views checked in order: progress → form → main

---

## Quick Reference

**To implement a new page:**
1. Copy VenuesPage.tsx structure
2. Replace data types and API calls
3. Adjust grid layouts based on field count
4. Copy ALL styling from VenuesPage (don't modify)
5. Verify checklist above

**When visual design changes:**
- Update components only
- This documentation remains valid (structure unchanged)
