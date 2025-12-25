"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, MessageSquare, User } from 'lucide-react';
import { db } from '@/lib/db';
import { askCoach } from '@/app/actions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function CoachPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Ideal Budget Coach. Ask me anything about your spending, like "How much did I spend on groceries?" or "Show me spending trends".' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const question = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setLoading(true);

        try {
            // 1. Fetch Context (All bills for now, optimized for Flash context window)
            const allBills = await db.bills.toArray();
            const context = JSON.stringify(allBills.map(b => ({
                date: b.date,
                store: b.storeName,
                category: b.category,
                amount: b.amount,
                items: b.items
            })));

            // 2. Call Server Action
            const response = await askCoach(question, context);

            if (response.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${response.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I couldn't generate an answer." }]);
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', alignItems: 'center', paddingBottom: '1rem' }}>
                <Link href="/" style={{ marginRight: '1rem' }}>
                    <ArrowLeft />
                </Link>
                <h1 style={{ fontSize: '1.5rem' }}>Smart Coach</h1>
            </header>

            <div className="glass-panel" style={{
                flex: 1,
                marginBottom: '1rem',
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        gap: '0.5rem',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                    }}>
                        <div style={{
                            minWidth: '32px', height: '32px', borderRadius: '50%',
                            background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {msg.role === 'user' ? <User size={16} /> : <MessageSquare size={16} />}
                        </div>
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                            color: 'var(--color-text-main)',
                            lineHeight: '1.5'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', marginLeft: '3rem', color: 'var(--color-text-muted)' }}>
                        Thinking...
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    className="glass-panel"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    style={{ flex: 1, padding: '1rem', color: 'white', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-primary-glow)' }}
                />
                <button type="submit" disabled={loading} style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    width: '3.5rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
