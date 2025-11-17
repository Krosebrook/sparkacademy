import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, BookOpen, ExternalLink, Clock, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GeneratedPathPreview({ path, onSave, onBack }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-purple-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{path.path_name}</h1>
              <p className="text-slate-700 leading-relaxed">{path.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-violet-600 text-white">{path.difficulty}</Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {path.estimated_weeks} weeks
              </Badge>
              <Badge variant="outline">
                <BookOpen className="w-3 h-3 mr-1" />
                {path.milestones?.length || 0} milestones
              </Badge>
            </div>

            <div className="p-4 bg-white border border-violet-200 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Path Overview</h3>
              <p className="text-sm text-slate-700">{path.overview}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-600" />
            Learning Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {path.milestones?.map((milestone, idx) => (
              <div key={idx} className="relative pl-8 pb-6 border-l-2 border-violet-200 last:border-0 last:pb-0">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {idx + 1}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{milestone.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{milestone.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Duration: {milestone.duration}</span>
                    </div>
                  </div>

                  {milestone.internal_courses?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Internal Courses
                      </h4>
                      <div className="space-y-2">
                        {milestone.internal_courses.map((course, cidx) => (
                          <div key={cidx} className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-slate-900 text-sm">{course.title}</h5>
                                <p className="text-xs text-slate-600">{course.reason}</p>
                                {course.prerequisites?.length > 0 && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Prerequisites: {course.prerequisites.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {milestone.external_resources?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        External Resources
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {milestone.external_resources.map((resource, ridx) => (
                          <div key={ridx} className="p-3 bg-green-50 border border-green-200 rounded">
                            <h5 className="font-semibold text-slate-900 text-sm">{resource.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                              <span className="text-xs text-slate-600">{resource.duration}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{resource.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {milestone.skills_gained?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {milestone.skills_gained.map((skill, sidx) => (
                        <Badge key={sidx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Expected Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Skills You'll Master</h4>
              <div className="flex flex-wrap gap-2">
                {path.skills_gained?.map((skill, idx) => (
                  <Badge key={idx} className="bg-green-600 text-white">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Career Opportunities</h4>
              <p className="text-sm text-slate-700">{path.career_outcomes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onSave}
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Learning Path
        </Button>
      </div>
    </div>
  );
}