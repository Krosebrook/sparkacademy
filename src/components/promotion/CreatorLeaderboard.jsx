import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Star, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreatorLeaderboard() {
  const [leaderboards, setLeaderboards] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCreatorLeaderboards();
  }, []);

  const loadCreatorLeaderboards = async () => {
    try {
      const types = ["creator_enrollments", "creator_ratings", "creator_success"];
      const data = {};

      for (const type of types) {
        const entries = await base44.entities.LeaderboardEntry.filter(
          { leaderboard_type: type, period: "all_time" },
          "rank",
          10
        );
        data[type] = entries;
      }

      setLeaderboards(data);
    } catch (error) {
      console.error("Error loading creator leaderboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;

  const CreatorRow = ({ entry, icon: Icon, metric }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
        entry.rank === 1 ? "bg-yellow-500" : entry.rank === 2 ? "bg-slate-400" : entry.rank === 3 ? "bg-amber-600" : "bg-blue-500"
      }`}>
        {entry.rank}
      </div>
      <Icon className="w-5 h-5 text-slate-400" />
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{entry.user_name}</p>
        <p className="text-xs text-slate-600">{metric}</p>
      </div>
      <Badge className="bg-purple-100 text-purple-800">{entry.score}</Badge>
    </div>
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Top Creators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="enrollments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="success">Student Success</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments" className="space-y-2">
            {leaderboards.creator_enrollments?.map((entry, idx) => (
              <CreatorRow key={idx} entry={entry} icon={Users} metric={`${entry.score} total enrollments`} />
            ))}
          </TabsContent>

          <TabsContent value="ratings" className="space-y-2">
            {leaderboards.creator_ratings?.map((entry, idx) => (
              <CreatorRow key={idx} entry={entry} icon={Star} metric={`${entry.score.toFixed(1)}/5 avg rating`} />
            ))}
          </TabsContent>

          <TabsContent value="success" className="space-y-2">
            {leaderboards.creator_success?.map((entry, idx) => (
              <CreatorRow key={idx} entry={entry} icon={Trophy} metric={`${entry.score}% avg completion`} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}