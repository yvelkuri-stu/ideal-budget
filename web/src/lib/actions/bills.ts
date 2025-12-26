'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface BillData {
    amount: number;
    currency: string;
    date: string; // ISO string
    storeName: string;
    category: string;
    items: Array<{ name: string; price: number; quantity?: number }>;
    receiptImage?: string; // Base64 or Blob URL
    isPersonal?: boolean; // If true, don't assign to household
}

export async function getBills(limit?: number, filter?: 'all' | 'personal' | 'household') {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Get user's household (if any)
    const member = await prisma.householdMember.findFirst({
        where: { userId },
    });

    // Build where clause based on filter
    let whereClause: any;

    if (filter === 'personal') {
        // Only personal bills (not in household)
        whereClause = {
            userId,
            householdId: null
        };
    } else if (filter === 'household') {
        // Only household bills
        whereClause = member ? {
            householdId: member.householdId
        } : { userId: 'none' }; // No results if no household
    } else {
        // All bills (default)
        whereClause = {
            OR: [
                { userId }, // Personal bills
                ...(member ? [{ householdId: member.householdId }] : []), // Household bills
            ],
        };
    }

    const bills = await prisma.bill.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
    });

    return bills.map(bill => ({
        ...bill,
        items: JSON.parse(bill.items),
        receiptImage: bill.receiptImage ? Buffer.from(bill.receiptImage).toString('base64') : undefined,
    }));
}

export async function getBillById(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const bill = await prisma.bill.findFirst({
        where: { id, userId },
    });

    if (!bill) return null;

    return {
        ...bill,
        items: JSON.parse(bill.items),
        receiptImage: bill.receiptImage ? Buffer.from(bill.receiptImage).toString('base64') : undefined,
    };
}

export async function createBill(data: BillData) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Get user's household and display name
    const member = await prisma.householdMember.findFirst({
        where: { userId },
    });

    const bill = await prisma.bill.create({
        data: {
            ...data,
            date: new Date(data.date),
            items: JSON.stringify(data.items),
            receiptImage: data.receiptImage ? Buffer.from(data.receiptImage, 'base64') : null,
            userId,
            // Only assign to household if NOT personal and user has a household
            householdId: (!data.isPersonal && member?.householdId) || null,
            addedBy: userId,
            addedByName: member?.displayName || 'Unknown',
        },
    });

    revalidatePath('/');
    return bill;
}

export async function updateBill(id: number, data: Partial<BillData>) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const bill = await prisma.bill.updateMany({
        where: { id, userId },
        data: {
            ...data,
            date: data.date ? new Date(data.date) : undefined,
            items: data.items ? JSON.stringify(data.items) : undefined,
            receiptImage: data.receiptImage ? Buffer.from(data.receiptImage, 'base64') : undefined,
        },
    });

    revalidatePath('/');
    revalidatePath(`/edit/${id}`);
    return bill;
}

export async function deleteBill(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    await prisma.bill.deleteMany({
        where: { id, userId },
    });

    revalidatePath('/');
}
