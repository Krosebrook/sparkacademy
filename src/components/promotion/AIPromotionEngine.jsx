import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Zap, Users, TrendingUp, Target } from "lucide-react";

export default function AIPromotionEngine({ courseId, creatorEmail }) {
  const [campaign, setCampaign] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignName, setCampaignName] = useState("");

  const generatePromotionStrategy = async () => {
    if (!campaignName.trim()) return;
    setIsGenerating(true);

    try {
      const course = await base44.entities.Course.get(courseId);
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      const feedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });

      const prompt = `Create a targeted promotion strategy for this course.

Course: ${course.title}
Category: ${course.category}
Enrollments: ${enrollments.length}
Rating: ${course.rating}/5
Reviews: ${feedback.length}
Description: ${course.description}

Analyze the course and recommend:
1. Target student segments (learning level, interests, engagement)
2. Marketing messaging and value propositions
3. Promotional offer (discount, free trial, bonus points)
4. Optimal channels for reaching audience
5. Expected conversion rate (%)
6. Estimated reach

Provide actionable, specific recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            target_segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  segment_name: { type: "string" },
                  learning_levels: { type: "array", items: { type: "string" } },
                  interests: { type: "array", items: { type: "string" } },
                  engagement_level: { type: "string" }
                }
              }
            },
            messaging: { type: "string" },
            offer: { type: "string" },
            channels: { type: "array", items: { type: "string" } },
            expected_conversion_rate: { type: "number" },
            estimated_reach: { type: "number" }
          }
        }
      });

      const newCampaign = {
        course_id: courseId,
        creator_email: creatorEmail,
        campaign_name: campaignName,
        target_segment: {
          learning_level: result.target_segments?.[0]?.learning_levels || [],
          interests: result.target_segments?.[0]?.interests || [],
          engagement_level: result.target_segments?.[0]?.engagement_level || "medium"
        },
        strategy: {
          messaging: result.messaging,
          offer: result.offer,
          channels: result.channels,
          expected_conversion_rate: result.expected_conversion_rate,
          estimated_reach: result.estimated_reach
        },
        status: "draft"
      };

      await base44.entities.PromotionCampaign.create(newCampaign);
      setCampaign(newCampaign);
      setCampaignName("");
    } catch (error) {
      console.error("Error generating strategy:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          AI Promotion Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!campaign ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Generate an AI-powered promotion strategy to maximize your course's visibility
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Campaign name (e.g., 'Spring Launch')"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <Button
                onClick={generatePromotionStrategy}
                disabled={isGenerating || !campaignName.trim()}
                className="bg-purple-600"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">{campaign.campaign_name}</h3>
              <Badge className="bg-blue-100 text-blue-800 mb-3">{campaign.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Expected Conversion</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(campaign.strategy.expected_conversion_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Est. Reach</p>
                <p className="text-2xl font-bold text-slate-900">
                  {campaign.strategy.estimated_reach.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Messaging</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                {campaign.strategy.messaging}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Recommended Offer</p>
              <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                {campaign.strategy.offer}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Channels</p>
              <div className="flex flex-wrap gap-2">
                {campaign.strategy.channels?.map((channel, idx) => (
                  <Badge key={idx} variant="outline">{channel}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Target Audience</p>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-600">Learning Levels:</span>
                  <div className="flex gap-1 mt-1">
                    {campaign.target_segment.learning_level?.map((level, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800">{level}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Interests:</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {campaign.target_segment.interests?.map((interest, idx) => (
                      <Badge key={idx} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full bg-purple-600" onClick={() => setCampaign(null)}>
              Generate New Strategy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}