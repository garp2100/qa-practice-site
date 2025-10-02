import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from './Modal';
import Toast from './Toast';

interface Item {
    id: number;
    name: string;
    description?: string;
    category: string;
    priority: string;
    done: boolean;
    created_at: string;
    updated_at: string;
}

interface ToastMessage {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export default function Items() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('personal');
    const [priority, setPriority] = useState('medium');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [sortBy, setSortBy] = useState('created_desc');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: number | null }>({
        isOpen: false,
        itemId: null
    });
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [validationError, setValidationError] = useState('');
    const [editingItem, setEditingItem] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const categories = ['personal', 'work', 'shopping', 'health', 'other'];
    const priorities = ['low', 'medium', 'high'];

    async function load() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (filterPriority) params.append('priority', filterPriority);
            if (searchTerm) params.append('search', searchTerm);
            if (sortBy) params.append('sort', sortBy);

            const queryString = params.toString();
            const data = await api<Item[]>(`/items${queryString ? `?${queryString}` : ''}`);
            setItems(data);
        } catch (error: any) {
            showToast('Failed to load items', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function add() {
        setValidationError('');

        if (!name || name.trim().length === 0) {
            setValidationError('Name is required');
            return;
        }

        if (name.length > 100) {
            setValidationError('Name must be less than 100 characters');
            return;
        }

        setLoading(true);
        try {
            await api('/items', {
                method: 'POST',
                body: JSON.stringify({ name, description, category, priority })
            });
            setName('');
            setDescription('');
            setCategory('personal');
            setPriority('medium');
            setValidationError('');
            showToast('Item added successfully', 'success');
            await load();
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to add item';
            setValidationError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    }

    async function toggle(id: number, done: boolean) {
        try {
            await api(`/items/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ done })
            });
            showToast(done ? 'Item marked as done' : 'Item marked as not done', 'info');
            await load();
        } catch (error) {
            showToast('Failed to update item', 'error');
        }
    }

    async function startEdit(item: Item) {
        setEditingItem(item.id);
        setEditName(item.name);
        setEditDescription(item.description || '');
    }

    async function saveEdit(id: number) {
        if (!editName || editName.trim().length === 0) {
            showToast('Name cannot be empty', 'error');
            return;
        }

        try {
            await api(`/items/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: editName, description: editDescription })
            });
            setEditingItem(null);
            showToast('Item updated successfully', 'success');
            await load();
        } catch (error) {
            showToast('Failed to update item', 'error');
        }
    }

    function cancelEdit() {
        setEditingItem(null);
        setEditName('');
        setEditDescription('');
    }

    function confirmDelete(id: number) {
        setDeleteModal({ isOpen: true, itemId: id });
    }

    async function handleDelete() {
        if (deleteModal.itemId === null) return;

        try {
            await api(`/items/${deleteModal.itemId}`, { method: 'DELETE' });
            setDeleteModal({ isOpen: false, itemId: null });
            showToast('Item deleted successfully', 'success');
            await load();
        } catch (error) {
            showToast('Failed to delete item', 'error');
        }
    }

    function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
        setToast({ message, type });
    }

    useEffect(() => {
        load();
    }, [filterCategory, filterPriority, searchTerm, sortBy]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#f44336';
            case 'medium': return '#ff9800';
            case 'low': return '#4caf50';
            default: return '#999';
        }
    };

    return (
        <div data-automation-id="items">
            <h2 style={{
                color: 'white',
                marginBottom: '20px',
                fontSize: '32px'
            }}>
                Items Management
            </h2>

            {/* Add Item Form */}
            <div data-automation-id="add-item-form" style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h3>Add New Item</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                        <label htmlFor="item-name-input">Name *</label>
                        <input
                            id="item-name-input"
                            data-automation-id="item-name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Item name"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="item-description-input">Description</label>
                        <textarea
                            id="item-description-input"
                            data-automation-id="item-description-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Item description (optional)"
                            rows={3}
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="item-category-select">Category</label>
                            <select
                                id="item-category-select"
                                data-automation-id="item-category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} data-automation-id={`category-option-${cat}`}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label htmlFor="item-priority-select">Priority</label>
                            <select
                                id="item-priority-select"
                                data-automation-id="item-priority-select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                {priorities.map(pri => (
                                    <option key={pri} value={pri} data-automation-id={`priority-option-${pri}`}>
                                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {validationError && (
                        <div
                            data-automation-id="validation-error"
                            style={{ color: '#f44336', padding: '8px', background: '#ffebee', borderRadius: '4px' }}
                        >
                            {validationError}
                        </div>
                    )}

                    <button
                        data-automation-id="item-add-btn"
                        onClick={add}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: loading ? '#ccc' : '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Item'}
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div data-automation-id="filter-controls" style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h3>Filters & Search</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                        <label htmlFor="search-input">Search</label>
                        <input
                            id="search-input"
                            data-automation-id="search-input"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search items..."
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="filter-category">Filter by Category</label>
                        <select
                            id="filter-category"
                            data-automation-id="filter-category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-priority">Filter by Priority</label>
                        <select
                            id="filter-priority"
                            data-automation-id="filter-priority"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">All Priorities</option>
                            {priorities.map(pri => (
                                <option key={pri} value={pri}>
                                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="sort-by">Sort By</label>
                        <select
                            id="sort-by"
                            data-automation-id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="created_desc">Newest First</option>
                            <option value="created_asc">Oldest First</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="priority">Priority (High to Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div data-automation-id="loading-spinner" style={{
                    textAlign: 'center',
                    padding: '20px',
                    fontSize: '18px',
                    color: '#2196f3'
                }}>
                    Loading...
                </div>
            )}

            {/* Items Table */}
            <div data-automation-id="items-table-container" style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Items ({items.length})</h3>
                    <span data-automation-id="items-count" style={{
                        background: '#e3f2fd',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: '#1976d2',
                        fontWeight: '600'
                    }}>
                        {items.length} item(s)
                    </span>
                </div>

                {items.length === 0 && !loading ? (
                    <div data-automation-id="no-items-message" style={{
                        padding: '60px 40px',
                        textAlign: 'center',
                        color: '#999',
                        background: '#f9f9f9',
                        borderRadius: '12px',
                        border: '2px dashed #ddd'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                        <div style={{ fontSize: '18px', fontWeight: '500' }}>No items found</div>
                        <div style={{ fontSize: '14px', marginTop: '8px' }}>Add your first item using the form above!</div>
                    </div>
                ) : (
                    <table data-automation-id="items-table" style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '12px', textAlign: 'left', width: '50px' }}>Done</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '12px', textAlign: 'left', width: '120px' }}>Category</th>
                                <th style={{ padding: '12px', textAlign: 'left', width: '100px' }}>Priority</th>
                                <th style={{ padding: '12px', textAlign: 'left', width: '180px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    data-automation-id={`item-row-${item.id}`}
                                    style={{ borderBottom: '1px solid #eee' }}
                                >
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="checkbox"
                                            data-automation-id={`item-checkbox-${item.id}`}
                                            checked={item.done}
                                            onChange={(e) => toggle(item.id, e.target.checked)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {editingItem === item.id ? (
                                            <input
                                                data-automation-id={`item-edit-name-${item.id}`}
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                style={{ width: '100%', padding: '4px' }}
                                            />
                                        ) : (
                                            <span
                                                data-automation-id={`item-name-${item.id}`}
                                                style={{ textDecoration: item.done ? 'line-through' : 'none' }}
                                            >
                                                {item.name}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {editingItem === item.id ? (
                                            <input
                                                data-automation-id={`item-edit-description-${item.id}`}
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                style={{ width: '100%', padding: '4px' }}
                                            />
                                        ) : (
                                            <span data-automation-id={`item-description-${item.id}`}>
                                                {item.description || '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span
                                            data-automation-id={`item-category-${item.id}`}
                                            style={{
                                                padding: '4px 8px',
                                                background: '#e3f2fd',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span
                                            data-automation-id={`item-priority-${item.id}`}
                                            style={{
                                                padding: '4px 8px',
                                                background: getPriorityColor(item.priority),
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {item.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {editingItem === item.id ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    data-automation-id={`item-save-${item.id}`}
                                                    onClick={() => saveEdit(item.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#4caf50',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    data-automation-id={`item-cancel-edit-${item.id}`}
                                                    onClick={cancelEdit}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#999',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    data-automation-id={`item-edit-${item.id}`}
                                                    onClick={() => startEdit(item)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#2196f3',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    data-automation-id={`item-delete-${item.id}`}
                                                    onClick={() => confirmDelete(item.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#f44336',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                title="Confirm Delete"
                message="Are you sure you want to delete this item? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, itemId: null })}
                confirmText="Delete"
                cancelText="Cancel"
            />

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
