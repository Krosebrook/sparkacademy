import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Layout, BarChart3, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

const availableMetrics = [
  { key: 'total_users', label: 'Total Users', type: 'metric' },
  { key: 'adoption_rate', label: 'Adoption Rate', type: 'metric' },
  { key: 'avg_learning_hours', label: 'Avg Learning Hours', type: 'metric' },
  { key: 'course_completions', label: 'Course Completions', type: 'chart' },
  { key: 'engagement_trend', label: 'Engagement Trend', type: 'chart' },
  { key: 'skill_gaps', label: 'Skill Gaps', type: 'table' },
  { key: 'department_performance', label: 'Department Performance', type: 'chart' }
];

export default function CustomDashboardBuilder({ onSave }) {
  const [dashboardName, setDashboardName] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const queryClient = useQueryClient();

  const saveDashboardMutation = useMutation({
    mutationFn: async (dashboardData) => {
      return base44.entities.UserDashboard.create(dashboardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-dashboards']);
      toast.success('Dashboard created successfully!');
      if (onSave) onSave();
    }
  });

  const addWidget = (metric) => {
    const widget = {
      id: Date.now().toString(),
      type: metric.type,
      title: metric.label,
      metric_key: metric.key,
      chart_type: metric.type === 'chart' ? 'line' : undefined,
      position: {
        x: 0,
        y: selectedWidgets.length * 2,
        width: 6,
        height: 2
      }
    };
    setSelectedWidgets([...selectedWidgets, widget]);
  };

  const removeWidget = (widgetId) => {
    setSelectedWidgets(selectedWidgets.filter(w => w.id !== widgetId));
  };

  const handleSave = async () => {
    if (!dashboardName.trim()) {
      toast.error('Please enter a dashboard name');
      return;
    }

    if (selectedWidgets.length === 0) {
      toast.error('Please add at least one widget');
      return;
    }

    await saveDashboardMutation.mutateAsync({
      name: dashboardName,
      widgets: selectedWidgets,
      is_default: false
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Create Custom Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dashboard Name</label>
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="e.g., Executive Overview"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Add Widgets</label>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <Button
                  key={metric.key}
                  variant="outline"
                  size="sm"
                  onClick={() => addWidget(metric)}
                  className="justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {metric.label}
                </Button>
              ))}
            </div>
          </div>

          {selectedWidgets.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Selected Widgets ({selectedWidgets.length})</label>
              <div className="space-y-2">
                {selectedWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      {widget.type === 'metric' && <BarChart3 className="w-4 h-4 text-blue-500" />}
                      {widget.type === 'chart' && <TrendingUp className="w-4 h-4 text-purple-500" />}
                      {widget.type === 'table' && <Users className="w-4 h-4 text-green-500" />}
                      <span className="text-sm font-medium">{widget.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saveDashboardMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveDashboardMutation.isPending ? 'Saving...' : 'Save Dashboard'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}