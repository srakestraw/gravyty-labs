'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Fund } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';

export default function FundsPage() {
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadFunds() {
      const data = await crmMockProvider.listFunds({});
      setFunds(data);
      setFilteredFunds(data);
      setLoading(false);
    }
    loadFunds();
  }, []);

  useEffect(() => {
    let filtered = funds;
    if (searchTerm) {
      filtered = filtered.filter(
        (fund) =>
          fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fund.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredFunds(filtered);
  }, [funds, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading funds...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Funds</h1>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search funds by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFunds.map((fund) => (
              <tr
                key={fund.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/crm-mock/admin/funds/${fund.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{fund.code || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{fund.name}</div>
                  {fund.description && <div className="text-sm text-gray-500">{fund.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">{fund.type || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fund.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {fund.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFunds.length === 0 && <div className="text-center py-12 text-gray-500">No funds found</div>}
      </div>
    </div>
  );
}



