import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

interface FruitSpinnerRequestBody {
  telegramId: string;
  points: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

export async function POST(req: NextRequest) {
  try {
    const { telegramId, points }: FruitSpinnerRequestBody = await req.json();

    if (!telegramId || points === undefined || points < 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const result = await prisma.$transaction(async (prisma) => {
          const dbUser = await prisma.user.findUnique({
            where: { telegramId },
          });

          if (!dbUser) {
            throw new Error('User not found');
          }

          // Add points to user's balance
          const updatedUser = await prisma.user.update({
            where: {
              telegramId,
              lastPointsUpdateTimestamp: dbUser.lastPointsUpdateTimestamp, // Optimistic lock
            },
            data: {
              points: { increment: points },
              pointsBalance: { increment: points },
              lastPointsUpdateTimestamp: new Date(),
            },
          });

          return {
            success: true,
            message: 'Fruit spinner points added successfully',
            updatedPoints: updatedUser.points,
            updatedPointsBalance: updatedUser.pointsBalance,
            pointsAdded: points,
          };
        });

        return NextResponse.json(result);
      } catch (error) {
        if (error instanceof Error && error.message.includes('User not found')) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        if (retries >= MAX_RETRIES - 1) {
          console.error('Max retries reached for fruit spinner points:', error);
          return NextResponse.json(
            { error: 'Failed to add points after multiple attempts' },
            { status: 500 }
          );
        }

        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries)));
      }
    }
  } catch (error) {
    console.error('Error processing fruit spinner points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
