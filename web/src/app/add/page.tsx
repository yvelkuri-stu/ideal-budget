"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Users, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBill } from '@/lib/actions/bills';
import { getUserHousehold } from '@/lib/actions/household';

export default function AddBillPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hasHousehold, setHasHousehold] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Groceries',
        notes: '',
        isPersonal: false // false = household bill, true = personal bill
    });

    // Check if user has a household
    useEffect(() => {
        getUserHousehold().then(household => {
            setHasHousehold(!!household);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createBill({
                storeName: formData.storeName,
                amount: parseFloat(formData.amount),
                currency: 'USD',
                date: formData.date,
                category: formData.category,
                items: [],
                isPersonal: formData.isPersonal, // Pass personal flag
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

                {hasHousehold && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Bill Type</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPersonal: false })}
                                className="glass-panel"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: !formData.isPersonal ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    border: !formData.isPersonal ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Users size={20} />
                                Household
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPersonal: true })}
                                className="glass-panel"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: formData.isPersonal ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    border: formData.isPersonal ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <User size={20} />
                                Personal
                            </button>
                        </div>
                        <small style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                            {formData.isPersonal ? 'Only you will see this bill' : 'All household members will see this bill'}
                        </small>
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Notes (Optional)</label>
                    <textarea
                        className="glass-panel"
                        style={{ width: '100%', padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.2)', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="e.g. milk, mutton, asparagus"
                    />
                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Add details about what you bought</small>
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
