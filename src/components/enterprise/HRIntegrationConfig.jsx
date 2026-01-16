import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Settings, Loader2 } from "lucide-react";

export default function HRIntegrationConfig({ organization }) {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: integrations = [] } = useQuery({
    queryKey: ['hr-integrations', organization.id],
    queryFn: () => base44.entities.HRIntegration.filter({ organization_id: organization.id })
  });

  const { data: syncLogs = [] } = useQuery({
    queryKey: ['hr-sync-logs'],
    queryFn: () => base44.entities.HRSyncLog.list('-created_date', 10)
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.HRIntegration.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr-integrations'] })
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HRIntegration.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr-integrations'] })
  });

  const syncEmployees = async (integration) => {
    setSyncing(true);
    try {
      const functionName = integration.hr_system === 'workday' 
        ? 'syncWorkdayEmployees' 
        : 'syncBambooHREmployees';
      
      const result = await base44.functions.invoke(functionName, {
        integration_id: integration.id
      });
      
      alert(`Sync complete: ${result.data.created} created, ${result.data.updated} updated`);
      queryClient.invalidateQueries({ queryKey: ['hr-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['hr-sync-logs'] });
    } catch (error) {
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const integration = integrations[0];

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            HR System Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integration ? (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Select HR System</label>
              <Select onValueChange={(value) => {
                createIntegrationMutation.mutate({
                  organization_id: organization.id,
                  hr_system: value,
                  is_active: false,
                  sync_frequency: 'daily',
                  sync_settings: {
                    sync_employees: true,
                    sync_departments: true,
                    auto_create_teams: false,
                    push_learning_data: false
                  }
                });
              }}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue placeholder="Choose HR system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workday">Workday</SelectItem>
                  <SelectItem value="bamboohr">BambooHR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-white capitalize">{integration.hr_system}</div>
                  <Badge className={integration.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                    {integration.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Button
                  onClick={() => syncEmployees(integration)}
                  disabled={syncing}
                  className="btn-primary"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Sync Frequency</label>
                  <Select
                    value={integration.sync_frequency}
                    onValueChange={(value) => {
                      updateIntegrationMutation.mutate({
                        id: integration.id,
                        data: { sync_frequency: value }
                      });
                    }}
                  >
                    <SelectTrigger className="bg-[#1a0a2e]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Last Sync</label>
                  <div className="p-2 bg-[#1a0a2e] rounded text-sm text-gray-300">
                    {integration.last_sync_date
                      ? new Date(integration.last_sync_date).toLocaleString()
                      : 'Never synced'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-cyan-300">Sync Settings</h4>
                <div className="space-y-2">
                  {[
                    { key: 'sync_employees', label: 'Sync Employees' },
                    { key: 'sync_departments', label: 'Sync Departments' },
                    { key: 'auto_create_teams', label: 'Auto-create Teams from Departments' },
                    { key: 'push_learning_data', label: 'Push Learning Data to HR System' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-[#0f0618]/50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={integration.sync_settings?.[key] || false}
                        onChange={(e) => {
                          updateIntegrationMutation.mutate({
                            id: integration.id,
                            data: {
                              sync_settings: {
                                ...integration.sync_settings,
                                [key]: e.target.checked
                              }
                            }
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-300">{label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    updateIntegrationMutation.mutate({
                      id: integration.id,
                      data: { is_active: !integration.is_active }
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {integration.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {syncLogs.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#0f0618]/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white capitalize">{log.sync_type}</div>
                      <div className="text-xs text-gray-400">
                        {log.records_processed} processed • {log.records_created} created • {log.records_updated} updated
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.created_date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}