'use client';

import { deleteBill } from '@/lib/actions/bills';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

export default function DeleteButton({ billId }: { billId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this bill?')) {
            startTransition(async () => {
                await deleteBill(billId);
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.5 : 1
            }}
        >
            <Trash2 size={16} />
        </button>
    );
}
