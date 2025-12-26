import { getUserPreferences } from '@/lib/actions/preferences';
import { getUserHousehold } from '@/lib/actions/household';
import { auth } from '@clerk/nextjs/server';
import ThemeSelector from '@/components/ThemeSelector';
import HouseholdSettings from '@/components/HouseholdSettings';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function SettingsPage() {
    const prefs = await getUserPreferences();
    const household = await getUserHousehold();
    const { userId } = await auth();

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                <ArrowLeft size={20} />
                Back to Home
            </Link>

            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                Settings
            </h1>

            <ThemeSelector
                currentTheme={prefs.theme}
                currentAnimation={prefs.animationSpeed}
                currentCurrency={prefs.currency}
                currentLocale={prefs.locale}
            />

            <HouseholdSettings
                initialHousehold={household}
                currentUserId={userId || ''}
            />
        </div>
    );
}
