"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ShoppingBag, Utensils, Zap, ShoppingCart, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

const getIcon = (category: string) => {
    switch (category) {
        case 'Groceries': return <ShoppingCart size={20} />;
        case 'Restaurant': return <Utensils size={20} />;
        case 'Utilities': return <Zap size={20} />;
        default: return <ShoppingBag size={20} />;
    }
};

import { useState } from "react";

export default function RecentBills() {
    const [searchTerm, setSearchTerm] = useState('');

    const bills = useLiveQuery(async () => {
        let collection = db.bills.orderBy('date').reverse();
        const all = await collection.toArray();

        if (!searchTerm) return all.slice(0, 10);

        const lowerTerm = searchTerm.toLowerCase();
        return all.filter(b =>
            b.storeName.toLowerCase().includes(lowerTerm) ||
            b.category.toLowerCase().includes(lowerTerm) ||
            (b.sharedWith && b.sharedWith.some(s => s.toLowerCase().includes(lowerTerm)))
        );
    }, [searchTerm]);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this bill?')) {
            await db.bills.delete(id);
        }
    };

    if (!bills) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading activity...</div>;

    if (bills.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No recent activity. Start by scanning a receipt!
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
                type="text"
                placeholder="Search bills, tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="glass-panel"
                style={{ width: '100%', padding: '0.75rem', color: 'white', background: 'rgba(0,0,0,0.3)', marginBottom: '0.5rem' }}
            />

            {bills.map(bill => (
                <div key={bill.id} className="glass-panel" style={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--color-primary)'
                        }}>
                            {getIcon(bill.category)}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 600 }}>{bill.storeName}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{bill.date}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                            {bill.amount.toFixed(2)} {bill.currency}
                        </span>
                        <Link href={`/edit/${bill.id}`}>
                            <div style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}><Edit2 size={16} /></div>
                        </Link>
                        <button
                            onClick={() => bill.id && handleDelete(bill.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
