/**
 * Weekly Digest Card
 * Displays the weekly personalized digest with deals, insights, and community highlights
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Target, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyDigestCard({ digest, onDismiss, onAction }) {
  const [dismissing, setDismissing] = useState(false);

  if (!digest) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="card-glow border border-purple-500/20 overflow-hidden">
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-white mb-2">{digest.headline}</CardTitle>
              <p className="text-sm text-gray-400">Curated just for you</p>
            </div>
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={digest.sections?.[0]?.type || 'deals'} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full mb-6" style={{ gridTemplateColumns: `repeat(${digest.sections?.length || 1}, 1fr)` }}>
              {digest.sections?.map((section) => (
                <TabsTrigger key={section.type} value={section.type} className="text-xs">
                  {section.type === 'deals' && 'Deals'}
                  {section.type === 'insights' && 'Insights'}
                  {section.type === 'community' && 'Community'}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Deals Section */}
            {digest.sections?.find(s => s.type === 'deals') && (
              <TabsContent value="deals" className="space-y-4">
                <div className="space-y-3">
                  {digest.sections
                    .find(s => s.type === 'deals')
                    ?.items?.map((deal, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm">{deal.deal_name}</h4>
                          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {deal.match_score}% match
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">{deal.reason}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction?.(deal.deal_name, 'deal')}
                          className="text-xs"
                        >
                          {deal.action}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
            )}

            {/* Insights Section */}
            {digest.sections?.find(s => s.type === 'insights') && (
              <TabsContent value="insights" className="space-y-4">
                <div className="space-y-3">
                  {digest.sections
                    .find(s => s.type === 'insights')
                    ?.items?.map((insight, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm mb-1">{insight.insight_title}</h4>
                            <p className="text-xs text-gray-300 mb-3">{insight.insight_text}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAction?.(insight.insight_title, 'insight')}
                              className="text-xs"
                            >
                              {insight.action}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            )}

            {/* Community Section */}
            {digest.sections?.find(s => s.type === 'community') && (
              <TabsContent value="community" className="space-y-4">
                <div className="space-y-3">
                  {digest.sections
                    .find(s => s.type === 'community')
                    ?.items?.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 border border-green-500/10 rounded-lg hover:border-green-500/30 transition-all">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                            {item.type === 'discussion' && (
                              <p className="text-xs text-gray-400 mb-2">by {item.author}</p>
                            )}
                            {item.type === 'person' && (
                              <p className="text-xs text-gray-400 mb-2">{item.expertise}</p>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAction?.(item.title, 'community')}
                              className="text-xs"
                            >
                              {item.action}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Metrics Footer */}
          {digest.metrics && Object.keys(digest.metrics).length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-500/10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {digest.metrics.this_week_actions !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{digest.metrics.this_week_actions}</div>
                  <div className="text-xs text-gray-500">Actions this week</div>
                </div>
              )}
              {digest.metrics.deals_saved !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{digest.metrics.deals_saved}</div>
                  <div className="text-xs text-gray-500">Deals saved</div>
                </div>
              )}
              {digest.metrics.community_engagement !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{digest.metrics.community_engagement}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
              )}
              {digest.metrics.portfolio_health && (
                <div className="text-center">
                  <div className="text-sm font-semibold text-emerald-400">{digest.metrics.portfolio_health}</div>
                  <div className="text-xs text-gray-500">Portfolio status</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}