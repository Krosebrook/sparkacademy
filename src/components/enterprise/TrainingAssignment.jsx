import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, CheckCircle2, Clock, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrainingAssignment({ onClose, onAssign }) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filters = ['All', 'Coursera', 'Internal'];

  const courses = [
    {
      id: 1,
      type: 'INTERNAL COURSE',
      title: 'Advanced AWS Architecture',
      category: 'Cloud Computing',
      priority: 'High Priority Gap',
      duration: '12 Hours',
      enrolled: 45,
      selected: true
    },
    {
      id: 2,
      type: 'COURSERA INTEGRATION',
      title: 'Google Cloud Professional',
      category: 'Infrastructure',
      skillMap: 'DevOps',
      certified: true,
      rating: 4.9,
      selected: false
    }
  ];

  const smartSelect = {
    count: 12,
    gap: 'Critical Gap',
    area: 'Cloud Architecture'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-white">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <CardTitle className="text-xl font-bold">Assign Training</CardTitle>
              <Button variant="ghost" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
                Help
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center gap-2 justify-center mb-2">
                <div className={`h-1 w-16 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 w-16 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 w-16 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
              </div>
              <p className="text-xs text-gray-500 text-center uppercase tracking-wide font-semibold">
                Step 1: Content Selection
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <h2 className="text-2xl font-bold mb-4">Select Training Program</h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cloud Architecture"
                className="pl-10 bg-emerald-50 border-emerald-200 focus:border-emerald-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    selectedFilter === filter
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Course Cards */}
            <div className="space-y-4 mb-6">
              {courses.map(course => (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    course.selected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs font-bold ${
                          course.type.includes('INTERNAL')
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {course.type}
                        </Badge>
                        {course.priority && (
                          <Badge className="bg-red-100 text-red-700 text-xs font-bold">
                            {course.priority}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-bold mb-3">{course.title}</h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{course.category}</span>
                        </div>
                        {course.skillMap && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              Skill Map: {course.skillMap}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration}</span>
                          </div>
                        )}
                        {course.enrolled && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{course.enrolled} Enrolled</span>
                          </div>
                        )}
                        {course.certified && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              🏆 Certified Path
                            </Badge>
                          </div>
                        )}
                        {course.rating && (
                          <div className="flex items-center gap-1">
                            <span>⭐ {course.rating} Rating</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {course.selected && (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Smart Select Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900 mb-1">Smart Select Ready</h4>
                <p className="text-sm text-emerald-700">
                  We found <span className="font-bold">{smartSelect.count} users</span> with a "{smartSelect.gap}" in {smartSelect.area}.
                </p>
              </div>
            </motion.div>
          </CardContent>

          {/* Footer Actions */}
          <div className="border-t p-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-6 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setStep(2)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-base font-bold"
            >
              Next: Recipients →
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}