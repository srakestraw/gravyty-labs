import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const fieldDefinitionId = searchParams.get('fieldDefinitionId');

    const where: any = {};

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (fieldDefinitionId) {
      where.fieldDefinitionId = fieldDefinitionId;
    }

    const values = await prisma.crmCustomFieldValue.findMany({
      where,
      include: {
        fieldDefinition: true,
        constituent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(values);
  } catch (error) {
    console.error('Error fetching custom field values:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom field values' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fieldDefinitionId, constituentId, value } = body;

    if (!fieldDefinitionId || !constituentId || value === undefined) {
      return NextResponse.json(
        { error: 'fieldDefinitionId, constituentId, and value are required' },
        { status: 400 }
      );
    }

    const fieldValue = await prisma.crmCustomFieldValue.upsert({
      where: {
        fieldDefinitionId_constituentId: {
          fieldDefinitionId,
          constituentId,
        },
      },
      update: {
        value: JSON.parse(JSON.stringify(value)),
      },
      create: {
        fieldDefinitionId,
        constituentId,
        value: JSON.parse(JSON.stringify(value)),
      },
    });

    return NextResponse.json(fieldValue, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating custom field value:', error);
    return NextResponse.json(
      { error: 'Failed to create/update custom field value' },
      { status: 500 }
    );
  }
}



