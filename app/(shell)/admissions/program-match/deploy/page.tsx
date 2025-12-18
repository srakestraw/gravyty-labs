'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Checkbox } from '@/components/ui/checkbox';

export default function ProgramMatchDeployPage() {
  const [institutionId, setInstitutionId] = useState('inst_123');
  const [quizId, setQuizId] = useState('quiz_grad_match_v1');
  const [quizVersion, setQuizVersion] = useState('v1');
  const [voiceToneProfileId, setVoiceToneProfileId] = useState('voice_tone_default');
  const [dataProviderUrl, setDataProviderUrl] = useState(
    typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
  );
  const [trackingUtm, setTrackingUtm] = useState(true);
  const [trackingReferrer, setTrackingReferrer] = useState(true);

  const embedCode = `<!-- Program Match Widget -->
<div id="gravyty-program-match"></div>

<script>
  window.GravytyProgramMatch = {
    institutionId: "${institutionId}",
    quizId: "${quizId}",
    quizVersion: "${quizVersion}",
    mode: "live",
    voiceToneProfileId: "${voiceToneProfileId}",
    dataProviderBaseUrl: "${dataProviderUrl}",
    tracking: { 
      utm: ${trackingUtm}, 
      referrer: ${trackingReferrer} 
    }
  };
</script>

<script async src="${dataProviderUrl}/program-match/widget.js"></script>`;

  const iframeCode = `<iframe
  src="${dataProviderUrl}/program-match/embed?institutionId=${institutionId}&quizId=${quizId}&quizVersion=${quizVersion}"
  width="100%"
  height="900"
  style="border:0;"
  title="Find Your Program">
</iframe>`;

  const [activeTab, setActiveTab] = useState<'js' | 'iframe'>('js');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deploy Program Match
          </h1>
          <p className="text-gray-600">
            Get embed code and deployment instructions for your website
          </p>
        </div>

        {/* Configuration */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionId">Institution ID</Label>
              <Input
                id="institutionId"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quizId">Quiz ID</Label>
              <Input
                id="quizId"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quizVersion">Quiz Version</Label>
              <Input
                id="quizVersion"
                value={quizVersion}
                onChange={(e) => setQuizVersion(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="voiceToneProfileId">Voice & Tone Profile ID</Label>
              <Input
                id="voiceToneProfileId"
                value={voiceToneProfileId}
                onChange={(e) => setVoiceToneProfileId(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dataProviderUrl">Data Provider Base URL</Label>
              <Input
                id="dataProviderUrl"
                value={dataProviderUrl}
                onChange={(e) => setDataProviderUrl(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trackingUtm"
                checked={trackingUtm}
                onCheckedChange={(checked) => setTrackingUtm(checked === true)}
              />
              <Label htmlFor="trackingUtm" className="cursor-pointer">
                Track UTM parameters
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trackingReferrer"
                checked={trackingReferrer}
                onCheckedChange={(checked) => setTrackingReferrer(checked === true)}
              />
              <Label htmlFor="trackingReferrer" className="cursor-pointer">
                Track referrer
              </Label>
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Embed Code</h2>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'js' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('js')}
              >
                JavaScript Widget
              </Button>
              <Button
                variant={activeTab === 'iframe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('iframe')}
              >
                iFrame Fallback
              </Button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-gray-50 border rounded p-4 overflow-x-auto text-sm">
              <code>{activeTab === 'js' ? embedCode : iframeCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(activeTab === 'js' ? embedCode : iframeCode)}
            >
              {copied ? (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-check" className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-copy" className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* CSP Checklist */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Content Security Policy (CSP) Checklist
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Script Source</div>
                <div className="text-sm text-gray-600">
                  Allow: <code className="bg-gray-100 px-1 rounded">script-src 'self' {dataProviderUrl}</code>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Connect Source</div>
                <div className="text-sm text-gray-600">
                  Allow: <code className="bg-gray-100 px-1 rounded">connect-src 'self' {dataProviderUrl}</code>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Frame Ancestors</div>
                <div className="text-sm text-gray-600">
                  If using iFrame: <code className="bg-gray-100 px-1 rounded">frame-ancestors 'self'</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Verification Checklist
          </h2>
          <div className="space-y-2">
            {[
              'Gate validates email and creates lead',
              'Progress saves after each answer',
              'Resume restores state correctly',
              'Results reasons match voice and tone',
              'Readiness completes and persists',
              'Events flow end-to-end',
              'Performance and accessibility checks pass',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Guidance */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance Guidance
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="h-4 w-4 text-yellow-500 mt-0.5" />
              <span><strong>Lazy Loading:</strong> The widget script loads asynchronously and won't block page rendering</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="h-4 w-4 text-yellow-500 mt-0.5" />
              <span><strong>Container Width:</strong> Recommended minimum width of 600px for optimal experience</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="h-4 w-4 text-yellow-500 mt-0.5" />
              <span><strong>Mobile:</strong> Widget is fully responsive and works on all device sizes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
