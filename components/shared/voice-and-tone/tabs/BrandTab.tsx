'use client';

import * as React from 'react';
import { VoiceProfile } from '@/lib/communication/types';
import { Input } from '@/components/ui/input';

interface BrandTabProps {
  profile: VoiceProfile;
  onUpdate: (updater: (p: VoiceProfile) => VoiceProfile) => void;
}

export function BrandTab({ profile, onUpdate }: BrandTabProps) {
  function updateBrand<K extends keyof VoiceProfile['brand']>(
    key: K,
    value: VoiceProfile['brand'][K]
  ) {
    onUpdate(p => ({
      ...p,
      brand: {
        ...p.brand,
        [key]: value,
      },
    }));
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Brand Settings</h2>
        <p className="text-xs text-gray-600">
          Configure visual brand elements that can be used in templates and previews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-700">
            Logo URL
          </label>
          <Input
            type="url"
            value={profile.brand.logoUrl || ''}
            onChange={(e) => updateBrand('logoUrl', e.target.value || undefined)}
            placeholder="https://example.com/logo.png"
            className="text-sm"
          />
          <p className="text-[10px] text-gray-500">
            URL to your brand logo image
          </p>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <label className="block text-[11px] font-medium text-gray-700">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={profile.brand.primaryColor || '#3B82F6'}
              onChange={(e) => updateBrand('primaryColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
            />
            <Input
              type="text"
              value={profile.brand.primaryColor || ''}
              onChange={(e) => updateBrand('primaryColor', e.target.value || undefined)}
              placeholder="#3B82F6"
              className="flex-1 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-medium text-gray-700">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={profile.brand.secondaryColor || '#8B5CF6'}
              onChange={(e) => updateBrand('secondaryColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
            />
            <Input
              type="text"
              value={profile.brand.secondaryColor || ''}
              onChange={(e) => updateBrand('secondaryColor', e.target.value || undefined)}
              placeholder="#8B5CF6"
              className="flex-1 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-medium text-gray-700">
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={profile.brand.accentColor || '#10B981'}
              onChange={(e) => updateBrand('accentColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
            />
            <Input
              type="text"
              value={profile.brand.accentColor || ''}
              onChange={(e) => updateBrand('accentColor', e.target.value || undefined)}
              placeholder="#10B981"
              className="flex-1 text-sm"
            />
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-700">
            Typography Style
          </label>
          <select
            value={profile.brand.typographyStyle || 'system'}
            onChange={(e) => updateBrand('typographyStyle', e.target.value as VoiceProfile['brand']['typographyStyle'])}
            className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
          >
            <option value="system">System</option>
            <option value="serif">Serif</option>
            <option value="sans">Sans</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Signature Template */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <label className="block text-[11px] font-medium text-gray-700">
          Signature / Footer Template
        </label>
        <textarea
          value={profile.brand.signatureTemplate || ''}
          onChange={(e) => updateBrand('signatureTemplate', e.target.value || undefined)}
          placeholder="Optional signature or closing used in emails or long-form messages."
          rows={4}
          className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-[10px] text-gray-500">
          Optional signature or closing used in emails or long-form messages.
        </p>
      </div>
    </section>
  );
}

