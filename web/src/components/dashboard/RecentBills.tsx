import { getBills, deleteBill } from "@/lib/actions/bills";
import { ShoppingBag, Utensils, Zap, ShoppingCart, Edit2 } from "lucide-react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

const getIcon = (category: string) => {
    switch (category) {
        case 'Groceries': return <ShoppingCart size={20} />;
        case 'Restaurant': return <Utensils size={20} />;
        case 'Utilities': return <Zap size={20} />;
        default: return <ShoppingBag size={20} />;
    }
};

export default async function RecentBills({ filter }: { filter?: 'all' | 'personal' | 'household' }) {
    const bills = await getBills(10, filter);

    if (bills.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No recent activity. Start by scanning a receipt!
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bills.slice(0, 10).map(bill => (
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
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {new Date(bill.date).toLocaleDateString()}
                                {bill.addedByName && bill.addedByName !== 'Unknown' && (
                                    <span style={{ marginLeft: '0.5rem' }}>
                                        • {bill.addedByName}
                                    </span>
                                )}
                            </span>
                            {bill.notes && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    {bill.notes}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                            {bill.amount.toFixed(2)} {bill.currency}
                        </span>
                        <Link href={`/edit/${bill.id}`}>
                            <div style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}><Edit2 size={16} /></div>
                        </Link>
                        <DeleteButton billId={bill.id} />
                    </div>
                </div>
            ))}
        </div>
    );
}
