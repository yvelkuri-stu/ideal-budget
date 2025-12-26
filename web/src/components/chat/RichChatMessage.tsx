'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, CheckCircle } from 'lucide-react';

interface MessageData {
    type?: 'text' | 'spending_analysis' | 'budget_forecast' | 'category_insights' | 'trend_analysis';
    text: string;
    table?: {
        headers: string[];
        rows: string[][];
    };
    chart?: {
        type: 'bar' | 'pie';
        data: any[];
    };
    insights?: {
        type: 'tip' | 'warning' | 'success';
        text: string;
    }[];
    progress?: {
        label: string;
        current: number;
        total: number;
    };
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#f59e0b'];

export default function RichChatMessage({ content, isUser }: { content: string; isUser: boolean }) {
    if (isUser) {
        return (
            <div style={{
                alignSelf: 'flex-end',
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                background: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
            }}>
                {content}
            </div>
        );
    }

    // Try to parse as JSON for rich content
    let data: MessageData;
    try {
        data = JSON.parse(content);
    } catch {
        // Plain text response
        data = { type: 'text', text: content };
    }

    return (
        <div style={{
            alignSelf: 'flex-start',
            maxWidth: '85%',
            padding: '1rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Main text */}
            <div style={{ whiteSpace: 'pre-wrap' }}>{data.text}</div>

            {/* Table */}
            {data.table && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.9rem'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
                                {data.table.headers.map((header, i) => (
                                    <th key={i} style={{
                                        padding: '0.5rem',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        color: 'var(--color-primary)'
                                    }}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.table.rows.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {row.map((cell, j) => (
                                        <td key={j} style={{ padding: '0.5rem' }}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Chart */}
            {data.chart && (
                <div style={{ height: '200px', marginTop: '0.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {data.chart.type === 'bar' ? (
                            <BarChart data={data.chart.data}>
                                <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                                <YAxis stroke="var(--color-text-muted)" />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: 'none',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" fill="var(--color-primary)" />
                            </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={data.chart.data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.chart.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: 'none',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}

            {/* Progress bar */}
            {data.progress && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <span>{data.progress.label}</span>
                        <span style={{ fontWeight: 600 }}>
                            ${data.progress.current.toFixed(2)} / ${data.progress.total.toFixed(2)}
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min((data.progress.current / data.progress.total) * 100, 100)}%`,
                            height: '100%',
                            background: data.progress.current > data.progress.total
                                ? 'var(--color-accent)'
                                : 'var(--color-success)',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {/* Insights */}
            {data.insights && data.insights.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.insights.map((insight, i) => {
                        const Icon = insight.type === 'tip' ? Lightbulb :
                            insight.type === 'warning' ? AlertCircle : CheckCircle;
                        const color = insight.type === 'tip' ? '#06b6d4' :
                            insight.type === 'warning' ? '#f97316' : '#10b981';

                        return (
                            <div key={i} style={{
                                display: 'flex',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                background: `${color}20`,
                                borderLeft: `3px solid ${color}`,
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.9rem'
                            }}>
                                <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{insight.text}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
