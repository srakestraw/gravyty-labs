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
 * GET /api/dne/agent?agentId=xxx
 * Get all agent-specific DNE entries for an agent
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
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

    const agentDneList = await db.doNotEngageAgent.findMany({
      where: { agentId },
      include: {
        person: {
          include: {
            names: {
              where: { preferred: true },
              take: 1,
            },
          },
        },
      },
    });

    // Format response with person names
    const formatted = agentDneList.map((entry: any) => ({
      id: entry.id,
      personId: entry.personId,
      personName: entry.person.names[0]
        ? `${entry.person.names[0].given} ${entry.person.names[0].family}`
        : `Person ${entry.personId}`,
      agentId: entry.agentId,
      createdAt: entry.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching agent DNE:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent DNE settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dne/agent
 * Add a person to an agent's DNE list
 * Body: { personId, agentId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, agentId } = body;

    if (!personId || !agentId) {
      return NextResponse.json(
        { error: 'personId and agentId are required' },
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

    const agentDne = await db.doNotEngageAgent.create({
      data: {
        personId,
        agentId,
      },
    });

    return NextResponse.json(agentDne);
  } catch (error: any) {
    // Handle unique constraint violation (person already in list)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Person is already in this agent\'s do-not-engage list' },
        { status: 409 }
      );
    }

    console.error('Error adding agent DNE:', error);
    return NextResponse.json(
      { error: 'Failed to add agent DNE entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dne/agent?personId=xxx&agentId=xxx
 * Remove a person from an agent's DNE list
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const personId = searchParams.get('personId');
    const agentId = searchParams.get('agentId');

    if (!personId || !agentId) {
      return NextResponse.json(
        { error: 'personId and agentId are required' },
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

    await db.doNotEngageAgent.delete({
      where: {
        personId_agentId: {
          personId,
          agentId,
        },
      },
    }).catch(() => {
      // Ignore if doesn't exist
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent DNE:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent DNE entry' },
      { status: 500 }
    );
  }
}

