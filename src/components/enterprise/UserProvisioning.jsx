import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Upload, Download } from "lucide-react";

export default function UserProvisioning({ organization }) {
  const [bulkEmails, setBulkEmails] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleBulkProvision = async () => {
    setIsProvisioning(true);
    try {
      const emails = bulkEmails.split('\n').filter(e => e.trim());
      const result = await base44.functions.invoke('provisionUsers', {
        organization_id: organization.id,
        emails,
        auto_assign_teams: []
      });
      alert(`Provisioned ${result.data.success_count} users`);
      setBulkEmails('');
    } catch (error) {
      alert('Provisioning failed: ' + error.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'email,first_name,last_name,team_id\nuser@example.com,John,Doe,team-123';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-cyan-400" />
            Bulk User Provisioning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Bulk Add Users (one email per line)
            </label>
            <Textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="user1@company.com
user2@company.com
user3@company.com"
              className="bg-[#1a0a2e] font-mono"
              rows={8}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleBulkProvision}
              disabled={!bulkEmails.trim() || isProvisioning}
              className="btn-primary flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProvisioning ? 'Provisioning...' : 'Provision Users'}
            </Button>
            <Button onClick={downloadTemplate} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm">
            <h4 className="font-semibold text-blue-300 mb-2">Provisioning Options</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• Users will receive invitation emails</li>
              <li>• Users can be auto-assigned to teams</li>
              <li>• SSO users will bypass email verification</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}