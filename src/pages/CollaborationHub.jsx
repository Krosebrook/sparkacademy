import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Video, Plus } from "lucide-react";
import CollaborativeEditor from "@/components/collaboration/CollaborativeEditor";
import LiveQA from "@/components/collaboration/LiveQA";

export default function CollaborationHub() {
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("project_workspace");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['my-documents'],
    queryFn: () => base44.entities.CollaborativeDocument.list('-created_date')
  });

  const { data: qaSessions = [] } = useQuery({
    queryKey: ['qa-sessions'],
    queryFn: () => base44.entities.LiveQASession.list('-scheduled_time')
  });

  const createDocMutation = useMutation({
    mutationFn: () => base44.entities.CollaborativeDocument.create({
      title: newDocTitle,
      document_type: newDocType,
      content: "",
      collaborators: []
    }),
    onSuccess: () => {
      setNewDocTitle("");
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
            <Users className="w-10 h-10" />
            Collaboration Hub
          </h1>
          <p className="text-gray-400">Work together on projects, share documents, and attend live Q&A sessions</p>
        </div>

        <Tabs defaultValue="documents">
          <TabsList className="bg-[#1a0a2e] border border-cyan-500/20">
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              Shared Documents
            </TabsTrigger>
            <TabsTrigger value="qa">
              <Video className="w-4 h-4 mr-2" />
              Live Q&A Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            {selectedDocId ? (
              <div>
                <Button onClick={() => setSelectedDocId(null)} variant="outline" className="mb-4">
                  ← Back to Documents
                </Button>
                <CollaborativeEditor documentId={selectedDocId} />
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle>Create New Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Document title"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        className="bg-[#1a0a2e] flex-1"
                      />
                      <Select value={newDocType} onValueChange={setNewDocType}>
                        <SelectTrigger className="bg-[#1a0a2e] w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lesson_draft">Lesson Draft</SelectItem>
                          <SelectItem value="project_workspace">Project Workspace</SelectItem>
                          <SelectItem value="study_notes">Study Notes</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => createDocMutation.mutate()}
                        disabled={!newDocTitle}
                        className="btn-primary"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="card-glow hover:border-cyan-400/50 cursor-pointer transition-all">
                      <CardContent className="p-4" onClick={() => setSelectedDocId(doc.id)}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-white">{doc.title}</h3>
                          <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 capitalize">{doc.document_type?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Users className="w-4 h-4" />
                            {doc.collaborators?.length || 0} collaborators
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qa">
            {selectedSessionId ? (
              <div>
                <Button onClick={() => setSelectedSessionId(null)} variant="outline" className="mb-4">
                  ← Back to Sessions
                </Button>
                <LiveQA sessionId={selectedSessionId} isInstructor={user?.role === 'admin'} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {qaSessions.map((session) => (
                  <Card key={session.id} className="card-glow hover:border-cyan-400/50 cursor-pointer transition-all">
                    <CardContent className="p-4" onClick={() => setSelectedSessionId(session.id)}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white">{session.title}</h3>
                        <Video className="w-5 h-5 text-red-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{session.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {new Date(session.scheduled_time).toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.status === 'live' ? 'bg-red-500/20 text-red-300' :
                          session.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}