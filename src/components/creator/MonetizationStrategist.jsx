import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { DollarSign, Loader2, TrendingUp } from 'lucide-react';

export default function MonetizationStrategist() {
  const [loading, setLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState({ title: '', level: '', hours: '' });
  const [strategy, setStrategy] = useState(null);

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

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Monetization Strategist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}