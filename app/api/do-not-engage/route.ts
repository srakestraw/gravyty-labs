import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization to avoid build-time errors
let prisma: any = null;
async function getPrisma() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null;
  }
  if (!prisma) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (e) {
      return null;
    }
  }
  return prisma;
}

export interface DoNotEngageEntry {
  id: string;
  personId: string;
  personLabel: string;
  reason?: string;
  source: string;
  scope: 'global' | 'agent';
  role?: string;
  agentId?: string;
  channels?: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  createdAt: string;
  createdBy?: string;
}

/**
 * GET /api/do-not-engage
 * Get all DNE entries (global + agent-specific)
 * Query params: role? (filter by role), scope? (filter by scope: global|agent)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const scope = searchParams.get('scope');

    const db = await getPrisma();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const entries: DoNotEngageEntry[] = [];

    // Fetch global DNE entries
    const globalEntries = await db.doNotEngageGlobal.findMany({
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

    for (const entry of globalEntries) {
      const personName = entry.person.names[0]
        ? `${entry.person.names[0].given} ${entry.person.names[0].family}`
        : `Person ${entry.personId}`;

      entries.push({
        id: entry.id,
        personId: entry.personId,
        personLabel: personName,
        reason: entry.reason || undefined,
        source: entry.source,
        scope: 'global',
        channels: {
          email: entry.emailBlocked,
          sms: entry.smsBlocked,
          phone: entry.phoneBlocked,
        },
        createdAt: entry.createdAt.toISOString(),
        createdBy: entry.updatedById || undefined,
      });
    }

    // Fetch agent-specific DNE entries
    const agentEntries = await db.doNotEngageAgent.findMany({
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

    for (const entry of agentEntries) {
      const personName = entry.person.names[0]
        ? `${entry.person.names[0].given} ${entry.person.names[0].family}`
        : `Person ${entry.personId}`;

      // Extract role from agentId if possible (e.g., "agent-transcript-helper" -> "admissions")
      // For now, we'll leave role as undefined and let the UI handle it
      const agentRole = extractRoleFromAgentId(entry.agentId);

      entries.push({
        id: entry.id,
        personId: entry.personId,
        personLabel: personName,
        source: 'admin',
        scope: 'agent',
        agentId: entry.agentId,
        role: agentRole,
        createdAt: entry.createdAt.toISOString(),
        createdBy: entry.createdById || undefined,
      });
    }

    // Apply filters
    let filtered = entries;
    if (scope && (scope === 'global' || scope === 'agent')) {
      filtered = filtered.filter(e => e.scope === scope);
    }
    if (role) {
      filtered = filtered.filter(e => e.role === role || (scope === 'global' && !e.role));
    }

    return NextResponse.json({ entries: filtered });
  } catch (error) {
    console.error('Error fetching DNE entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DNE entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/do-not-engage
 * Create a new DNE entry
 * Body: { personId, personLabel?, reason?, scope, role?, agentId?, source, channels? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, personLabel, reason, scope, role, agentId, source, channels } = body;

    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      );
    }

    if (!scope || !['global', 'agent'].includes(scope)) {
      return NextResponse.json(
        { error: 'scope must be "global" or "agent"' },
        { status: 400 }
      );
    }

    if (scope === 'agent' && !agentId) {
      return NextResponse.json(
        { error: 'agentId is required when scope is "agent"' },
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

    if (scope === 'global') {
      // Create or update global DNE entry
      const globalDne = await db.doNotEngageGlobal.upsert({
        where: { personId },
        create: {
          personId,
          emailBlocked: channels?.email ?? true,
          smsBlocked: channels?.sms ?? true,
          phoneBlocked: channels?.phone ?? true,
          source: source || 'admin',
          reason: reason || null,
        },
        update: {
          emailBlocked: channels?.email ?? true,
          smsBlocked: channels?.sms ?? true,
          phoneBlocked: channels?.phone ?? true,
          source: source || 'admin',
          reason: reason !== undefined ? reason : undefined,
        },
      });

      return NextResponse.json({
        id: globalDne.id,
        personId: globalDne.personId,
        personLabel: personLabel || `Person ${personId}`,
        reason: globalDne.reason || undefined,
        source: globalDne.source,
        scope: 'global',
        channels: {
          email: globalDne.emailBlocked,
          sms: globalDne.smsBlocked,
          phone: globalDne.phoneBlocked,
        },
        createdAt: globalDne.createdAt.toISOString(),
      });
    } else {
      // Create agent-specific DNE entry
      const agentDne = await db.doNotEngageAgent.create({
        data: {
          personId,
          agentId,
        },
      });

      return NextResponse.json({
        id: agentDne.id,
        personId: agentDne.personId,
        personLabel: personLabel || `Person ${personId}`,
        source: 'admin',
        scope: 'agent',
        agentId: agentDne.agentId,
        role: extractRoleFromAgentId(agentId),
        createdAt: agentDne.createdAt.toISOString(),
      });
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Entry already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating DNE entry:', error);
    return NextResponse.json(
      { error: 'Failed to create DNE entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/do-not-engage?id=xxx
 * Remove a DNE entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const scope = searchParams.get('scope'); // 'global' or 'agent'

    if (!id || !scope) {
      return NextResponse.json(
        { error: 'id and scope are required' },
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

    if (scope === 'global') {
      await db.doNotEngageGlobal.delete({
        where: { id },
      }).catch(() => {
        // Ignore if doesn't exist
      });
    } else {
      await db.doNotEngageAgent.delete({
        where: { id },
      }).catch(() => {
        // Ignore if doesn't exist
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting DNE entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete DNE entry' },
      { status: 500 }
    );
  }
}

/**
 * Helper to extract role from agentId
 * This is a simple heuristic - in production, you'd query the agent config
 */
function extractRoleFromAgentId(agentId: string): string | undefined {
  // Simple pattern matching - adjust based on your agent ID format
  if (agentId.includes('admissions') || agentId.includes('transcript')) return 'admissions';
  if (agentId.includes('registrar') || agentId.includes('registration')) return 'registrar';
  if (agentId.includes('success') || agentId.includes('student')) return 'student_success';
  if (agentId.includes('career')) return 'career_services';
  if (agentId.includes('alumni')) return 'alumni_engagement';
  if (agentId.includes('advancement') || agentId.includes('donor')) return 'advancement';
  return undefined;
}


