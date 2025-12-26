'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function getChatHistory() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    return await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { timestamp: 'asc' },
    });
}

export async function saveChatMessage(role: 'user' | 'assistant', content: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    return await prisma.chatMessage.create({
        data: {
            role,
            content,
            userId,
        },
    });
}

export async function clearChatHistory() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    await prisma.chatMessage.deleteMany({
        where: { userId },
    });
}
