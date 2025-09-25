import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Items() {
    const [items, setItems] = useState<any[]>([]);
    const [name, setName] = useState('');

    async function load(){
        const data = await api('/items');
        setItems(data);
    }

    async function add(){
        if (!name) return;
        await api('/items', {method: 'POST', body: JSON.stringify({ name })});
        setName('');
        await load();
    }

    async function toggle(id:number, done:boolean){
        await api(`/items/${id}`, { method: 'POST', body: JSON.stringify({ done }) });
        await load();
    }

    async function remove(id:number){
        await api(`/items/${id}`, { method: 'DELETE' });
        await load();
    }

    useEffect(() => { load(); },[]);

    return (
        <div data-automation-id="items">
            <h2>Items</h2>
            <input
                data-automation-id="item-input"
                value={name}
                onChange={(e => setName(e.target.value) )}
                placeholder="Add item"
            />
            <button data-automation-id="item-add" onClick={add}>Add</button>
            <div>
                {items.map(it => (
                    <div className="item" key={it.id} data-automation-id={'item-$(it.id'}>
                        <input
                            type="checkbox"
                            data-automation-id={'item-toggle-${it.id}'}
                            checked={!!it.done}
                            onChange={e=>toggle(it.id, e.target.checked)}
                        />
                        <span data-automation-id={`item-name-${it.id}`}>{it.name}</span>
                        <button
                            data-automation-id={'item-delete-${it.id}'}
                            onClick={()=>remove(it.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}