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
    const isActive = searchParams.get('isActive');
    const category = searchParams.get('category');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    if (category) {
      where.category = category;
    }

    const definitions = await prisma.crmCustomFieldDefinition.findMany({
      where,
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(definitions);
  } catch (error) {
    console.error('Error fetching custom field definitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom field definitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      label,
      type,
      category,
      options,
      isRequired,
      isActive,
    } = body;

    if (!name || !label || !type) {
      return NextResponse.json(
        { error: 'name, label, and type are required' },
        { status: 400 }
      );
    }

    const definition = await prisma.crmCustomFieldDefinition.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        name,
        label,
        type,
        category,
        options: options ? JSON.parse(JSON.stringify(options)) : null,
        isRequired: isRequired ?? false,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(definition, { status: 201 });
  } catch (error) {
    console.error('Error creating custom field definition:', error);
    return NextResponse.json(
      { error: 'Failed to create custom field definition' },
      { status: 500 }
    );
  }
}



