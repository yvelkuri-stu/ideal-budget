"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react';
import { db, type Bill } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function EditBillPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use() as per Next.js 15
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [billId, setBillId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        storeName: '',
        amount: '',
        date: '',
        category: 'Groceries',
        sharedWith: '' // Comma separated string for UI
    });

    useEffect(() => {
        if (id) {
            const bId = parseInt(id);
            setBillId(bId);
            db.bills.get(bId).then(bill => {
                if (bill) {
                    setFormData({
                        storeName: bill.storeName,
                        amount: bill.amount.toString(),
                        date: bill.date,
                        category: bill.category,
                        sharedWith: bill.sharedWith ? bill.sharedWith.join(', ') : ''
                    });
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!billId) return;

        setLoading(true);
        try {
            await db.bills.update(billId, {
                storeName: formData.storeName,
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
                sharedWith: formData.sharedWith.split(',').map(s => s.trim()).filter(s => s.length > 0)
            });

            router.push('/');
        } catch (err) {
            console.error(err);
            alert('Failed to update bill');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!billId) return;
        if (confirm('Delete this bill permanently?')) {
            await db.bills.delete(billId);
            router.push('/');
        }
    }

    if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link href="/" style={{ marginRight: '1rem' }}>
                        <ArrowLeft />
                    </Link>
                    <h1 style={{ fontSize: '1.5rem' }}>Edit Bill</h1>
                </div>
                <button onClick={handleDelete} style={{ background: 'transparent', border: 'none', color: 'var(--color-accent)', cursor: 'pointer' }}>
                    <Trash2 />
                </button>
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
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}>
                    Update Bill
                </button>

            </form>
        </div>
    );
}
