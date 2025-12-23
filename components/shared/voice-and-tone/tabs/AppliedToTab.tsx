'use client';

import * as React from 'react';
import { VoiceProfile, AssignmentRule, AssignmentScope } from '@/lib/communication/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface AppliedToTabProps {
  profile: VoiceProfile;
  rules: AssignmentRule[];
  allRules: AssignmentRule[];
  allProfiles: VoiceProfile[];
  onNavigateToRule?: (ruleId: string) => void;
}

// Group rules by scope
function groupRulesByScope(rules: AssignmentRule[]) {
  const grouped: Record<AssignmentScope, AssignmentRule[]> = {
    user: [],
    group: [],
    agent: [],
    app: [],
  };

  rules.forEach(rule => {
    if (grouped[rule.scope]) {
      grouped[rule.scope].push(rule);
    }
  });

  // Sort each group by order
  Object.keys(grouped).forEach(scope => {
    grouped[scope as AssignmentScope].sort((a, b) => a.order - b.order);
  });

  return grouped;
}

export function AppliedToTab({
  profile,
  rules,
  allRules,
  allProfiles,
  onNavigateToRule,
}: AppliedToTabProps) {
  const groupedRules = React.useMemo(() => groupRulesByScope(rules), [rules]);

  const hasRules = rules.length > 0;
  const isDefault = profile.isDefault;

  // Check if this profile would be applied as default
  const wouldBeDefault = React.useMemo(() => {
    if (!isDefault) return false;
    // Check if there are any rules that would override this for common entities
    // This is a simplified check - full resolution would require entity lists
    return true;
  }, [isDefault, allRules]);

  function getScopeLabel(scope: AssignmentScope): string {
    switch (scope) {
      case 'user':
        return 'Users';
      case 'group':
        return 'Groups';
      case 'agent':
        return 'Agents';
      case 'app':
        return 'Apps';
    }
  }

  function getChannelLabel(channel: string): string {
    switch (channel) {
      case 'all':
        return 'All channels';
      case 'chat':
        return 'Chat';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      default:
        return channel;
    }
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Applied To</h2>
        <p className="text-xs text-gray-600">
          This tab lists all apps, agents, groups, and users where this profile is in effect,
          after applying Assignment Rules and default fallback.
        </p>
      </div>

      {/* Stage 1: Simple implementation based on rules */}
      {hasRules ? (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-[11px] text-blue-800 mb-2">
              <strong>Note:</strong> This view summarizes the assignment rules that reference this profile.
              {isDefault && (
                <span className="block mt-1">
                  This profile is also the default profile, so it applies to all entities where no specific rule matches.
                </span>
              )}
            </p>
            <p className="text-[10px] text-blue-700">
              {/* TODO: Stage 2 - When entity APIs are available, this will show a full resolved view
                  using resolveVoiceProfile for each entity to determine actual assignments. */}
            </p>
          </div>

          {/* Grouped rules display */}
          {Object.entries(groupedRules).map(([scope, scopeRules]) => {
            if (scopeRules.length === 0) return null;

            return (
              <div key={scope} className="space-y-2">
                <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  {getScopeLabel(scope as AssignmentScope)}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                        <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Rule</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scopeRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] text-gray-900">{rule.targetLabel}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] text-gray-600">{getChannelLabel(rule.channelScope)}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] text-gray-600">{rule.order}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            {onNavigateToRule ? (
                              <button
                                type="button"
                                onClick={() => onNavigateToRule(rule.id)}
                                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                View rule →
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-500">Rule #{rule.order}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDefault ? 'Default Profile' : 'No Assignment Rules'}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            {isDefault ? (
              <>
                This profile is the default profile. It applies to all apps, agents, groups, and users
                where no specific assignment rule matches.
              </>
            ) : (
              <>
                This profile has no assignment rules. It will only be used if explicitly selected
                or if it becomes the default profile.
              </>
            )}
          </p>
          {!isDefault && (
            <p className="text-[10px] text-gray-400 mt-2">
              Create assignment rules in the Assignment Rules tab to apply this profile to specific entities.
            </p>
          )}
        </div>
      )}

      {/* Assignment Priority Explanation */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-[11px] font-semibold text-gray-700 mb-2">How Assignment Priority Works</h3>
        <div className="space-y-2 text-[10px] text-gray-600">
          <p>
            Assignment rules are evaluated in order of specificity (most specific to least specific):
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li><strong>User</strong> - Rules that target a specific user</li>
            <li><strong>Group</strong> - Rules that target a group the user belongs to</li>
            <li><strong>Agent</strong> - Rules that target a specific AI agent</li>
            <li><strong>App</strong> - Rules that target an application</li>
            <li><strong>Default</strong> - The profile marked as default (if no rules match)</li>
          </ol>
          <p className="mt-2">
            When multiple rules match at the same specificity level, the rule with the highest priority
            (lowest order number, shown at the top) is applied.
          </p>
        </div>
      </div>
    </section>
  );
}







