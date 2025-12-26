export const CURRENCIES = {
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(
    amount: number,
    currency: CurrencyCode = 'USD',
    locale?: string
): string {
    const currencyInfo = CURRENCIES[currency];
    const formatLocale = locale || currencyInfo.locale;

    return new Intl.NumberFormat(formatLocale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

export function formatNumber(
    value: number,
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale).format(value);
}
