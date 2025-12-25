"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function AddBillPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Groceries',
        sharedWith: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await db.bills.add({
                storeName: formData.storeName,
                amount: parseFloat(formData.amount),
                currency: 'USD',
                date: formData.date,
                category: formData.category,
                items: [], // Manual entry usually doesn't include line items unless detailed
                sharedWith: formData.sharedWith.split(',').map(s => s.trim()).filter(s => s.length > 0),
                createdAt: Date.now()
            });

            router.push('/');
        } catch (err) {
            console.error(err);
            alert('Failed to save bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/" style={{ marginRight: '1rem' }}>
                    <ArrowLeft />
                </Link>
                <h1 style={{ fontSize: '1.5rem' }}>Add Bill</h1>
            </header>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Store Name</label>
                    <input
                        required
                        type="text"
                        className="glass-panel"
                        style={{ width: '100%', padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        value={formData.storeName}
                        onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="e.g. Costco"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Amount</label>
                    <input
                        required
                        type="number"
                        step="0.01"
                        className="glass-panel"
                        style={{ width: '100%', padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Date</label>
                    <input
                        required
                        type="date"
                        className="glass-panel"
                        style={{ width: '100%', padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Category</label>
                    <select
                        className="glass-panel"
                        style={{ width: '100%', padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Groceries">Groceries</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Others">Others</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Shared With (Friends/Spouse)</label>
                    <input
                        type="text"
                        className="glass-panel"
                        style={{ width: '100%', padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        value={formData.sharedWith}
                        onChange={e => setFormData({ ...formData, sharedWith: e.target.value })}
                        placeholder="e.g. Alice, Bob"
                    />
                </div>

                <button type="submit" disabled={loading} style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--color-success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                }}>
                    {loading ? 'Saving...' : 'Save Bill'}
                </button>

            </form>
        </div>
    );
}
