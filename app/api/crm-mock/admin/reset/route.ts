import { NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function POST() {
  try {
    console.log('🧹 Resetting CRM Mock data...');

    // Delete all CRM Mock data (in reverse order of dependencies)
    await prisma.crmAuditLog.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get pledges first to delete installments
    const existingPledges = await prisma.crmPledge.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingPledges.length > 0) {
      await prisma.crmPledgeInstallment.deleteMany({
        where: { pledgeId: { in: existingPledges.map((p: { id: string }) => p.id) } },
      });
    }
    
    await prisma.crmPledge.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmRecurringGiftSchedule.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get gifts first to delete allocations, soft credits, matching gifts, tributes, receipts, payments
    const existingGifts = await prisma.crmGift.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingGifts.length > 0) {
      await prisma.crmGiftAllocation.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmSoftCredit.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmMatchingGift.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmTribute.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmReceipt.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmPayment.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
    }
    
    await prisma.crmGift.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get opportunities first to delete stage history
    const existingOpportunities = await prisma.crmOpportunity.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingOpportunities.length > 0) {
      await prisma.crmOpportunityStageHistory.deleteMany({
        where: { opportunityId: { in: existingOpportunities.map((o: { id: string }) => o.id) } },
      });
    }
    
    await prisma.crmInteraction.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmOpportunity.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get households first to delete members
    const existingHouseholds = await prisma.crmHousehold.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingHouseholds.length > 0) {
      await prisma.crmHouseholdMember.deleteMany({
        where: { householdId: { in: existingHouseholds.map((h: { id: string }) => h.id) } },
      });
    }
    
    await prisma.crmHousehold.deleteMany({ where: CRM_MOCK_CTX });
    
    // Phase B: Delete preferences, consents, custom fields, segments
    await prisma.crmPreferences.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmConsent.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get custom field definitions first to delete values
    const existingCustomFields = await prisma.crmCustomFieldDefinition.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingCustomFields.length > 0) {
      await prisma.crmCustomFieldValue.deleteMany({
        where: { fieldDefinitionId: { in: existingCustomFields.map((f: { id: string }) => f.id) } },
      });
    }
    await prisma.crmCustomFieldDefinition.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get segments first to delete members
    const existingSegments = await prisma.crmSegment.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingSegments.length > 0) {
      await prisma.crmSegmentMember.deleteMany({
        where: { segmentId: { in: existingSegments.map((s: { id: string }) => s.id) } },
      });
    }
    await prisma.crmSegment.deleteMany({ where: CRM_MOCK_CTX });
    
    // Phase C: Delete move plans, addresses, emails, phones, tags, events, prospect profiles, ratings, assignments, relationships
    // Get move plans first to delete steps
    const existingMovePlans = await prisma.crmMovePlan.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingMovePlans.length > 0) {
      await prisma.crmMoveStep.deleteMany({
        where: { movePlanId: { in: existingMovePlans.map((mp: { id: string }) => mp.id) } },
      });
    }
    await prisma.crmMovePlan.deleteMany({ where: CRM_MOCK_CTX });
    
    await prisma.crmAddress.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmEmail.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmPhone.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get tags first to delete constituent tags
    const existingTags = await prisma.crmTag.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingTags.length > 0) {
      await prisma.crmConstituentTag.deleteMany({
        where: { tagId: { in: existingTags.map((t: { id: string }) => t.id) } },
      });
    }
    await prisma.crmTag.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get events first to delete participations
    const existingEvents = await prisma.crmEvent.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingEvents.length > 0) {
      await prisma.crmEventParticipation.deleteMany({
        where: { eventId: { in: existingEvents.map((e: { id: string }) => e.id) } },
      });
    }
    await prisma.crmEvent.deleteMany({ where: CRM_MOCK_CTX });
    
    await prisma.crmProspectProfile.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmRating.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmAssignment.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmRelationship.deleteMany({ where: CRM_MOCK_CTX });
    
    await prisma.crmDesignation.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmFund.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmAppeal.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmCampaign.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmOrganization.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmConstituent.deleteMany({ where: CRM_MOCK_CTX });

    console.log('✅ CRM Mock data reset successfully');

    return NextResponse.json({ 
      success: true,
      message: 'CRM Mock data reset successfully',
    });
  } catch (error) {
    console.error('Error resetting CRM Mock data:', error);
    return NextResponse.json(
      { error: 'Failed to reset data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

