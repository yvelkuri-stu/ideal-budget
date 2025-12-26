'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface Household {
    id: number;
    name: string;
    ownerId: string;
    createdAt: Date;
    members: HouseholdMember[];
}

export interface HouseholdMember {
    id: number;
    userId: string;
    displayName: string;
    role: string;
    joinedAt: Date;
}

/**
 * Get user's current household (if any)
 */
export async function getUserHousehold(): Promise<Household | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const member = await prisma.householdMember.findFirst({
        where: { userId },
        include: {
            household: {
                include: {
                    members: true,
                },
            },
        },
    });

    if (!member) return null;

    return {
        id: member.household.id,
        name: member.household.name,
        ownerId: member.household.ownerId,
        createdAt: member.household.createdAt,
        members: member.household.members.map(m => ({
            id: m.id,
            userId: m.userId,
            displayName: m.displayName,
            role: m.role,
            joinedAt: m.joinedAt,
        })),
    };
}

/**
 * Create a new household
 */
export async function createHousehold(name: string, ownerDisplayName: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Check if user is already in a household
    const existing = await getUserHousehold();
    if (existing) {
        throw new Error('You are already in a household. Leave it first to create a new one.');
    }

    const household = await prisma.household.create({
        data: {
            name,
            ownerId: userId,
            members: {
                create: {
                    userId,
                    displayName: ownerDisplayName,
                    role: 'owner',
                },
            },
        },
        include: {
            members: true,
        },
    });

    revalidatePath('/');
    revalidatePath('/settings');

    return household;
}

/**
 * Generate an invitation code for a household
 */
export async function generateInviteCode(householdId: number): Promise<string> {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const household = await prisma.household.findUnique({
        where: { id: householdId },
    });

    if (!household) throw new Error('Household not found');
    if (household.ownerId !== userId) throw new Error('Only the owner can generate invite codes');

    // Simple invite code: base64 encoded household ID
    const code = Buffer.from(`household:${householdId}`).toString('base64');
    return code;
}

/**
 * Join a household using an invite code
 */
export async function joinHousehold(inviteCode: string, displayName: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Check if user is already in a household
    const existing = await getUserHousehold();
    if (existing) {
        throw new Error('You are already in a household. Leave it first to join another.');
    }

    // Decode invite code
    let householdId: number;
    try {
        const decoded = Buffer.from(inviteCode, 'base64').toString('utf-8');
        const match = decoded.match(/^household:(\d+)$/);
        if (!match) throw new Error('Invalid invite code');
        householdId = parseInt(match[1]);
    } catch (e) {
        throw new Error('Invalid invite code');
    }

    // Verify household exists
    const household = await prisma.household.findUnique({
        where: { id: householdId },
    });

    if (!household) throw new Error('Household not found');

    // Add member
    await prisma.householdMember.create({
        data: {
            householdId,
            userId,
            displayName,
            role: 'member',
        },
    });

    revalidatePath('/');
    revalidatePath('/settings');

    return household;
}

/**
 * Leave a household
 */
export async function leaveHousehold() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const member = await prisma.householdMember.findFirst({
        where: { userId },
        include: { household: true },
    });

    if (!member) throw new Error('You are not in a household');

    // If owner, check if there are other members
    if (member.household.ownerId === userId) {
        const memberCount = await prisma.householdMember.count({
            where: { householdId: member.householdId },
        });

        if (memberCount > 1) {
            throw new Error('Transfer ownership or remove all members before leaving');
        }

        // Delete the household if owner is the only member
        await prisma.household.delete({
            where: { id: member.householdId },
        });
    } else {
        // Just remove the member
        await prisma.householdMember.delete({
            where: { id: member.id },
        });
    }

    revalidatePath('/');
    revalidatePath('/settings');
}

/**
 * Remove a member from household (owner only)
 */
export async function removeMember(memberId: number) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const member = await prisma.householdMember.findUnique({
        where: { id: memberId },
        include: { household: true },
    });

    if (!member) throw new Error('Member not found');
    if (member.household.ownerId !== userId) throw new Error('Only the owner can remove members');
    if (member.userId === userId) throw new Error('Cannot remove yourself');

    await prisma.householdMember.delete({
        where: { id: memberId },
    });

    revalidatePath('/');
    revalidatePath('/settings');
}

/**
 * Update member display name
 */
export async function updateMemberName(displayName: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const member = await prisma.householdMember.findFirst({
        where: { userId },
    });

    if (!member) throw new Error('You are not in a household');

    await prisma.householdMember.update({
        where: { id: member.id },
        data: { displayName },
    });

    revalidatePath('/');
    revalidatePath('/settings');
}
