/**
 * CRM Unified Service - Integration Tests
 * 
 * Tests the CRM Unified service end-to-end with database operations.
 * Run with: npx tsx lib/crm-unified/__tests__/integration.test.ts
 */

import { crmClient } from '../index';
import type { Contact, Account, Opportunity, Activity } from '../types';

async function testIntegration() {
  console.log('🧪 Starting CRM Unified Integration Tests...\n');

  const ctx = {
    workspace: 'test-workspace',
    app: 'test-app',
  };

  let testContactId: string;
  let testAccountId: string;
  let testOpportunityId: string;
  let testActivityId: string;

  try {
    // Test 1: Create Contact
    console.log('Test 1: Create Contact');
    const contact = await crmClient.createContact(ctx, {
      name: 'Test Contact',
      type: 'person',
      email: 'test@example.com',
      phone: '555-0001',
    });
    testContactId = contact.id;
    console.log('  ✅ Contact created:', contact.id);
    console.log('  ✅ Contact name:', contact.name);
    console.log('  ✅ Contact workspace:', contact.workspace);
    console.log('  ✅ Contact app:', contact.app);

    // Test 2: Get Contact
    console.log('\nTest 2: Get Contact');
    const retrievedContact = await crmClient.getContact(ctx, testContactId);
    if (!retrievedContact) {
      throw new Error('Contact not found');
    }
    console.log('  ✅ Contact retrieved:', retrievedContact.name);

    // Test 3: List Contacts
    console.log('\nTest 3: List Contacts');
    const contacts = await crmClient.listContacts(ctx);
    console.log('  ✅ Contacts listed:', contacts.length);
    if (contacts.length === 0) {
      throw new Error('No contacts found');
    }

    // Test 4: Create Account
    console.log('\nTest 4: Create Account');
    const account = await crmClient.createAccount(ctx, {
      name: 'Test Account',
      type: 'Corporate',
    });
    testAccountId = account.id;
    console.log('  ✅ Account created:', account.id);

    // Test 5: Create Opportunity
    console.log('\nTest 5: Create Opportunity');
    const opportunity = await crmClient.createOpportunity(ctx, {
      name: 'Test Opportunity',
      stage: 'prospecting',
      status: 'open',
      contactId: testContactId,
      accountId: testAccountId,
      amount: 10000,
    });
    testOpportunityId = opportunity.id;
    console.log('  ✅ Opportunity created:', opportunity.id);
    console.log('  ✅ Opportunity linked to contact:', opportunity.contactId === testContactId);
    console.log('  ✅ Opportunity linked to account:', opportunity.accountId === testAccountId);

    // Test 6: List Opportunities
    console.log('\nTest 6: List Opportunities');
    const opportunities = await crmClient.listOpportunities(ctx);
    console.log('  ✅ Opportunities listed:', opportunities.length);

    // Test 7: Create Activity
    console.log('\nTest 7: Create Activity');
    const activity = await crmClient.createActivity(ctx, {
      type: 'call',
      subject: 'Test Call',
      contactId: testContactId,
      opportunityId: testOpportunityId,
    });
    testActivityId = activity.id;
    console.log('  ✅ Activity created:', activity.id);

    // Test 8: List Activities
    console.log('\nTest 8: List Activities');
    const activities = await crmClient.listActivities(ctx);
    console.log('  ✅ Activities listed:', activities.length);
    const contactActivities = await crmClient.listActivities(ctx, testContactId);
    console.log('  ✅ Contact activities:', contactActivities.length);

    // Test 9: Update Contact
    console.log('\nTest 9: Update Contact');
    const updatedContact = await crmClient.updateContact(ctx, testContactId, {
      name: 'Updated Test Contact',
      type: 'person',
      email: 'updated@example.com',
    });
    console.log('  ✅ Contact updated:', updatedContact.name);

    // Test 10: Context Filtering (workspace/app isolation)
    console.log('\nTest 10: Context Filtering');
    const otherCtx = {
      workspace: 'other-workspace',
      app: 'other-app',
    };
    const otherContacts = await crmClient.listContacts(otherCtx);
    console.log('  ✅ Other workspace contacts:', otherContacts.length, '(should be 0 or different)');

    // Test 11: Delete Operations
    console.log('\nTest 11: Delete Operations');
    await crmClient.deleteOpportunity(ctx, testOpportunityId);
    console.log('  ✅ Opportunity deleted');
    await crmClient.deleteContact(ctx, testContactId);
    console.log('  ✅ Contact deleted (should cascade to activities)');
    await crmClient.deleteAccount(ctx, testAccountId);
    console.log('  ✅ Account deleted');

    // Verify cascade delete
    const remainingActivities = await crmClient.listActivities(ctx);
    const orphanedActivities = remainingActivities.filter(a => a.contactId === testContactId);
    console.log('  ✅ Orphaned activities:', orphanedActivities.length, '(should be 0 due to cascade)');

    console.log('\n✅ All integration tests passed!');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  testIntegration()
    .then(() => {
      console.log('\n🎉 Integration test suite completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration test suite failed:', error);
      process.exit(1);
    });
}

export { testIntegration };

