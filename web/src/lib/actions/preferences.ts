'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { CurrencyCode } from '@/lib/formatCurrency';

export type Theme = 'purple-glow' | 'ocean-blue' | 'sunset-orange' | 'forest-green' | 'minimal-dark';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface UserPreferences {
    theme: Theme;
    animationSpeed: AnimationSpeed;
    currency: CurrencyCode;
    locale: string;
}

export async function getUserPreferences(): Promise<UserPreferences> {
    const { userId } = await auth();
    if (!userId) {
        return { theme: 'purple-glow', animationSpeed: 'normal', currency: 'USD', locale: 'en-US' };
    }

    const prefs = await prisma.userPreferences.findUnique({
        where: { userId },
    });

    if (!prefs) {
        // Create default preferences
        const newPrefs = await prisma.userPreferences.create({
            data: {
                userId,
                theme: 'purple-glow',
                animationSpeed: 'normal',
            },
        });
        return {
            theme: newPrefs.theme as Theme,
            animationSpeed: newPrefs.animationSpeed as AnimationSpeed,
            currency: newPrefs.currency as CurrencyCode,
            locale: newPrefs.locale,
        };
    }

    return {
        theme: prefs.theme as Theme,
        animationSpeed: prefs.animationSpeed as AnimationSpeed,
        currency: prefs.currency as CurrencyCode,
        locale: prefs.locale,
    };
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    await prisma.userPreferences.upsert({
        where: { userId },
        update: preferences,
        create: {
            userId,
            theme: preferences.theme || 'purple-glow',
            animationSpeed: preferences.animationSpeed || 'normal',
            currency: preferences.currency || 'USD',
            locale: preferences.locale || 'en-US',
        },
    });

    revalidatePath('/');
    revalidatePath('/settings');
}
