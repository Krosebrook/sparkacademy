import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AILeaderboard() {
  const [leaderboards, setLeaderboards] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  useEffect(() => {
    loadLeaderboards();
  }, [selectedPeriod]);

  const loadLeaderboards = async () => {
    try {
      const types = ["global_points", "global_badges", "global_streaks", "category_points"];
      const data = {};

      for (const type of types) {
        const entries = await base44.entities.LeaderboardEntry.filter(
          { leaderboard_type: type, period: selectedPeriod },
          "rank",
          10
        );
        data[type] = entries;
      }

      setLeaderboards(data);
    } catch (error) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;

  const LeaderboardTable = ({ entries, scoreLabel }) => (
    <div className="space-y-2">
      {entries?.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
            idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-amber-600" : "bg-blue-500"
          }`}>
            {entry.rank}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{entry.user_name}</p>
            <p className="text-xs text-slate-600">{scoreLabel}: {entry.score}</p>
          </div>
          {entry.score_change !== 0 && (
            <div className={`flex items-center gap-1 ${entry.score_change > 0 ? "text-green-600" : "text-red-600"}`}>
              {entry.score_change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-semibold">{Math.abs(entry.score_change)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Global Leaderboards
          </CardTitle>
          <div className="space-x-2">
            {["weekly", "monthly", "all_time"].map(period => (
              <Badge
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod(period)}
              >
                {period.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <LeaderboardTable entries={leaderboards.global_points} scoreLabel="Points" />
          </TabsContent>

          <TabsContent value="badges">
            <LeaderboardTable entries={leaderboards.global_badges} scoreLabel="Badges" />
          </TabsContent>

          <TabsContent value="streaks">
            <LeaderboardTable entries={leaderboards.global_streaks} scoreLabel="Days" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}