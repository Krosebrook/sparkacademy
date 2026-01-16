import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function SSOConfiguration({ organization }) {
  const [config, setConfig] = useState(organization.sso_config || {});
  const queryClient = useQueryClient();

  const updateSSOMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(organization.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] })
  });

  const handleSave = () => {
    updateSSOMutation.mutate({
      sso_enabled: true,
      sso_config: config
    });
  };

  const testSSO = async () => {
    try {
      const result = await base44.functions.invoke('testSSOConnection', {
        organization_id: organization.id
      });
      alert(result.data.message);
    } catch (error) {
      alert('SSO test failed: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Single Sign-On Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SSO Provider */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">SSO Provider</label>
            <Select
              value={organization.sso_provider || 'none'}
              onValueChange={(value) => {
                updateSSOMutation.mutate({ sso_provider: value });
              }}
            >
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="saml">SAML 2.0</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="azure_ad">Azure AD</SelectItem>
                <SelectItem value="google">Google Workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {organization.sso_provider !== 'none' && (
            <>
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">Service Provider Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">ACS URL:</span>
                    <code className="ml-2 text-cyan-400">
                      https://app.base44.com/sso/acs/{organization.id}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-400">Entity ID:</span>
                    <code className="ml-2 text-cyan-400">
                      https://app.base44.com/sso/{organization.id}
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Identity Provider Entity ID</label>
                <Input
                  value={config.entity_id || ''}
                  onChange={(e) => setConfig({ ...config, entity_id: e.target.value })}
                  placeholder="https://idp.example.com/entity"
                  className="bg-[#1a0a2e]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Single Sign-On URL</label>
                <Input
                  value={config.sso_url || ''}
                  onChange={(e) => setConfig({ ...config, sso_url: e.target.value })}
                  placeholder="https://idp.example.com/sso"
                  className="bg-[#1a0a2e]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">X.509 Certificate</label>
                <Textarea
                  value={config.certificate || ''}
                  onChange={(e) => setConfig({ ...config, certificate: e.target.value })}
                  placeholder="-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----"
                  className="bg-[#1a0a2e] font-mono text-xs"
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <input
                  type="checkbox"
                  checked={config.auto_provision || false}
                  onChange={(e) => setConfig({ ...config, auto_provision: e.target.checked })}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium text-white">Auto-provision users</div>
                  <div className="text-xs text-gray-400">
                    Automatically create accounts for new users from SSO
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="btn-primary flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button onClick={testSSO} variant="outline" className="flex-1">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </>
          )}

          {organization.sso_enabled && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-medium text-green-300">SSO is Active</div>
                <div className="text-xs text-gray-400">Users can sign in using {organization.sso_provider}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}