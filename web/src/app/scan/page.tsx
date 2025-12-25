"use client";

import ReceiptScanner from '@/components/scanner/ReceiptScanner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import content from '@/locales/en.json';

export default function ScanPage() {
    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/" style={{ marginRight: '1rem' }}>
                    <ArrowLeft />
                </Link>
                <h1 style={{ fontSize: '1.5rem' }}>{content.scanner.title}</h1>
            </header>

            <main>
                <ReceiptScanner />
            </main>
        </div>
    );
}
