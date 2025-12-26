"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mic, Volume2, VolumeX } from 'lucide-react';
import { db } from '@/lib/db';
import { askCoach } from '@/app/actions';
import RichChatMessage from '@/components/chat/RichChatMessage';
import { useVoiceInput, useVoiceOutput } from '@/hooks/useVoice';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function CoachPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Ideal Budget Coach. Ask me anything about your spending, like:\n\n• "How much did I spend on groceries?"\n• "Show me spending trends"\n• "Will I stay within budget?"\n• "Where am I spending the most?"' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { isListening, isSupported: voiceInputSupported, startListening, stopListening } = useVoiceInput((transcript) => {
        setInput(transcript);
    });

    const { isSpeaking, isSupported: voiceOutputSupported, speak, stop: stopSpeaking } = useVoiceOutput();

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
            // Fetch Context (All bills for now)
            const allBills = await db.bills.toArray();
            const context = JSON.stringify(allBills.map(b => ({
                date: b.date,
                store: b.storeName,
                category: b.category,
                amount: b.amount,
                items: b.items
            })));

            // Call Server Action
            const response = await askCoach(question, context);

            if (response.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${response.error}` }]);
            } else {
                const assistantMessage = response.text || "I couldn't generate an answer.";
                setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

                // Auto-speak the response
                if (voiceOutputSupported) {
                    speak(assistantMessage);
                }
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', alignItems: 'center', paddingBottom: '1rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link href="/" style={{ marginRight: '1rem' }}>
                        <ArrowLeft />
                    </Link>
                    <h1 style={{ fontSize: '1.5rem' }}>Smart Coach</h1>
                </div>
                {voiceOutputSupported && (
                    <button
                        onClick={isSpeaking ? stopSpeaking : undefined}
                        style={{
                            padding: '0.5rem',
                            background: isSpeaking ? 'var(--color-accent)' : 'transparent',
                            color: isSpeaking ? 'white' : 'var(--color-text-muted)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: isSpeaking ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                )}
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
                    <RichChatMessage
                        key={i}
                        content={msg.content}
                        isUser={msg.role === 'user'}
                    />
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Analyzing your spending...
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
                    placeholder={isListening ? "Listening..." : "Ask a question..."}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        color: 'white',
                        background: isListening ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                        border: isListening ? '2px solid var(--color-primary)' : '1px solid var(--color-primary-glow)'
                    }}
                />
                {voiceInputSupported && (
                    <button
                        type="button"
                        onClick={handleVoiceInput}
                        style={{
                            background: isListening ? 'var(--color-accent)' : 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            width: '3.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: isListening ? 'pulse 1.5s infinite' : 'none'
                        }}
                    >
                        <Mic size={20} />
                    </button>
                )}
                <button type="submit" disabled={loading} style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    width: '3.5rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: loading ? 0.6 : 1
                }}>
                    <Send size={20} />
                </button>
            </form>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
