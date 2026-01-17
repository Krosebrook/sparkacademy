/**
 * Integration Hub
 * Centralized integration management dashboard
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const INTEGRATIONS_CONFIG = [
  // Data Sources
  { name: 'Market Data AI', category: 'data', icon: '📊', desc: 'Real-time market intelligence' },
  { name: 'Deal Flow Aggregator', category: 'data', icon: '💼', desc: 'AngelList, Crunchbase, PitchBook' },
  { name: 'Company Research', category: 'data', icon: '🔍', desc: 'Web scraping & data extraction' },
  { name: 'Financial Data API', category: 'data', icon: '💹', desc: 'Stock prices, crypto, forex' },
  
  // Communication
  { name: 'Email', category: 'communication', icon: '📧', desc: 'Transactional & marketing emails' },
  { name: 'Slack', category: 'communication', icon: '💬', desc: 'Team notifications' },
  { name: 'SMS/Twilio', category: 'communication', icon: '📱', desc: 'Mobile alerts' },
  { name: 'Discord', category: 'communication', icon: '🎮', desc: 'Community chat' },
  
  // Document Management
  { name: 'Google Drive', category: 'document', icon: '📁', desc: 'File storage & sync' },
  { name: 'Google Sheets', category: 'document', icon: '📑', desc: 'Portfolio tracking' },
  { name: 'Google Slides', category: 'document', icon: '🎨', desc: 'Pitch deck creation' },
  { name: 'Notion', category: 'document', icon: '📓', desc: 'Deal database & notes' },
  
  // Finance & Accounting
  { name: 'Stripe', category: 'finance', icon: '💳', desc: 'Payment processing' },
  { name: 'Plaid', category: 'finance', icon: '🏦', desc: 'Bank account linking' },
  { name: 'Tax Software', category: 'finance', icon: '🧾', desc: 'Tax reporting' },
  { name: 'QuickBooks', category: 'finance', icon: '📊', desc: 'Accounting sync' },
  
  // Analytics
  { name: 'Portfolio Analytics', category: 'analytics', icon: '📈', desc: 'Performance tracking' },
  { name: 'Risk Analytics', category: 'analytics', icon: '⚠️', desc: 'Risk assessment' },
  { name: 'Google Analytics', category: 'analytics', icon: '🔢', desc: 'Usage tracking' },
  
  // Marketplace
  { name: 'Calendar', category: 'marketplace', icon: '📅', desc: 'Google Calendar sync' },
  { name: 'LinkedIn', category: 'marketplace', icon: '👥', desc: 'Network integration' },
  { name: 'TikTok', category: 'marketplace', icon: '🎬', desc: 'Creator analytics' },
  
  // Compliance
  { name: 'Compliance Check', category: 'compliance', icon: '✅', desc: 'KYC/AML verification' },
  { name: 'Accreditation', category: 'compliance', icon: '🔐', desc: 'Investor verification' },
  { name: 'SEC Filings', category: 'compliance', icon: '📜', desc: 'Regulatory tracking' }
];

export default function IntegrationHub() {
  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration?.filter({}).catch(() => [])
  });

  const [selectedCategory, setSelectedCategory] = useState('data');

  const categoryColors = {
    data: 'bg-blue-500/10 border-blue-500/30',
    communication: 'bg-purple-500/10 border-purple-500/30',
    document: 'bg-green-500/10 border-green-500/30',
    finance: 'bg-yellow-500/10 border-yellow-500/30',
    analytics: 'bg-pink-500/10 border-pink-500/30',
    marketplace: 'bg-orange-500/10 border-orange-500/30',
    compliance: 'bg-red-500/10 border-red-500/30'
  };

  const filteredIntegrations = INTEGRATIONS_CONFIG.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Integration Hub</h1>
        <p className="text-gray-400">Connect your favorite tools and automate your workflow</p>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-[#1a0a2e]/50">
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="communication">Comms</TabsTrigger>
          <TabsTrigger value="document">Docs</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="marketplace">Market</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {Object.keys(categoryColors).map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTEGRATIONS_CONFIG.filter(i => i.category === category).map(integration => {
                const connected = integrations?.find(int => int.name === integration.name);
                const isEnabled = connected?.status === 'enabled';
                
                return (
                  <Card key={integration.name} className={`card-glow border ${categoryColors[category]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{integration.name}</h3>
                            <p className="text-xs text-gray-400">{integration.desc}</p>
                          </div>
                        </div>
                        {isEnabled && (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="space-y-2">
                        {isEnabled ? (
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 text-xs" disabled>
                              Connected
                            </Button>
                            <Button variant="outline" className="flex-1 text-xs">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button className="btn-primary w-full text-xs">
                            <Plug className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Integration Status */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Connected Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {integrations?.filter(i => i.status === 'enabled').map(int => (
              <div key={int.id} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded">
                <span className="text-sm text-green-300">{int.name}</span>
                <span className="text-xs text-gray-400">Last sync: {int.last_sync ? new Date(int.last_sync).toLocaleDateString() : 'Never'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}