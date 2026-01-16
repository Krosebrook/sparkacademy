// Reusable shell for analytics components
// Provides consistent layout with analyze button and loading states
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AnalyticsShell({
  icon: Icon,
  title,
  iconColor = "text-cyan-400",
  buttonText = "Analyze with AI",
  buttonIcon: ButtonIcon,
  onAnalyze,
  isAnalyzing,
  hasData,
  emptyState,
  children
}) {
  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className={`w-6 h-6 ${iconColor}`} />
            {title}
          </span>
          <Button onClick={onAnalyze} disabled={isAnalyzing} className="btn-primary">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
                {buttonText}
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? emptyState : children}
      </CardContent>
    </Card>
  );
}