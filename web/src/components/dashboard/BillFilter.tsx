'use client';

import { useState } from 'react';
import { Users, User, List } from 'lucide-react';

export type BillFilter = 'all' | 'personal' | 'household';

export default function BillFilter({
    currentFilter,
    onFilterChange,
    hasHousehold
}: {
    currentFilter: BillFilter;
    onFilterChange: (filter: BillFilter) => void;
    hasHousehold: boolean;
}) {
    if (!hasHousehold) return null; // Don't show filter if no household

    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                    onClick={() => onFilterChange('all')}
                    className="glass-panel"
                    style={{
                        padding: '0.5rem 1rem',
                        background: currentFilter === 'all' ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)',
                        color: 'white',
                        border: currentFilter === 'all' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <List size={16} />
                    All
                </button>
                <button
                    onClick={() => onFilterChange('household')}
                    className="glass-panel"
                    style={{
                        padding: '0.5rem 1rem',
                        background: currentFilter === 'household' ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)',
                        color: 'white',
                        border: currentFilter === 'household' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <Users size={16} />
                    Household
                </button>
                <button
                    onClick={() => onFilterChange('personal')}
                    className="glass-panel"
                    style={{
                        padding: '0.5rem 1rem',
                        background: currentFilter === 'personal' ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)',
                        color: 'white',
                        border: currentFilter === 'personal' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <User size={16} />
                    Personal
                </button>
            </div>
        </div>
    );
}
