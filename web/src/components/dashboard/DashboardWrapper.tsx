'use client';

import { useState } from 'react';
import BillFilter, { type BillFilter as FilterType } from './BillFilter';
import { Users } from 'lucide-react';

export default function DashboardWrapper({
    children,
    hasHousehold,
    householdName
}: {
    children: React.ReactNode;
    hasHousehold: boolean;
    householdName?: string;
}) {
    const [filter, setFilter] = useState<FilterType>('all');

    return (
        <>
            {/* Household Status Banner */}
            {hasHousehold && householdName && (
                <div className="glass-panel" style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '1px solid var(--color-primary-glow)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <Users size={18} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.9rem' }}>
                        <strong>{householdName}</strong>
                    </span>
                </div>
            )}

            {/* Bill Filter */}
            <BillFilter
                currentFilter={filter}
                onFilterChange={setFilter}
                hasHousehold={hasHousehold}
            />

            {/* Pass filter to children via context or props */}
            <div data-bill-filter={filter}>
                {children}
            </div>
        </>
    );
}
