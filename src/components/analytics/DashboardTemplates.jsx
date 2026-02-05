import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, GraduationCap, TrendingUp, Copy } from 'lucide-react';
import { toast } from 'sonner';

const templateIcons = {
  hr_manager: Briefcase,
  ld_specialist: GraduationCap,
  executive: TrendingUp
};

export default function DashboardTemplates({ onSelectTemplate }) {
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['dashboard-templates'],
    queryFn: () => base44.entities.DashboardTemplate.list()
  });

  const createFromTemplate = useMutation({
    mutationFn: async (template) => {
      return base44.entities.UserDashboard.create({
        name: `${template.name} (Copy)`,
        template_id: template.id,
        widgets: template.widgets,
        is_default: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-dashboards']);
      toast.success('Dashboard created from template!');
      if (onSelectTemplate) onSelectTemplate();
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates?.map((template) => {
        const Icon = templateIcons[template.role_type] || TrendingUp;
        return (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="w-5 h-5 text-purple-600" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{template.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{template.widgets?.length || 0} widgets</Badge>
                {template.is_default && (
                  <Badge className="bg-purple-100 text-purple-700">Default</Badge>
                )}
              </div>
              <Button
                onClick={() => createFromTemplate.mutate(template)}
                disabled={createFromTemplate.isPending}
                className="w-full"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}