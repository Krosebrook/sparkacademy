import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Save, Eye, Edit, Clock } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function CollaborativeEditor({ documentId, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: document, isLoading } = useQuery({
    queryKey: ['collaborative-doc', documentId],
    queryFn: () => base44.entities.CollaborativeDocument.get(documentId),
    refetchInterval: 5000 // Poll every 5 seconds for updates
  });

  useEffect(() => {
    if (document) {
      setContent(document.content || "");
      setTitle(document.title || "");
    }
  }, [document]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CollaborativeDocument.update(documentId, {
        content,
        title,
        collaborators: [
          ...(document.collaborators || []).filter(c => c.email !== user.email),
          {
            email: user.email,
            role: "editor",
            last_edited: new Date().toISOString()
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-doc', documentId] });
      setEditMode(false);
    }
  });

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading document...</div>;
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            {editMode ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#1a0a2e] w-64"
              />
            ) : (
              document?.title
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {document?.collaborators?.length || 0} collaborators
            </Badge>
            {editMode ? (
              <Button onClick={() => saveMutation.mutate()} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            ) : (
              <Button onClick={() => setEditMode(true)} className="btn-secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Collaborators */}
        <div className="flex items-center gap-2 flex-wrap">
          {document?.collaborators?.map((collab, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-[#1a0a2e] rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{collab.email}</span>
              <Badge className="text-xs">{collab.role}</Badge>
              {collab.last_edited && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(collab.last_edited).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Content Editor */}
        {editMode ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-[#1a0a2e] font-mono h-96"
            placeholder="Start typing... (supports markdown)"
          />
        ) : (
          <div className="p-4 bg-[#0f0618]/50 rounded-lg prose prose-invert max-w-none">
            <ReactMarkdown>{content || "No content yet"}</ReactMarkdown>
          </div>
        )}

        {/* Version History */}
        {document?.version_history?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Changes</h4>
            <div className="space-y-1">
              {document.version_history.slice(-5).reverse().map((version, idx) => (
                <div key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                  <span>v{version.version}</span>
                  <span>•</span>
                  <span>{version.edited_by}</span>
                  <span>•</span>
                  <span>{new Date(version.edited_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}