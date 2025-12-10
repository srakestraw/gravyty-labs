'use client';

import * as React from 'react';
import { ToneRule } from '@/lib/communication/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ToneRulesSectionProps {
  rules: ToneRule[];
  onChange: (rules: ToneRule[]) => void;
  canEdit: boolean;
}

const OPENING_STRATEGIES = [
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'direct', label: 'Direct' },
  { value: 'supportive', label: 'Supportive' },
  { value: 'encouraging', label: 'Encouraging' },
] as const;

export function ToneRulesSection({ rules, onChange, canEdit }: ToneRulesSectionProps) {
  const [expandedRuleId, setExpandedRuleId] = React.useState<string | null>(null);

  function addRule() {
    const newRule: ToneRule = {
      id: `tone_rule_${Date.now()}`,
      label: 'New Tone Rule',
      trigger: [],
      enabled: true,
      rules: {
        openingStrategy: 'empathetic',
      },
    };
    onChange([...rules, newRule]);
    setExpandedRuleId(newRule.id);
  }

  function removeRule(ruleId: string) {
    onChange(rules.filter(r => r.id !== ruleId));
    if (expandedRuleId === ruleId) {
      setExpandedRuleId(null);
    }
  }

  function updateRule(ruleId: string, updates: Partial<ToneRule>) {
    onChange(rules.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  }

  function updateRuleRules(ruleId: string, updates: Partial<ToneRule['rules']>) {
    onChange(rules.map(r => 
      r.id === ruleId 
        ? { ...r, rules: { ...r.rules, ...updates } }
        : r
    ));
  }

  function addTrigger(ruleId: string, trigger: string) {
    if (!trigger.trim()) return;
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || rule.trigger.includes(trigger.trim())) return;
    updateRule(ruleId, {
      trigger: [...rule.trigger, trigger.trim()],
    });
  }

  function removeTrigger(ruleId: string, trigger: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      trigger: rule.trigger.filter(t => t !== trigger),
    });
  }

  function addRequiredPhrase(ruleId: string, phrase: string) {
    if (!phrase.trim()) return;
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const currentPhrases = rule.rules.requiredPhrases || [];
    if (currentPhrases.includes(phrase.trim())) return;
    updateRuleRules(ruleId, {
      requiredPhrases: [...currentPhrases, phrase.trim()],
    });
  }

  function removeRequiredPhrase(ruleId: string, phrase: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !rule.rules.requiredPhrases) return;
    updateRuleRules(ruleId, {
      requiredPhrases: rule.rules.requiredPhrases.filter(p => p !== phrase),
    });
  }

  function addForbiddenPhrase(ruleId: string, phrase: string) {
    if (!phrase.trim()) return;
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const currentPhrases = rule.rules.forbiddenPhrases || [];
    if (currentPhrases.includes(phrase.trim())) return;
    updateRuleRules(ruleId, {
      forbiddenPhrases: [...currentPhrases, phrase.trim()],
    });
  }

  function removeForbiddenPhrase(ruleId: string, phrase: string) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !rule.rules.forbiddenPhrases) return;
    updateRuleRules(ruleId, {
      forbiddenPhrases: rule.rules.forbiddenPhrases.filter(p => p !== phrase),
    });
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Tone Rules
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Adjust tone for specific scenarios—like bad news, deadlines, or escalation—without changing your overall brand voice.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={addRule}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
            Add rule
          </button>
        )}
      </div>

      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No tone rules configured. Click "Add rule" to create one.
          </div>
        ) : (
          rules.map((rule) => {
            const isExpanded = expandedRuleId === rule.id;
            return (
              <div
                key={rule.id}
                className={cn(
                  "rounded-lg border transition-colors",
                  isExpanded ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200 bg-white"
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled !== false}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateRule(rule.id, { enabled: e.target.checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!canEdit}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <span className={cn(
                        "text-sm font-medium",
                        rule.enabled === false ? "text-gray-400" : "text-gray-900"
                      )}>
                        {rule.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                        {rule.trigger.length} trigger{rule.trigger.length !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 capitalize">
                        {rule.rules.openingStrategy}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRule(rule.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4" />
                      </button>
                    )}
                    <FontAwesomeIcon
                      icon={isExpanded ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}
                      className="h-4 w-4 text-gray-400"
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-gray-200">
                    {/* Label */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-gray-700">
                        Label
                      </label>
                      {canEdit ? (
                        <Input
                          type="text"
                          value={rule.label}
                          onChange={(e) => updateRule(rule.id, { label: e.target.value })}
                          className="h-7 text-[11px]"
                        />
                      ) : (
                        <p className="text-[11px] text-gray-600">{rule.label}</p>
                      )}
                    </div>

                    {/* Triggers */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-gray-700">
                        Triggers
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {rule.trigger.map((trigger) => (
                          <span
                            key={trigger}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
                          >
                            {trigger}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => removeTrigger(rule.id, trigger)}
                                className="ml-1 text-gray-400 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Add trigger (keyword, intent, etc.)..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTrigger(rule.id, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                            className="h-7 text-[11px]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Opening Strategy */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-gray-700">
                        Opening Strategy
                      </label>
                      {canEdit ? (
                        <select
                          value={rule.rules.openingStrategy}
                          onChange={(e) => updateRuleRules(rule.id, {
                            openingStrategy: e.target.value as ToneRule['rules']['openingStrategy'],
                          })}
                          className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
                        >
                          {OPENING_STRATEGIES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[11px] text-gray-600 capitalize">
                          {rule.rules.openingStrategy}
                        </p>
                      )}
                    </div>

                    {/* Required Phrases */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-gray-700">
                        Required Phrases (optional)
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {(rule.rules.requiredPhrases || []).map((phrase) => (
                          <span
                            key={phrase}
                            className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-700 border border-green-200"
                          >
                            {phrase}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => removeRequiredPhrase(rule.id, phrase)}
                                className="ml-1 text-green-400 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Add required phrase..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addRequiredPhrase(rule.id, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                            className="h-7 text-[11px]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Forbidden Phrases */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-medium text-gray-700">
                        Forbidden Phrases (optional)
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {(rule.rules.forbiddenPhrases || []).map((phrase) => (
                          <span
                            key={phrase}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700 border border-red-200"
                          >
                            {phrase}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => removeForbiddenPhrase(rule.id, phrase)}
                                className="ml-1 text-red-400 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Add forbidden phrase..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addForbiddenPhrase(rule.id, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                            className="h-7 text-[11px]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Additional Options */}
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-gray-700">
                          Max Sentence Count (optional)
                        </label>
                        {canEdit ? (
                          <Input
                            type="number"
                            min="1"
                            value={rule.rules.maxSentenceCount || ''}
                            onChange={(e) => updateRuleRules(rule.id, {
                              maxSentenceCount: e.target.value ? parseInt(e.target.value) : undefined,
                            })}
                            placeholder="No limit"
                            className="h-7 text-[11px]"
                          />
                        ) : (
                          <p className="text-[11px] text-gray-600">
                            {rule.rules.maxSentenceCount || 'No limit'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-gray-200 pt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.rules.CTAAllowed !== false}
                          onChange={(e) => updateRuleRules(rule.id, { CTAAllowed: e.target.checked })}
                          disabled={!canEdit}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <span className="text-[11px] text-gray-700">Allow call-to-action in messages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.rules.emojiAllowedOverride === true}
                          onChange={(e) => updateRuleRules(rule.id, { emojiAllowedOverride: e.target.checked || undefined })}
                          disabled={!canEdit}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <span className="text-[11px] text-gray-700">Override emoji setting (allow emojis even if brand voice disallows)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

