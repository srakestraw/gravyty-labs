'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProgramMatchReadinessPage() {
  const [selectedProgram, setSelectedProgram] = useState<string>('mba');

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Readiness Assessment
            </h1>
            <p className="text-gray-600">
              Configure readiness rubrics and prep guidance for each program
            </p>
          </div>
          <Button>
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
            Add Readiness Rubric
          </Button>
        </div>

        {/* Program Selector */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <Label>Select Program</Label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="mba">Master of Business Administration</option>
            <option value="ms_data_science">Master of Science in Data Science</option>
            <option value="ma_education">Master of Arts in Education</option>
          </select>
        </div>

        <Tabs defaultValue="rubric" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rubric">Rubric</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="prep-guidance">Prep Guidance</TabsTrigger>
          </TabsList>

          <TabsContent value="rubric" className="space-y-4">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Readiness Dimensions</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">Quantitative Readiness</div>
                      <div className="text-sm text-gray-600">Math and data analysis skills</div>
                    </div>
                    <div className="text-sm text-gray-500">Weight: 30%</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[0, 1, 2, 3].map((level) => (
                      <div key={level} className="flex items-center gap-2 text-sm">
                        <span className="w-8 text-gray-500">Level {level}:</span>
                        <Input
                          defaultValue={level === 0 ? 'No experience' : level === 1 ? 'Basic' : level === 2 ? 'Intermediate' : 'Advanced'}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
                  Add Dimension
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Band Thresholds</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ready (minimum score)</Label>
                  <Input type="number" defaultValue="2.0" className="mt-1" />
                </div>
                <div>
                  <Label>Nearly Ready (minimum score)</Label>
                  <Input type="number" defaultValue="1.5" className="mt-1" />
                </div>
                <div>
                  <Label>Explore Prep Path (below)</Label>
                  <Input type="number" defaultValue="0.0" className="mt-1" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Readiness Questions</h2>
              <p className="text-gray-600 text-sm mb-4">
                Configure 5-7 questions that map to readiness dimensions.
              </p>
              <div className="space-y-3">
                <div className="p-4 border rounded">
                  <div className="font-medium text-gray-900 mb-2">
                    How confident are you with quantitative analysis?
                  </div>
                  <div className="text-sm text-gray-600">
                    Type: Confidence Slider | Maps to: Quantitative Readiness
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prep-guidance" className="space-y-4">
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Prep Guidance Library</h2>
              <div className="space-y-3">
                <div className="p-4 border rounded">
                  <div className="font-medium text-gray-900 mb-2">Build Quantitative Skills</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Triggered by gaps in: Quantitative Readiness
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• Complete a statistics or quantitative methods course</li>
                    <li>• Practice with business case studies involving data analysis</li>
                    <li>• Consider a quantitative skills bootcamp</li>
                  </ul>
                </div>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
                  Add Prep Guidance
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
