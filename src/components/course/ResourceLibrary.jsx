/**
 * Course Resource Library
 * Shared notes, study guides, and learning materials
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Share2, ThumbsUp, MessageSquare, Pin } from 'lucide-react';

export default function ResourceLibrary({ courseId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resource_type: 'note',
    tags: ''
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: resources, refetch } = useQuery({
    queryKey: ['sharedResources', courseId],
    queryFn: () => base44.entities.SharedResource?.filter({ 
      course_id: courseId 
    }, '-is_pinned', 50).catch(() => [])
  });

  const shareResource = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      await base44.entities.SharedResource?.create({
        course_id: courseId,
        shared_by_email: user.email,
        resource_type: formData.resource_type,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        likes: 0,
        comments_count: 0,
        is_pinned: false
      }).catch(() => {});

      setFormData({
        title: '',
        description: '',
        content: '',
        resource_type: 'note',
        tags: ''
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-green-400" />
          Shared Resources
        </h3>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="btn-secondary text-sm"
        >
          Share Resource
        </Button>
      </div>

      {/* Share Form */}
      {showForm && (
        <Card className="card-glow">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Resource title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#1a0a2e] border-[#2d1b4e]"
            />
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
              className="w-full bg-[#1a0a2e] border border-[#2d1b4e] rounded px-3 py-2 text-white text-sm"
            >
              <option value="note">Study Note</option>
              <option value="study_guide">Study Guide</option>
              <option value="summary">Summary</option>
              <option value="video_link">Video Link</option>
              <option value="article">Article</option>
            </select>
            <Textarea
              placeholder="Content or paste resource content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bg-[#1a0a2e] border-[#2d1b4e] text-white text-sm"
              rows={3}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-[#1a0a2e] border-[#2d1b4e]"
            />
            <div className="flex gap-2">
              <Button onClick={shareResource} className="btn-secondary flex-1 text-sm">
                Share
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 text-sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      <div className="space-y-3">
        {resources?.map((resource) => (
          <Card key={resource.id} className="card-glow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{resource.title}</h4>
                    {resource.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <p className="text-xs text-gray-400">
                    by {resource.shared_by_email}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-300 text-xs">
                  {resource.resource_type}
                </Badge>
              </div>

              <p className="text-sm text-gray-300 mb-2 line-clamp-2">{resource.content}</p>

              {resource.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {resource.tags.map((tag, i) => (
                    <Badge key={i} className="bg-blue-500/20 text-blue-300 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <button className="flex items-center gap-1 hover:text-green-400">
                  <ThumbsUp className="w-3 h-3" />
                  {resource.likes || 0}
                </button>
                <button className="flex items-center gap-1 hover:text-cyan-400">
                  <MessageSquare className="w-3 h-3" />
                  {resource.comments_count || 0}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}