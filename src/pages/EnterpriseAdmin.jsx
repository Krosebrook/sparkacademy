import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BookOpen, Shield, Plus, Settings } from "lucide-react";
import TeamManagement from "@/components/enterprise/TeamManagement";
import SSOConfiguration from "@/components/enterprise/SSOConfiguration";
import UserProvisioning from "@/components/enterprise/UserProvisioning";

export default function EnterpriseAdmin() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const createOrgMutation = useMutation({
    mutationFn: (orgData) => base44.entities.Organization.create(orgData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] })
  });

  const selectedOrgData = organizations.find(org => org.id === selectedOrg);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Building2 className="w-10 h-10" />
              Enterprise Administration
            </h1>
            <p className="text-gray-400">Manage organizations, teams, and enterprise features</p>
          </div>
          <Button onClick={() => {
            const name = prompt("Organization name:");
            if (name) {
              createOrgMutation.mutate({
                name,
                admin_emails: [user.email],
                sso_enabled: false,
                is_active: true
              });
            }
          }} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Organization
          </Button>
        </div>

        {/* Organization Selector */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Your Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {organizations.map(org => (
                <Card
                  key={org.id}
                  className={`cursor-pointer transition-all ${
                    selectedOrg === org.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'hover:border-cyan-500/50'
                  }`}
                  onClick={() => setSelectedOrg(org.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{org.name}</h3>
                        <p className="text-xs text-gray-400">{org.domain || 'No domain'}</p>
                      </div>
                      {org.sso_enabled && (
                        <Badge className="bg-green-500/20 text-green-300">
                          <Shield className="w-3 h-3 mr-1" />
                          SSO
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      <span>{org.admin_emails?.length || 0} admins</span>
                      <Badge variant="outline">{org.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOrgData && (
          <Tabs defaultValue="teams" className="space-y-6">
            <TabsList className="bg-[#1a0a2e] border border-cyan-500/20">
              <TabsTrigger value="teams">
                <Users className="w-4 h-4 mr-2" />
                Teams & Cohorts
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                User Provisioning
              </TabsTrigger>
              <TabsTrigger value="sso">
                <Shield className="w-4 h-4 mr-2" />
                SSO Configuration
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams">
              <TeamManagement organization={selectedOrgData} />
            </TabsContent>

            <TabsContent value="users">
              <UserProvisioning organization={selectedOrgData} />
            </TabsContent>

            <TabsContent value="sso">
              <SSOConfiguration organization={selectedOrgData} />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Organization Name</label>
                    <Input defaultValue={selectedOrgData.name} className="bg-[#1a0a2e]" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Email Domain</label>
                    <Input defaultValue={selectedOrgData.domain} placeholder="company.com" className="bg-[#1a0a2e]" />
                  </div>
                  <Button className="btn-primary">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}