"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export default function SpendingChart() {
    const bills = useLiveQuery(() => db.bills.toArray());

    const data = useMemo(() => {
        if (!bills) return [];

        // Group by Date (Last 7 days or just all dates)
        // For simplicity, let's show all items sorted by date
        const sorted = [...bills].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Group by day
        const grouped: Record<string, number> = {};
        sorted.forEach(bill => {
            grouped[bill.date] = (grouped[bill.date] || 0) + bill.amount;
        });

        return Object.entries(grouped).map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount
        })).slice(-7); // Last 7 active days

    }, [bills]);

    if (!data || data.length === 0) return null;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', height: '250px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Spending Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
