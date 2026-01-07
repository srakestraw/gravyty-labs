'use client';

import { useState } from 'react';
import { crmMockProvider } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';

export default function DataGeneratorPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lastAction, setLastAction] = useState<'reset' | 'seed' | null>(null);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    setActionSuccess(false);
    setErrorMessage(null);
    
    try {
      // Reset data via API
      await crmMockProvider.reset();
      
      setLastAction('reset');
      setActionSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(false);
        setLastAction(null);
      }, 3000);
    } catch (error) {
      console.error('Error resetting data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setActionSuccess(false);
    setErrorMessage(null);
    
    try {
      // Generate seed data (2 years) via API
      await crmMockProvider.seed();
      
      setLastAction('seed');
      setActionSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(false);
        setLastAction(null);
      }, 3000);
    } catch (error) {
      console.error('Error seeding data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to seed data');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Generator
        </h1>
        <p className="text-gray-600">
          Generate and manage mock CRM data for testing, demos, and AI training.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reset Dataset */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset Dataset
              </h3>
              <p className="text-sm text-gray-600">
                Clear all mock CRM data. This will remove all constituents, gifts, interactions, tasks, events, and other data.
              </p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-trash" className="h-6 w-6 text-red-600 flex-shrink-0" />
          </div>
          <Button
            onClick={handleReset}
            disabled={isResetting || isSeeding}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isResetting ? (
              <>
                <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4 mr-2" />
                Reset Dataset
              </>
            )}
          </Button>
        </div>

        {/* Generate Seed Data */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generate Seed Data
              </h3>
              <p className="text-sm text-gray-600">
                Generate 2 years of mock Advancement CRM data including constituents, gifts, interactions, tasks, events, and more.
              </p>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-database" className="h-6 w-6 text-blue-600 flex-shrink-0" />
          </div>
          <Button
            onClick={handleSeed}
            disabled={isResetting || isSeeding}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSeeding ? (
              <>
                <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="fa-solid fa-database" className="h-4 w-4 mr-2" />
                Generate Seed Data (2 Years)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {actionSuccess && lastAction && (
        <div className={`rounded-lg p-4 border ${
          lastAction === 'reset' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon 
              icon="fa-solid fa-check-circle" 
              className={`h-5 w-5 ${
                lastAction === 'reset' 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`} 
            />
            <p className={`text-sm font-medium ${
              lastAction === 'reset' 
                ? 'text-red-800' 
                : 'text-green-800'
            }`}>
              {lastAction === 'reset' 
                ? 'Dataset reset successfully. All data has been cleared.' 
                : 'Seed data generated successfully. 2 years of mock data is now available.'}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg p-4 border bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon 
              icon="fa-solid fa-exclamation-circle" 
              className="h-5 w-5 text-red-600" 
            />
            <p className="text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Info Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a mock CRM for demos and testing. All data is stored in the database and persists across page refreshes. The seed data includes approximately 300 constituents, 2,000 gifts, 1,500 interactions, 1,000 tasks, 25 events, and related data spanning 2 fiscal years.
        </p>
      </div>
    </div>
  );
}

