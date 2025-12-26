'use client';

import { useState, useTransition } from 'react';
import { Users, Plus, Copy, LogOut, Trash2, Check } from 'lucide-react';
import {
    createHousehold,
    joinHousehold,
    leaveHousehold,
    generateInviteCode,
    removeMember,
    updateMemberName,
    type Household
} from '@/lib/actions/household';

export default function HouseholdSettings({
    initialHousehold,
    currentUserId
}: {
    initialHousehold: Household | null;
    currentUserId: string;
}) {
    const [household, setHousehold] = useState<Household | null>(initialHousehold);
    const [isPending, startTransition] = useTransition();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCreateHousehold = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const displayName = formData.get('displayName') as string;

        startTransition(async () => {
            try {
                const newHousehold = await createHousehold(name, displayName);
                setHousehold(newHousehold as any);
                setShowCreateForm(false);
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const handleJoinHousehold = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const code = formData.get('code') as string;
        const displayName = formData.get('displayName') as string;

        startTransition(async () => {
            try {
                const joinedHousehold = await joinHousehold(code, displayName);
                window.location.reload(); // Refresh to get full household data
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const handleGenerateInvite = () => {
        if (!household) return;

        startTransition(async () => {
            try {
                const code = await generateInviteCode(household.id);
                setInviteCode(code);
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const handleCopyInvite = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = () => {
        if (!confirm('Are you sure you want to leave this household?')) return;

        startTransition(async () => {
            try {
                await leaveHousehold();
                setHousehold(null);
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const handleRemoveMember = (memberId: number, memberName: string) => {
        if (!confirm(`Remove ${memberName} from the household?`)) return;

        startTransition(async () => {
            try {
                await removeMember(memberId);
                window.location.reload();
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const isOwner = household?.ownerId === currentUserId;

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Users size={24} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Shared Household</h2>
            </div>

            {!household ? (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        Share your budget with family members. Everyone can add bills and see combined spending.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="glass-panel"
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '1rem',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Plus size={20} />
                            Create Household
                        </button>

                        <button
                            onClick={() => setShowJoinForm(!showJoinForm)}
                            className="glass-panel"
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '1rem',
                                background: 'none',
                                color: 'inherit',
                                border: '1px solid var(--color-primary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                            }}
                        >
                            Join Household
                        </button>
                    </div>

                    {showCreateForm && (
                        <form onSubmit={handleCreateHousehold} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                                    Household Name
                                </label>
                                <input
                                    name="name"
                                    required
                                    placeholder="e.g., Smith Family Budget"
                                    className="glass-panel"
                                    style={{ width: '100%', padding: '0.75rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                                    Your Display Name
                                </label>
                                <input
                                    name="displayName"
                                    required
                                    placeholder="e.g., John"
                                    className="glass-panel"
                                    style={{ width: '100%', padding: '0.75rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                style={{
                                    padding: '0.75rem',
                                    background: 'var(--color-success)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    opacity: isPending ? 0.6 : 1,
                                }}
                            >
                                {isPending ? 'Creating...' : 'Create'}
                            </button>
                        </form>
                    )}

                    {showJoinForm && (
                        <form onSubmit={handleJoinHousehold} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                                    Invite Code
                                </label>
                                <input
                                    name="code"
                                    required
                                    placeholder="Paste invite code here"
                                    className="glass-panel"
                                    style={{ width: '100%', padding: '0.75rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                                    Your Display Name
                                </label>
                                <input
                                    name="displayName"
                                    required
                                    placeholder="e.g., Sarah"
                                    className="glass-panel"
                                    style={{ width: '100%', padding: '0.75rem', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                style={{
                                    padding: '0.75rem',
                                    background: 'var(--color-success)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    opacity: isPending ? 0.6 : 1,
                                }}
                            >
                                {isPending ? 'Joining...' : 'Join'}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{household.name}</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            {household.members.length} member{household.members.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Members</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {household.members.map((member) => (
                                <div
                                    key={member.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 500 }}>
                                            {member.displayName}
                                            {member.role === 'owner' && (
                                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                                                    (Owner)
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {isOwner && member.userId !== currentUserId && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id, member.displayName)}
                                            disabled={isPending}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'var(--color-accent)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                opacity: isPending ? 0.6 : 1,
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isOwner && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                onClick={handleGenerateInvite}
                                disabled={isPending}
                                className="glass-panel"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    opacity: isPending ? 0.6 : 1,
                                }}
                            >
                                Generate Invite Code
                            </button>

                            {inviteCode && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                        Share this code with family members:
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <code style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                                            {inviteCode}
                                        </code>
                                        <button
                                            onClick={handleCopyInvite}
                                            style={{
                                                padding: '0.5rem',
                                                background: copied ? 'var(--color-success)' : 'var(--color-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleLeave}
                        disabled={isPending}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'transparent',
                            color: 'var(--color-accent)',
                            border: '1px solid var(--color-accent)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: isPending ? 0.6 : 1,
                        }}
                    >
                        <LogOut size={16} />
                        Leave Household
                    </button>
                </div>
            )}
        </div>
    );
}
