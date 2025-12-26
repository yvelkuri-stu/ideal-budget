'use client';

import { useEffect } from 'react';
import { getUserPreferences, type Theme, type AnimationSpeed } from '@/lib/actions/preferences';

export default function ThemeProvider({
    initialTheme,
    initialAnimation
}: {
    initialTheme: Theme;
    initialAnimation: AnimationSpeed;
}) {
    useEffect(() => {
        // Apply theme to HTML element
        document.documentElement.setAttribute('data-theme', initialTheme);
        document.documentElement.setAttribute('data-animation', initialAnimation);
    }, [initialTheme, initialAnimation]);

    return null;
}
