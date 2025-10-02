# UI Automation Test Scenarios

This document outlines all the UI automation test scenarios available in the QA Practice Site, specifically designed for Playwright/Cucumber/JavaScript interview questions and tricky implementations.

## Table of Contents

1. [Form Validations](#form-validations)
2. [Dynamic Elements & Loading States](#dynamic-elements--loading-states)
3. [Modal/Dialog Interactions](#modaldialog-interactions)
4. [Toast Notifications](#toast-notifications)
5. [Dropdown & Select Elements](#dropdown--select-elements)
6. [Table Interactions](#table-interactions)
7. [Search & Filtering](#search--filtering)
8. [Sorting](#sorting)
9. [Inline Editing](#inline-editing)
10. [Conditional Rendering](#conditional-rendering)
11. [Disabled/Enabled States](#disabledenabled-states)
12. [Network Delays](#network-delays)

---

## Form Validations

### Scenario 1: Required Field Validation
**Test Case**: Add item without name
- Navigate to Items page
- Leave `item-name-input` empty
- Click `item-add-btn`
- **Expected**: `validation-error` appears with message "Name is required"

### Scenario 2: Max Length Validation
**Test Case**: Add item with name > 100 characters
- Enter 101 characters in `item-name-input`
- Click `item-add-btn`
- **Expected**: `validation-error` appears with message "Name must be less than 100 characters"

### Scenario 3: Successful Form Submission
**Test Case**: Add valid item
- Enter name in `item-name-input`
- (Optional) Enter description in `item-description-input`
- Select category from `item-category-select`
- Select priority from `item-priority-select`
- Click `item-add-btn`
- **Expected**: Toast notification appears, form clears, item appears in table

---

## Dynamic Elements & Loading States

### Scenario 4: Loading Spinner
**Test Case**: Wait for loading state
- Perform any action that triggers API call
- **Expected**: `loading-spinner` appears
- Wait for spinner to disappear
- **Expected**: Content loads

### Scenario 5: Button State Change
**Test Case**: Button disabled during loading
- Click `item-add-btn`
- **Expected**: Button shows "Adding..." text and is disabled
- Wait for completion
- **Expected**: Button shows "Add Item" and is enabled

---

## Modal/Dialog Interactions

### Scenario 6: Modal Opens
**Test Case**: Delete confirmation modal
- Click `item-delete-{id}` button
- **Expected**: `modal-overlay` becomes visible
- **Expected**: `modal-dialog` contains delete confirmation

### Scenario 7: Modal Cancel
**Test Case**: Cancel delete operation
- Open delete modal
- Click `modal-cancel`
- **Expected**: Modal closes, item still exists

### Scenario 8: Modal Confirm
**Test Case**: Confirm delete operation
- Open delete modal
- Click `modal-confirm`
- **Expected**: Modal closes, item is deleted, toast appears

### Scenario 9: Modal Overlay Click
**Test Case**: Close modal by clicking overlay
- Open delete modal
- Click on `modal-overlay` (outside dialog)
- **Expected**: Modal closes

---

## Toast Notifications

### Scenario 10: Success Toast
**Test Case**: Item added successfully
- Add a valid item
- **Expected**: `toast-success` appears with message "Item added successfully"
- Wait 3 seconds
- **Expected**: Toast disappears automatically

### Scenario 11: Error Toast
**Test Case**: Validation error
- Try to add item without name
- **Expected**: `toast-error` appears

### Scenario 12: Info Toast
**Test Case**: Item status changed
- Toggle item checkbox
- **Expected**: `toast-info` appears with status message

### Scenario 13: Toast Manual Close
**Test Case**: Close toast before timeout
- Trigger any toast
- Click `toast-close` button
- **Expected**: Toast disappears immediately

---

## Dropdown & Select Elements

### Scenario 14: Select Category
**Test Case**: Select different categories
- Open `item-category-select`
- **Options**: personal, work, shopping, health, other
- Select each option
- **Expected**: Selected value updates

### Scenario 15: Select Priority
**Test Case**: Select different priorities
- Open `item-priority-select`
- **Options**: low, medium, high
- Select each option
- **Expected**: Selected value updates, button color may change

---

## Table Interactions

### Scenario 16: Table Renders with Data
**Test Case**: Items displayed in table
- Login and navigate to items
- **Expected**: `items-table` displays with headers
- **Expected**: Each item has `item-row-{id}`

### Scenario 17: Checkbox Toggle
**Test Case**: Mark item as done
- Find item with `item-checkbox-{id}`
- Click checkbox
- **Expected**: Checkbox becomes checked
- **Expected**: `item-name-{id}` gets line-through style
- **Expected**: Toast notification appears

### Scenario 18: Multiple Row Actions
**Test Case**: Perform actions on different rows
- Edit first item
- Delete second item
- Toggle third item
- **Expected**: Each action affects only the target row

---

## Search & Filtering

### Scenario 19: Search Items
**Test Case**: Search by name or description
- Enter text in `search-input`
- **Expected**: Table updates to show only matching items
- Clear search
- **Expected**: All items reappear

### Scenario 20: Filter by Category
**Test Case**: Filter items by category
- Select category from `filter-category`
- **Expected**: Only items with that category show
- Select "All Categories"
- **Expected**: All items reappear

### Scenario 21: Filter by Priority
**Test Case**: Filter items by priority
- Select priority from `filter-priority`
- **Expected**: Only items with that priority show

### Scenario 22: Combined Filters
**Test Case**: Apply multiple filters
- Enter search term
- Select category
- Select priority
- **Expected**: Items match ALL filter criteria

---

## Sorting

### Scenario 23: Sort by Name (A-Z)
**Test Case**: Sort alphabetically ascending
- Select "Name (A-Z)" from `sort-by`
- **Expected**: Items sorted alphabetically

### Scenario 24: Sort by Name (Z-A)
**Test Case**: Sort alphabetically descending
- Select "Name (Z-A)" from `sort-by`
- **Expected**: Items sorted reverse alphabetically

### Scenario 25: Sort by Priority
**Test Case**: Sort by priority level
- Select "Priority (High to Low)" from `sort-by`
- **Expected**: High priority items appear first

### Scenario 26: Sort by Date
**Test Case**: Sort by creation date
- Select "Newest First" or "Oldest First"
- **Expected**: Items sorted by created_at timestamp

---

## Inline Editing

### Scenario 27: Enter Edit Mode
**Test Case**: Start editing an item
- Click `item-edit-{id}`
- **Expected**: Name field becomes editable input `item-edit-name-{id}`
- **Expected**: Description field becomes editable input `item-edit-description-{id}`
- **Expected**: Edit and Delete buttons replaced with Save and Cancel

### Scenario 28: Save Edit
**Test Case**: Save edited item
- Enter edit mode
- Change name and/or description
- Click `item-save-{id}`
- **Expected**: Changes saved
- **Expected**: Exit edit mode
- **Expected**: Toast confirmation

### Scenario 29: Cancel Edit
**Test Case**: Cancel editing
- Enter edit mode
- Make changes
- Click `item-cancel-edit-{id}`
- **Expected**: Changes discarded
- **Expected**: Exit edit mode
- **Expected**: Original values restored

### Scenario 30: Edit Validation
**Test Case**: Try to save empty name
- Enter edit mode
- Clear the name field
- Click save
- **Expected**: Error toast appears
- **Expected**: Stays in edit mode

---

## Conditional Rendering

### Scenario 31: Empty State
**Test Case**: No items message
- Delete all items or filter to show none
- **Expected**: `no-items-message` appears
- **Expected**: Message: "No items found. Add one above!"

### Scenario 32: Items Count
**Test Case**: Dynamic count display
- **Expected**: `items-count` shows correct number
- Add item
- **Expected**: Count increases
- Delete item
- **Expected**: Count decreases

### Scenario 33: Edit Mode UI Changes
**Test Case**: Different UI in edit vs view mode
- Normal mode: Edit and Delete buttons visible
- Edit mode: Save and Cancel buttons visible, input fields active

---

## Disabled/Enabled States

### Scenario 34: Button Disabled During Loading
**Test Case**: Add button disabled state
- Click `item-add-btn`
- **Expected**: Button disabled with `cursor: not-allowed`
- **Expected**: Background color changes to gray

### Scenario 35: Modal Confirm Button
**Test Case**: Confirm button can be disabled
- (Currently always enabled, but structure supports `confirmDisabled` prop)
- Can be used for testing conditional button states

---

## Network Delays

### Scenario 36: Simulate Slow API Response
**Test Case**: Test with network delay
- Add `?delay=2000` to API request (server supports this)
- **Expected**: Loading spinner shows for 2 seconds
- **Expected**: Content loads after delay

**Implementation**: Backend supports delay query parameter:
```javascript
GET /api/items?delay=2000
```

---

## Common Interview Scenarios

### Scenario 37: Stale Element Reference
**Test Case**: Handle dynamic DOM updates
- Get reference to `item-row-{id}`
- Delete the item
- **Expected**: Row removed from DOM
- Attempt to interact with stale reference
- **Expected**: Proper error handling

### Scenario 38: Wait for Element to be Visible
**Test Case**: Wait strategies
- Trigger toast notification
- Wait for `toast-success` to be visible
- **Expected**: Toast appears within timeout

### Scenario 39: Wait for Element to be Removed
**Test Case**: Wait for disappearance
- Trigger toast
- Wait for toast to disappear
- **Expected**: Element no longer in DOM after 3 seconds

### Scenario 40: Multiple Elements with Same Class
**Test Case**: Select specific element from list
- Get all items with class `item-row-{id}`
- Select specific item by index or unique attribute
- Perform action on that specific item

---

## Data-Automation-ID Reference

### Add Item Form
- `add-item-form` - Form container
- `item-name-input` - Name input field
- `item-description-input` - Description textarea
- `item-category-select` - Category dropdown
- `category-option-{category}` - Category option
- `item-priority-select` - Priority dropdown
- `priority-option-{priority}` - Priority option
- `validation-error` - Validation error message
- `item-add-btn` - Add button

### Filter Controls
- `filter-controls` - Filter section container
- `search-input` - Search text input
- `filter-category` - Category filter dropdown
- `filter-priority` - Priority filter dropdown
- `sort-by` - Sort dropdown

### Items Table
- `items-table-container` - Table wrapper
- `items-count` - Item count display
- `no-items-message` - Empty state message
- `items-table` - Table element
- `item-row-{id}` - Table row for specific item
- `item-checkbox-{id}` - Done checkbox
- `item-name-{id}` - Item name text
- `item-description-{id}` - Item description text
- `item-category-{id}` - Category badge
- `item-priority-{id}` - Priority badge
- `item-edit-{id}` - Edit button
- `item-delete-{id}` - Delete button
- `item-edit-name-{id}` - Edit mode name input
- `item-edit-description-{id}` - Edit mode description input
- `item-save-{id}` - Save button (edit mode)
- `item-cancel-edit-{id}` - Cancel button (edit mode)

### Modal
- `modal-overlay` - Modal backdrop
- `modal-dialog` - Modal dialog box
- `modal-title` - Modal title
- `modal-message` - Modal message
- `modal-cancel` - Cancel button
- `modal-confirm` - Confirm button

### Toast
- `toast-{type}` - Toast container (success/error/info/warning)
- `toast-message` - Toast message text
- `toast-close` - Close button

### Loading
- `loading-spinner` - Loading indicator

---

## Example Playwright Tests

```javascript
// Example 1: Form Validation
test('should show validation error for empty name', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('item-add-btn').click();
  await expect(page.getByTestId('validation-error')).toBeVisible();
  await expect(page.getByTestId('validation-error')).toHaveText('Name is required');
});

// Example 2: Modal Interaction
test('should open and close delete modal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('item-delete-1').click();
  await expect(page.getByTestId('modal-overlay')).toBeVisible();
  await page.getByTestId('modal-cancel').click();
  await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
});

// Example 3: Toast Notification
test('should show success toast after adding item', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('item-name-input').fill('Test Item');
  await page.getByTestId('item-add-btn').click();
  await expect(page.getByTestId('toast-success')).toBeVisible();
  await expect(page.getByTestId('toast-message')).toHaveText('Item added successfully');
});

// Example 4: Table Filtering
test('should filter items by category', async ({ page }) => {
  await page.goto('/');
  const initialCount = await page.getByTestId(/item-row-/).count();
  await page.getByTestId('filter-category').selectOption('work');
  const filteredCount = await page.getByTestId(/item-row-/).count();
  expect(filteredCount).toBeLessThanOrEqual(initialCount);
});

// Example 5: Inline Editing
test('should edit item inline', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('item-edit-1').click();
  await page.getByTestId('item-edit-name-1').fill('Updated Name');
  await page.getByTestId('item-save-1').click();
  await expect(page.getByTestId('toast-success')).toBeVisible();
  await expect(page.getByTestId('item-name-1')).toHaveText('Updated Name');
});
```

---

## Common Tricky Interview Questions Covered

1. **Stale Element References**: Handled by dynamic row rendering
2. **Wait Strategies**: Loading spinners, toast timeouts, modal animations
3. **Dynamic Selectors**: Using `{id}` in data-automation-id attributes
4. **Shadow DOM**: Not present, but structure supports it
5. **Iframes**: Not present, but can be added if needed
6. **Multiple Windows/Tabs**: Can test logout/login flows
7. **File Upload**: Not present, but can be added if needed
8. **Drag and Drop**: Not present, but can be added if needed
9. **Hover States**: Button color changes, tooltips (can be enhanced)
10. **Network Interception**: Delay parameter simulates slow APIs
11. **Authentication**: JWT tokens, login/logout flows
12. **Local Storage**: Token management
13. **Table Interactions**: Sorting, filtering, pagination (can add pagination)
14. **Form Validations**: Client and server-side
15. **Error Handling**: Toast notifications, validation messages

---

## Tips for Interview Success

1. **Use explicit waits** instead of hard-coded sleeps
2. **Handle dynamic IDs** by using partial matching or data attributes
3. **Test both happy path and edge cases**
4. **Verify error states** not just success states
5. **Clean up test data** after tests
6. **Use Page Object Model** for maintainable tests
7. **Group related tests** using describe blocks
8. **Use proper assertions** (visible, enabled, text content, etc.)
9. **Handle asynchronous operations** properly
10. **Test responsive behavior** if needed
