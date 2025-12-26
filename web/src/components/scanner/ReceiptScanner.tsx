"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeReceipt } from '@/app/actions';
import { db, type Bill } from '@/lib/db';
import content from '@/locales/en.json';
import { compressImage, validateFileSize } from '@/lib/imageCompression';

export default function ReceiptScanner() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<Bill | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        setUploadProgress('');

        try {
            // Validate file size (max 10MB before compression)
            if (!validateFileSize(file, 10)) {
                setError('File is too large. Maximum size is 10MB.');
                setIsAnalyzing(false);
                return;
            }

            let processedFile: File | Blob = file;

            // Compress if file is larger than 2MB
            if (file.size > 2 * 1024 * 1024) {
                setUploadProgress('Compressing image...');
                const compressed = await compressImage(file, 5, 1920);
                processedFile = new File([compressed], file.name, { type: 'image/jpeg' });
                setUploadProgress('');
            }

            setUploadProgress('Analyzing receipt...');
            const formData = new FormData();
            formData.append('file', processedFile);

            const data = await analyzeReceipt(formData);

            if (data.error) {
                setError(data.error);
            } else {
                // Save to DB immediately or let user review? 
                // For "Scan & Store" scenario, let's preview first.
                setResult({
                    ...data,
                    receiptImage: file, // Store the blob
                    createdAt: Date.now()
                });
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveBill = async () => {
        if (!result) return;
        try {
            await db.bills.add(result);
            // Reset after save
            setResult(null);
            alert(content.scanner.success);
            // Redirect to dashboard or list?
        } catch (e) {
            console.error(e);
            setError('Failed to save to database');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>

            {!result && !isAnalyzing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        background: 'var(--color-surface)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px dashed var(--color-primary)'
                    }} onClick={() => inputRef.current?.click()}>
                        <Camera size={40} color="var(--color-primary)" />
                    </div>

                    <p style={{ color: 'var(--color-text-muted)' }}>{content.scanner.instruction}</p>

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={inputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {isAnalyzing && (
                <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', minHeight: '200px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--color-secondary)" />
                    <p className="gradient-text" style={{ fontWeight: 500 }}>
                        {uploadProgress || content.scanner.analyzing}
                    </p>
                </div>
            )}

            {result && (
                <div style={{ textAlign: 'left' }}>
                    <div className="flex-center" style={{ marginBottom: '1rem' }}>
                        <CheckCircle size={48} color="var(--color-success)" />
                    </div>

                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{result.storeName}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--color-success)' }}>{result.amount} {result.currency}</span>
                    </div>

                    <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Items</p>
                        <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
                            {result.items.map((item, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>{item.name}</span>
                                    <span>{item.price}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button onClick={saveBill} style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        {content.scanner.save}
                    </button>
                    <button onClick={() => setResult(null)} style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        border: 'none',
                        marginTop: '0.5rem',
                        cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                </div>
            )}

            {error && (
                <div style={{ color: 'var(--color-accent)', marginTop: '1rem' }}>
                    <AlertCircle size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    {error}
                </div>
            )}
        </div>
    );
}
