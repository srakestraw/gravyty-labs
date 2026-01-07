'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchTemplateSummary, ProgramMatchTemplateApplyPlan, ProgramMatchTemplateApplyResult } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface TemplateGalleryProps {
  onClose: () => void;
}

export function TemplateGallery({ onClose }: TemplateGalleryProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProgramMatchTemplateSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramMatchTemplateSummary | null>(null);
  const [applyPlan, setApplyPlan] = useState<ProgramMatchTemplateApplyPlan | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ProgramMatchTemplateApplyResult | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };
        const data = await dataClient.listProgramMatchTemplates(ctx);
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handlePreview = async (template: ProgramMatchTemplateSummary) => {
    setSelectedTemplate(template);
    setApplyPlan(null);
    setApplyResult(null);
  };

  const handlePlanApply = async (template: ProgramMatchTemplateSummary) => {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      const plan = await dataClient.planApplyProgramMatchTemplate(ctx, { templateId: template.id });
      setApplyPlan(plan);
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Failed to plan apply:', error);
      alert('Failed to plan template application. Please try again.');
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate || !applyPlan) return;

    setIsApplying(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      const result = await dataClient.applyProgramMatchTemplate(ctx, { templateId: selectedTemplate.id });
      setApplyResult(result);
      // Refresh the hub after a short delay
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(query) || 
           t.description.toLowerCase().includes(query) ||
           t.tags.some(tag => tag.toLowerCase().includes(query));
  });

  if (applyResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Applied Successfully</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">Created:</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• {applyResult.created.traits} traits</li>
                <li>• {applyResult.created.skills} skills</li>
                <li>• {applyResult.created.outcomes} outcomes</li>
                <li>• {applyResult.created.programs} programs</li>
              </ul>
            </div>
            {Object.values(applyResult.skipped).some(v => v > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">Skipped (duplicates):</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {applyResult.skipped.traits > 0 && <li>• {applyResult.skipped.traits} traits</li>}
                  {applyResult.skipped.skills > 0 && <li>• {applyResult.skipped.skills} skills</li>}
                  {applyResult.skipped.outcomes > 0 && <li>• {applyResult.skipped.outcomes} outcomes</li>}
                  {applyResult.skipped.programs > 0 && <li>• {applyResult.skipped.programs} programs</li>}
                </ul>
              </div>
            )}
            {applyResult.warnings.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Warnings:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {applyResult.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-600">Refreshing the hub...</p>
          </div>
        </div>
      </div>
    );
  }

  if (applyPlan && selectedTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Apply Template: {selectedTemplate.name}</h3>
            <button onClick={() => { setApplyPlan(null); setSelectedTemplate(null); }} className="text-gray-400 hover:text-gray-600">
              <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Will Create:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {applyPlan.willCreate.traits} traits</li>
                <li>• {applyPlan.willCreate.skills} skills</li>
                <li>• {applyPlan.willCreate.outcomes} outcomes</li>
                <li>• {applyPlan.willCreate.programs} programs</li>
              </ul>
            </div>
            {Object.values(applyPlan.willSkip).some(v => v > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">Will Skip (duplicates):</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {applyPlan.willSkip.traits > 0 && <li>• {applyPlan.willSkip.traits} traits</li>}
                  {applyPlan.willSkip.skills > 0 && <li>• {applyPlan.willSkip.skills} skills</li>}
                  {applyPlan.willSkip.outcomes > 0 && <li>• {applyPlan.willSkip.outcomes} outcomes</li>}
                  {applyPlan.willSkip.programs > 0 && <li>• {applyPlan.willSkip.programs} programs</li>}
                </ul>
              </div>
            )}
            {applyPlan.warnings.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-900 mb-2">Warnings:</p>
                <ul className="text-sm text-orange-800 space-y-1">
                  {applyPlan.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setApplyPlan(null); setSelectedTemplate(null); }} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={isApplying} className="flex-1">
                {isApplying ? 'Applying...' : 'Apply Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
            <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-gray-600">
              <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Traits</p>
                <p className="text-lg font-semibold text-gray-900">{selectedTemplate.includes.traits}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Skills</p>
                <p className="text-lg font-semibold text-gray-900">{selectedTemplate.includes.skills}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Outcomes</p>
                <p className="text-lg font-semibold text-gray-900">{selectedTemplate.includes.outcomes}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Programs</p>
                <p className="text-lg font-semibold text-gray-900">{selectedTemplate.includes.programs}</p>
              </div>
            </div>
            {selectedTemplate.includes.quiz && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-4 w-4 mr-1" />
                  Includes starter quiz draft
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {selectedTemplate.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => handlePlanApply(selectedTemplate)} className="flex-1">
                Plan & Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Template Gallery</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>{template.includes.traits} traits</span>
                  <span>{template.includes.skills} skills</span>
                  <span>{template.includes.programs} programs</span>
                  {template.includes.quiz && (
                    <span className="text-blue-600">
                      <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePreview(template)} className="flex-1">
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => handlePlanApply(template)} className="flex-1">
                    Plan & Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}






