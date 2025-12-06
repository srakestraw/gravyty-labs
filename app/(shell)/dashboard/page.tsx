'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { usePlatformStore } from '@/lib/store';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { canAccessAIAssistants } from '@/lib/roles';
import { useFeatureFlag } from '@/lib/features';

const apps = [
  {
    id: 'admissions',
    name: 'Admissions Management',
    shortName: 'Admissions',
    icon: 'fa-solid fa-clipboard-check',
    color: '#00B8D9',
    path: '/admissions',
    description: 'Manage applications, reviews, and admissions workflow'
  },
  {
    id: 'sis',
    name: 'Student Information System',
    shortName: 'SIS',
    icon: 'fa-solid fa-graduation-cap',
    color: '#7C3AED',
    path: '/sis',
    description: 'Student records, enrollment, and academic management'
  },
  {
    id: 'ai-teammates',
    name: 'AI Teammates',
    shortName: 'AI Teammates',
    icon: 'fa-solid fa-robot',
    color: '#059669',
    path: '/ai-teammates',
    description: 'AI-powered automation and intelligent assistance'
  },
  {
    id: 'ai-assistants',
    name: 'AI Assistants',
    shortName: 'AI Assistants',
    icon: 'fa-solid fa-user-robot',
    color: '#8B5CF6',
    path: '/ai-assistants',
    description: 'Configure and monitor AI-driven assistants across the student and alumni lifecycle.',
    requiresRole: true
  },
  {
    id: 'admin',
    name: 'Administration',
    shortName: 'Admin',
    icon: 'fa-solid fa-cog',
    color: '#DC2626',
    path: '/admin',
    description: 'System administration and user management'
  }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { setActiveApp } = usePlatformStore();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');

  const handleAppClick = (app: typeof apps[0]) => {
    setActiveApp(app);
  };

  // Filter apps based on feature flags and roles
  const visibleApps = apps.filter(app => {
    if (app.id === 'ai-assistants') {
      return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
    }
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">
          Choose an application to get started or view recent activity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FontAwesomeIcon icon="fa-solid fa-clipboard-check" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FontAwesomeIcon icon="fa-solid fa-graduation-cap" className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FontAwesomeIcon icon="fa-solid fa-robot" className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleApps.map((app) => (
            <Link
              key={app.id}
              href={app.path}
              onClick={() => handleAppClick(app)}
              className="group"
            >
              <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <FontAwesomeIcon 
                      icon={app.icon} 
                      className="h-6 w-6"
                      style={{ color: app.color }}
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {app.shortName}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {app.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors"
                >
                  Open App
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FontAwesomeIcon icon="fa-solid fa-clipboard-check" className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New application submitted</p>
              <p className="text-xs text-gray-500">John Doe - Computer Science • 2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AI task completed</p>
              <p className="text-xs text-gray-500">Email follow-up sent • 4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FontAwesomeIcon icon="fa-solid fa-graduation-cap" className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Student enrollment updated</p>
              <p className="text-xs text-gray-500">Jane Smith - Fall 2024 • 6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
