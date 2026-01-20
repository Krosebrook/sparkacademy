import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { DollarSign, Loader2, TrendingUp, Package, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MonetizationStrategist() {
  const [loading, setLoading] = useState(false);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState({ title: '', level: '', hours: '' });
  const [strategy, setStrategy] = useState(null);
  const [bundleStrategy, setBundleStrategy] = useState(null);

  const analyze = async () => {
    if (!courseInfo.title) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('suggestMonetization', {
        course_title: courseInfo.title,
        level: courseInfo.level,
        total_hours: courseInfo.hours
      });
      setStrategy(data);
    } catch (error) {
      console.error('Monetization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBundleStrategy = async () => {
    setBundleLoading(true);
    try {
      const user = await base44.auth.me();
      const allCourses = await base44.entities.Course.filter({ created_by: user.email });
      
      if (!allCourses || allCourses.length < 2) {
        alert('You need at least 2 courses to create bundles');
        return;
      }
      
      const { data } = await base44.functions.invoke('generateBundleStrategy', {
        courses: allCourses.map(c => ({
          id: c.id,
          title: c.title || 'Untitled Course',
          level: c.level || 'intermediate',
          category: c.category || 'general',
          price: c.price || 0
        }))
      });
      setBundleStrategy(data);
    } catch (error) {
      console.error('Bundle strategy error:', error);
      alert('Failed to generate bundle strategy. Please try again.');
    } finally {
      setBundleLoading(false);
    }
  };

  const [copiedBundle, setCopiedBundle] = useState(null);

  const copyBundleDescription = (bundleId) => {
    const bundle = bundleStrategy?.bundles?.find(b => b.bundle_id === bundleId);
    if (bundle) {
      navigator.clipboard.writeText(bundle.marketing_copy);
      setCopiedBundle(bundleId);
      setTimeout(() => setCopiedBundle(null), 2000);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Monetization Strategist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a0a2e] border border-gray-700">
            <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
            <TabsTrigger value="bundles">Course Bundles</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-4 mt-4">
        <Input
          value={courseInfo.title}
          onChange={(e) => setCourseInfo({...courseInfo, title: e.target.value})}
          placeholder="Course title"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={courseInfo.level}
            onChange={(e) => setCourseInfo({...courseInfo, level: e.target.value})}
            placeholder="Level (e.g., Beginner)"
          />
          <Input
            value={courseInfo.hours}
            onChange={(e) => setCourseInfo({...courseInfo, hours: e.target.value})}
            placeholder="Total hours"
            type="number"
          />
        </div>
        <Button onClick={analyze} disabled={loading || !courseInfo.title}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
          Analyze
        </Button>

        {strategy && (
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Recommended Pricing</h4>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-400">${strategy.recommended_price}</span>
                <Badge variant="outline">{strategy.price_range}</Badge>
              </div>
              <p className="text-sm text-gray-400 mt-2">{strategy.pricing_rationale}</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Premium Content Suggestions</h4>
              <div className="space-y-2">
                {strategy.premium_tiers?.map((tier, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">{tier.name}</span>
                      <Badge className="bg-purple-600">${tier.price}</Badge>
                    </div>
                    <ul className="space-y-1">
                      {tier.features?.map((feature, i) => (
                        <li key={i} className="text-xs text-gray-300">• {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2 text-sm">Marketing Tips</h4>
              <ul className="space-y-1">
                {strategy.marketing_tips?.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-300">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4 mt-4">
            <Button 
              onClick={generateBundleStrategy} 
              disabled={bundleLoading}
              className="w-full btn-primary"
            >
              {bundleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
              Generate Bundle Strategy
            </Button>

            {bundleStrategy && (
              <div className="space-y-4">
                {bundleStrategy.bundles?.map((bundle, idx) => (
                  <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white text-lg">{bundle.bundle_name}</h4>
                        <Badge className="bg-purple-500/20 text-purple-300 mt-1">{bundle.bundle_type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">${bundle.bundle_price}</div>
                        <div className="text-xs text-gray-400">Save ${bundle.savings}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-2">Included Courses:</div>
                      <div className="flex flex-wrap gap-2">
                        {bundle.course_titles?.map((title, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{title}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-2">Pricing Tiers:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {bundle.pricing_tiers?.map((tier, i) => (
                          <div key={i} className="bg-gray-800/50 rounded p-2">
                            <div className="text-xs font-semibold text-white">{tier.tier_name}</div>
                            <div className="text-lg font-bold text-cyan-400">${tier.price}</div>
                            <ul className="text-xs text-gray-400 mt-1 space-y-1">
                              {tier.features?.map((f, fi) => (
                                <li key={fi}>• {f}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-white">Marketing Copy</div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyBundleDescription(bundle.bundle_id)}
                          className="text-xs"
                        >
                          {copiedBundle === bundle.bundle_id ? 
                            <><Check className="w-3 h-3 mr-1" /> Copied!</> : 
                            <><Copy className="w-3 h-3 mr-1" /> Copy</>
                          }
                        </Button>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{bundle.marketing_copy}</p>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-2">Target Audience:</div>
                      <p className="text-sm text-gray-400">{bundle.target_audience}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2 text-sm">Bundle Strategy Insights</h4>
                  <ul className="space-y-1">
                    {bundleStrategy.insights?.map((insight, idx) => (
                      <li key={idx} className="text-sm text-gray-300">• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}