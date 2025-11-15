import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, X, ExternalLink, BookOpen, Video, FileText, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function GeneratedResourcesPreview({ resources, onAccept, onReject }) {
    if (!resources || resources.length === 0) return null;

    const getResourceIcon = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes("video")) return Video;
        if (lowerType.includes("course")) return GraduationCap;
        if (lowerType.includes("book")) return BookOpen;
        return FileText;
    };

    const getResourceColor = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes("video")) return "from-red-500 to-pink-600";
        if (lowerType.includes("course")) return "from-purple-500 to-indigo-600";
        if (lowerType.includes("book")) return "from-amber-500 to-orange-600";
        return "from-emerald-500 to-teal-600";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardHeader className="border-b border-emerald-100 pb-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl text-slate-900 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-white" />
                            </div>
                            Suggested Learning Resources
                        </CardTitle>
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                            {resources.length} Resources
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                        {resources.map((resource, idx) => {
                            const Icon = getResourceIcon(resource.type);
                            const colorClass = getResourceColor(resource.type);
                            
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h4 className="text-lg font-semibold text-slate-900">
                                                    {resource.title}
                                                </h4>
                                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                                    {resource.type}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                                {resource.description}
                                            </p>
                                            {resource.url && (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                                >
                                                    View Resource
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={onAccept}
                            className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <Check className="h-5 w-5 mr-2" />
                            Add These Resources
                        </Button>
                        <Button
                            onClick={onReject}
                            variant="outline"
                            className="h-12 border-slate-300 hover:bg-slate-50"
                        >
                            <X className="h-5 w-5 mr-2" />
                            Find Different Resources
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}