import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization to avoid build-time errors
let prisma: any = null;
async function getPrisma() {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null;
  }
  if (!prisma) {
    try {
      // Dynamic import to prevent build-time execution
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (e) {
      // Silently fail during build
      return null;
    }
  }
  return prisma;
}

/**
 * GET /api/dne/global?personId=xxx
 * Get global DNE settings for a person
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      );
    }

    const db = await getPrisma();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const globalDne = await db.doNotEngageGlobal.findUnique({
      where: { personId },
    });

    return NextResponse.json(globalDne || null);
  } catch (error) {
    console.error('Error fetching global DNE:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global DNE settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dne/global
 * Create or update global DNE settings for a person
 * Body: { personId, emailBlocked?, smsBlocked?, phoneBlocked?, source?, reason? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, emailBlocked, smsBlocked, phoneBlocked, source, reason } = body;

    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      );
    }

    const db = await getPrisma();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // Upsert: create if doesn't exist, update if it does
    const globalDne = await db.doNotEngageGlobal.upsert({
      where: { personId },
      create: {
        personId,
        emailBlocked: emailBlocked ?? false,
        smsBlocked: smsBlocked ?? false,
        phoneBlocked: phoneBlocked ?? false,
        source: source || 'admin',
        reason: reason || null,
      },
      update: {
        emailBlocked: emailBlocked !== undefined ? emailBlocked : undefined,
        smsBlocked: smsBlocked !== undefined ? smsBlocked : undefined,
        phoneBlocked: phoneBlocked !== undefined ? phoneBlocked : undefined,
        source: source || undefined,
        reason: reason !== undefined ? reason : undefined,
      },
    });

    return NextResponse.json(globalDne);
  } catch (error) {
    console.error('Error updating global DNE:', error);
    return NextResponse.json(
      { error: 'Failed to update global DNE settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dne/global?personId=xxx
 * Remove global DNE settings for a person
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      );
    }

    const db = await getPrisma();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    await db.doNotEngageGlobal.delete({
      where: { personId },
    }).catch(() => {
      // Ignore if doesn't exist
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting global DNE:', error);
    return NextResponse.json(
      { error: 'Failed to delete global DNE settings' },
      { status: 500 }
    );
  }
}

