import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Gift, TrendingUp, Award } from "lucide-react";
import CreatorPointsBalance from "@/components/creator/CreatorPointsBalance";
import RewardCatalog from "@/components/creator/RewardCatalog";
import CreatorPortfolio from "@/components/creator/CreatorPortfolio";

export default function CreatorEarnings() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pointsData, setPointsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      if (userData?.email) {
        const points = await base44.entities.CreatorPoints.filter({ creator_email: userData.email });
        if (points.length > 0) {
          setPointsData(points[0]);
        }

        const trans = await base44.entities.PointsTransaction.filter(
          { creator_email: userData.email },
          "-created_date",
          20
        );
        setTransactions(trans);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Please log in to view your earnings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Creator Earnings & Rewards</h1>
          <p className="text-slate-600">Earn points from your courses and redeem them for rewards</p>
        </div>

        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="points">
              <Zap className="w-4 h-4 mr-2" />
              Points & Balance
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="w-4 h-4 mr-2" />
              Reward Catalog
            </TabsTrigger>
            <TabsTrigger value="portfolio">
              <Award className="w-4 h-4 mr-2" />
              Your Courses
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-6">
            <CreatorPointsBalance creatorEmail={user.email} />

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>How You Earn Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl">📚</div>
                  <div>
                    <p className="font-semibold text-slate-900">Course Enrollment</p>
                    <p className="text-sm text-slate-600">+10 points per student enrollment</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="font-semibold text-slate-900">Positive Ratings</p>
                    <p className="text-sm text-slate-600">+5 bonus points per 5-star review</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <p className="font-semibold text-slate-900">Course Completion</p>
                    <p className="text-sm text-slate-600">+15 points when a student completes your course</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            {pointsData && (
              <RewardCatalog
                creatorEmail={user.email}
                availablePoints={pointsData.available_points}
              />
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <CreatorPortfolio creatorEmail={user.email} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Points Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((trans) => (
                      <div key={trans.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-900">{trans.description}</p>
                          <p className="text-xs text-slate-500">{trans.transaction_type}</p>
                        </div>
                        <div className={`text-lg font-bold ${trans.points_amount > 0 ? "text-green-600" : "text-orange-600"}`}>
                          {trans.points_amount > 0 ? "+" : ""}{trans.points_amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}