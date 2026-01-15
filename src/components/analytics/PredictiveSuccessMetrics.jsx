import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Users, Zap, Loader2, LineChart } from "lucide-react";

export default function PredictiveSuccessMetrics({ course, enrollments, feedback }) {
  const [predictions, setPredictions] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const generatePredictions = async () => {
    setIsPredicting(true);
    try {
      const avgCompletion = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
        : 0;

      const avgRating = feedback.length > 0
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
        : 0;

      const activeStudents = enrollments.filter(e => 
        e.updated_date && new Date(e.updated_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      const completedStudents = enrollments.filter(e => e.completion_percentage === 100).length;

      const prompt = `As a data scientist, analyze course performance and predict future success for "${course.title}":

Current Metrics:
- Total Enrollments: ${enrollments.length}
- Active Students (last 7 days): ${activeStudents}
- Average Completion Rate: ${avgCompletion.toFixed(1)}%
- Completion Count: ${completedStudents}
- Average Rating: ${avgRating.toFixed(1)}/5
- Total Reviews: ${feedback.length}
- Course Level: ${course.level}
- Lessons: ${course.lessons?.length || 0}
- Published: ${course.is_published}

Historical trends:
- Enrollment velocity: ${(enrollments.length / Math.max((Date.now() - new Date(course.created_date)) / (1000 * 60 * 60 * 24), 1)).toFixed(2)} per day
- Engagement rate: ${enrollments.length > 0 ? (activeStudents / enrollments.length * 100).toFixed(1) : 0}%
- Completion rate: ${enrollments.length > 0 ? (completedStudents / enrollments.length * 100).toFixed(1) : 0}%

Provide data-driven predictions:
1. 30-day enrollment forecast
2. 90-day enrollment forecast
3. Expected completion rate trend
4. Revenue potential (if monetized)
5. Virality score and growth potential
6. Risk factors that could impact success
7. Recommended actions to maximize success
8. Competitive positioning advice`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            success_score: { type: "number" },
            success_category: { type: "string" },
            enrollments_30d: { type: "number" },
            enrollments_90d: { type: "number" },
            completion_trend: { type: "string" },
            completion_forecast_30d: { type: "number" },
            revenue_potential: {
              type: "object",
              properties: {
                low: { type: "number" },
                mid: { type: "number" },
                high: { type: "number" }
              }
            },
            virality_score: { type: "number" },
            growth_potential: { type: "string" },
            risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  severity: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            success_drivers: { type: "array", items: { type: "string" } },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  expected_impact: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            competitive_positioning: { type: "string" }
          }
        }
      });

      setPredictions(result);
    } catch (error) {
      console.error("Error generating predictions:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              Predictive Success Analytics
            </span>
            <Button onClick={generatePredictions} disabled={isPredicting} className="btn-primary">
              {isPredicting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <LineChart className="w-4 h-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!predictions ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-orange-400/30 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">AI-powered predictive analytics</p>
              <p className="text-sm text-gray-500">Forecast enrollments, revenue, and success probability</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Score */}
              <div className="p-4 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-orange-300">Overall Success Score</h3>
                  <span className="text-3xl font-bold text-orange-400">{predictions.success_score}/100</span>
                </div>
                <Progress value={predictions.success_score} className="h-2 mb-2" />
                <p className="text-sm text-gray-300">Category: {predictions.success_category}</p>
              </div>

              {/* Enrollment Forecasts */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      30-Day Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      +{predictions.enrollments_30d}
                    </div>
                    <div className="text-xs text-gray-400">Expected new enrollments</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      90-Day Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      +{predictions.enrollments_90d}
                    </div>
                    <div className="text-xs text-gray-400">Expected new enrollments</div>
                  </CardContent>
                </Card>
              </div>

              {/* Completion Trend */}
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-300 mb-2">Completion Rate Forecast</h3>
                <p className="text-sm text-gray-300 mb-2">{predictions.completion_trend}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">30-day forecast:</span>
                  <span className="text-lg font-bold text-green-400">{predictions.completion_forecast_30d}%</span>
                </div>
              </div>

              {/* Revenue Potential */}
              {predictions.revenue_potential && (
                <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                  <h3 className="font-semibold text-cyan-300 mb-3">Revenue Potential (if monetized)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Conservative</div>
                      <div className="text-xl font-bold text-cyan-400">
                        ${predictions.revenue_potential.low?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Expected</div>
                      <div className="text-xl font-bold text-cyan-300">
                        ${predictions.revenue_potential.mid?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Optimistic</div>
                      <div className="text-xl font-bold text-cyan-200">
                        ${predictions.revenue_potential.high?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Virality & Growth */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Virality Score
                  </h3>
                  <div className="text-3xl font-bold text-purple-400 mb-1">{predictions.virality_score}/10</div>
                  <Progress value={predictions.virality_score * 10} className="h-2" />
                </div>

                <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                  <h3 className="font-semibold text-orange-300 mb-2">Growth Potential</h3>
                  <div className="text-xl font-bold text-orange-400">{predictions.growth_potential}</div>
                </div>
              </div>

              {/* Success Drivers */}
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-300 mb-3">Key Success Drivers</h3>
                <ul className="space-y-2">
                  {predictions.success_drivers?.map((driver, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              {predictions.risk_factors?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-300 mb-3">Risk Factors</h3>
                  <div className="space-y-3">
                    {predictions.risk_factors.map((risk, idx) => (
                      <div key={idx} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{risk.factor}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            risk.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                            risk.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-blue-500/30 text-blue-300'
                          }`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">Mitigation: {risk.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3">Recommended Actions</h3>
                <div className="space-y-3">
                  {predictions.recommended_actions?.map((action, idx) => (
                    <div key={idx} className="p-4 bg-[#1a0a2e] border border-yellow-500/30 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">{action.action}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Expected Impact:</span>
                          <span className="ml-2 text-cyan-400">{action.expected_impact}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Timeline:</span>
                          <span className="ml-2 text-purple-400">{action.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitive Positioning */}
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Competitive Positioning</h3>
                <p className="text-sm text-gray-300">{predictions.competitive_positioning}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}