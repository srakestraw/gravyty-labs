'use client';

export const dynamic = 'force-static';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { mockEvalScores } from '../lib/data';

export default function EvalPage() {
  const router = useRouter();
  const [scores] = useState(mockEvalScores);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Evaluation & Logs</h2>
        <p className="text-gray-600 mt-1">
          Monitor assistant performance and safety metrics
        </p>
      </div>

      {/* Eval Summary Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Evaluation Scores</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assistant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correctness
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Safety
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fairness
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Evaluated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scores.map((score) => (
              <tr
                key={score.assistantId}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/ai-assistants/${score.assistantId}?tab=eval`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{score.assistantName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-semibold ${getScoreColor(score.correctness)}`}>
                    {(score.correctness * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-semibold ${getScoreColor(score.safety)}`}>
                    {(score.safety * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-semibold ${getScoreColor(score.fairness)}`}>
                    {(score.fairness * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(score.lastEvaluated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/ai-assistants/${score.assistantId}?tab=eval`);
                    }}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">About Evaluations</h4>
            <p className="text-sm text-blue-700">
              Evaluations are performed automatically on a regular basis. Scores measure the
              assistant's performance across correctness (accuracy of responses), safety (absence
              of harmful content), and fairness (equal treatment of all students).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

