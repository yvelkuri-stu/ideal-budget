'use client';

import { useState, useTransition } from 'react';
import { updateUserPreferences, type Theme, type AnimationSpeed } from '@/lib/actions/preferences';
import { Palette, Zap, DollarSign } from 'lucide-react';
import { CURRENCIES, type CurrencyCode } from '@/lib/formatCurrency';

const themes: { id: Theme; name: string; colors: string[] }[] = [
    { id: 'purple-glow', name: 'Purple Glow', colors: ['#8b5cf6', '#06b6d4'] },
    { id: 'ocean-blue', name: 'Ocean Blue', colors: ['#06b6d4', '#0ea5e9'] },
    { id: 'sunset-orange', name: 'Sunset Orange', colors: ['#f97316', '#fb923c'] },
    { id: 'forest-green', name: 'Forest Green', colors: ['#10b981', '#14b8a6'] },
    { id: 'minimal-dark', name: 'Minimal Dark', colors: ['#e5e7eb', '#9ca3af'] },
];

const animationSpeeds: { id: AnimationSpeed; name: string; icon: string }[] = [
    { id: 'slow', name: 'Slow', icon: '🐢' },
    { id: 'normal', name: 'Normal', icon: '🚶' },
    { id: 'fast', name: 'Fast', icon: '⚡' },
];

export default function ThemeSelector({
    currentTheme,
    currentAnimation,
    currentCurrency,
    currentLocale,
}: {
    currentTheme: Theme;
    currentAnimation: AnimationSpeed;
    currentCurrency: CurrencyCode;
    currentLocale: string;
}) {
    const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);
    const [selectedAnimation, setSelectedAnimation] = useState<AnimationSpeed>(currentAnimation);
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currentCurrency);
    const [isPending, startTransition] = useTransition();

    const handleThemeChange = (theme: Theme) => {
        setSelectedTheme(theme);
        startTransition(async () => {
            await updateUserPreferences({ theme });
            // Apply immediately for instant feedback
            document.documentElement.setAttribute('data-theme', theme);
        });
    };

    const handleAnimationChange = (speed: AnimationSpeed) => {
        setSelectedAnimation(speed);
        startTransition(async () => {
            await updateUserPreferences({ animationSpeed: speed });
            // Apply immediately
            document.documentElement.setAttribute('data-animation', speed);
        });
    };

    const handleCurrencyChange = (currency: CurrencyCode) => {
        setSelectedCurrency(currency);
        const locale = CURRENCIES[currency].locale;
        startTransition(async () => {
            await updateUserPreferences({ currency, locale });
        });
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Palette size={24} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Choose Your Theme</h2>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem'
                }}>
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            disabled={isPending}
                            className="glass-panel"
                            style={{
                                padding: '1rem',
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                border: selectedTheme === theme.id
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                opacity: isPending ? 0.6 : 1,
                                background: 'none',
                                color: 'inherit',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                height: '40px'
                            }}>
                                {theme.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            background: color,
                                            borderRadius: '4px',
                                            boxShadow: `0 0 10px ${color}50`,
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{theme.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Zap size={24} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Animation Speed</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {animationSpeeds.map((speed) => (
                        <button
                            key={speed.id}
                            onClick={() => handleAnimationChange(speed.id)}
                            disabled={isPending}
                            className="glass-panel"
                            style={{
                                flex: 1,
                                padding: '1rem',
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                border: selectedAnimation === speed.id
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                opacity: isPending ? 0.6 : 1,
                                background: 'none',
                                color: 'inherit',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <div style={{ fontSize: '2rem' }}>{speed.icon}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{speed.name}</div>
                        </button>
                    ))
                    }
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <DollarSign size={24} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Currency & Region</h2>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                }}>
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <button
                            key={code}
                            onClick={() => handleCurrencyChange(code)}
                            disabled={isPending}
                            className="glass-panel"
                            style={{
                                padding: '1rem',
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                border: selectedCurrency === code
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                opacity: isPending ? 0.6 : 1,
                                background: 'none',
                                color: 'inherit',
                                textAlign: 'left',
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                {CURRENCIES[code].symbol}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{code}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {CURRENCIES[code].name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
