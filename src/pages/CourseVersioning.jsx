import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GitBranch, Plus, Eye, Copy } from "lucide-react";

export default function CourseVersioning() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['creator-courses'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Course.filter({ created_by: user.email });
    }
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['course-versions', selectedCourse],
    queryFn: () => base44.entities.CourseVersion.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse
  });

  const createVersionMutation = useMutation({
    mutationFn: async (versionData) => {
      const course = courses.find(c => c.id === selectedCourse);
      return base44.entities.CourseVersion.create({
        ...versionData,
        course_data: course,
        created_by: (await base44.auth.me()).email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-versions'] });
      setShowCreateDialog(false);
    }
  });

  const handleCreateVersion = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createVersionMutation.mutate({
      course_id: selectedCourse,
      version_number: formData.get('version'),
      branch_name: formData.get('branch'),
      changes_summary: formData.get('changes'),
      target_teams: [],
      is_published: false
    });
  };

  const course = courses.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
            <GitBranch className="w-10 h-10" />
            Course Versioning & Branching
          </h1>
          <p className="text-gray-400">Manage team-specific content variations and version history</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {courses.map(course => (
            <Card
              key={course.id}
              className={`cursor-pointer transition-all ${
                selectedCourse === course.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'hover:border-cyan-500/50'
              }`}
              onClick={() => setSelectedCourse(course.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2">{course.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <GitBranch className="w-3 h-3" />
                  {versions.filter(v => v.course_id === course.id).length} versions
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCourse && (
          <Card className="card-glow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Version History: {course?.title}</CardTitle>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Version
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a0a2e] border-cyan-500/30">
                  <DialogHeader>
                    <DialogTitle>Create New Version</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateVersion} className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Version Number</label>
                      <Input name="version" placeholder="1.1" required className="bg-[#0f0618]" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Branch Name</label>
                      <Input name="branch" placeholder="team-sales" required className="bg-[#0f0618]" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Changes Summary</label>
                      <Input name="changes" placeholder="Added sales-specific examples" className="bg-[#0f0618]" />
                    </div>
                    <Button type="submit" className="btn-primary w-full">
                      Create Version
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {versions.map(version => (
                  <div key={version.id} className="p-4 bg-[#0f0618]/50 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-cyan-500/20 text-cyan-300">
                          v{version.version_number}
                        </Badge>
                        <span className="font-semibold text-white">{version.branch_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3 mr-1" />
                          Clone
                        </Button>
                      </div>
                    </div>
                    {version.changes_summary && (
                      <p className="text-sm text-gray-400 mb-2">{version.changes_summary}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created {new Date(version.created_date).toLocaleDateString()}</span>
                      {version.is_published && <Badge variant="outline">Published</Badge>}
                      {version.target_teams?.length > 0 && (
                        <span>{version.target_teams.length} teams</span>
                      )}
                    </div>
                  </div>
                ))}
                {versions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No versions yet. Create your first version to start tracking changes.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}