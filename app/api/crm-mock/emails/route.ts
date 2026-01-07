import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const isActive = searchParams.get('isActive');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const emails = await prisma.crmEmail.findMany({
      where,
      include: {
        constituent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        isPrimary: 'desc',
      },
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId,
      email,
      type,
      isPrimary,
      isActive,
    } = body;

    if (!constituentId || !email) {
      return NextResponse.json(
        { error: 'constituentId and email are required' },
        { status: 400 }
      );
    }

    const emailRecord = await prisma.crmEmail.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        email,
        type: type ?? 'personal',
        isPrimary: isPrimary ?? false,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(emailRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating email:', error);
    return NextResponse.json(
      { error: 'Failed to create email' },
      { status: 500 }
    );
  }
}



