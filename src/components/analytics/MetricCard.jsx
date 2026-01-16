// Reusable metric card component for displaying statistics
// Consistent styling and layout for all metric displays
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricCard({ icon: Icon, title, value, gradient, iconColor }) {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-opacity-30`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium ${iconColor} flex items-center gap-2`}>
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}