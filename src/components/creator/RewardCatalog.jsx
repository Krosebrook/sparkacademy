import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Gift, Zap, AlertCircle } from "lucide-react";

export default function RewardCatalog({ creatorEmail, availablePoints }) {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await base44.entities.RewardItem.filter({ is_active: true });
      setRewards(data.sort((a, b) => a.points_required - b.points_required));
    } catch (error) {
      console.error("Error loading rewards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (availablePoints < reward.points_required) {
      alert("Not enough points to redeem this reward");
      return;
    }

    setRedeeming(reward.id);
    try {
      // Create transaction
      await base44.entities.PointsTransaction.create({
        creator_email: creatorEmail,
        transaction_type: "redemption",
        points_amount: -reward.points_required,
        related_reward_id: reward.id,
        description: `Redeemed: ${reward.name}`
      });

      // Update creator points
      const pointsData = await base44.entities.CreatorPoints.filter({ creator_email: creatorEmail });
      if (pointsData.length > 0) {
        const updated = pointsData[0];
        await base44.entities.CreatorPoints.update(updated.id, {
          available_points: updated.available_points - reward.points_required,
          redeemed_points: updated.redeemed_points + reward.points_required
        });
      }

      alert("Reward redeemed successfully! Check your email for details.");
      window.location.reload();
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Failed to redeem reward. Please try again.");
    } finally {
      setRedeeming(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Reward Catalog</h3>
        <Badge className="bg-amber-100 text-amber-800 font-semibold">
          <Zap className="w-3 h-3 mr-1" />
          {availablePoints} Points Available
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const canRedeem = availablePoints >= reward.points_required;
          
          return (
            <Card key={reward.id} className={`border-0 shadow-md ${!canRedeem ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                {reward.image_url && (
                  <img
                    src={reward.image_url}
                    alt={reward.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{reward.name}</h4>
                    <Badge variant="outline" className="mt-1">
                      {reward.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">{reward.points_required}</p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-3">{reward.description}</p>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!canRedeem || redeeming === reward.id}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {redeeming === reward.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redeeming...
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Redeem
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  {canRedeem && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Redeem: {reward.name}</DialogTitle>
                        <DialogDescription>
                          This will cost {reward.points_required} points from your balance.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-900">{reward.description}</p>
                        </div>
                        <Button
                          onClick={() => handleRedeem(reward)}
                          className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                          Confirm Redemption
                        </Button>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>

                {!canRedeem && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <AlertCircle className="w-3 h-3" />
                    Need {reward.points_required - availablePoints} more points
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}