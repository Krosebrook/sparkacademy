import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, WifiOff, PlayCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import OfflineManager from "@/components/pwa/OfflineManager";
import OfflineSync from "@/components/pwa/OfflineSync";

export default function OfflineCourses() {
    const navigate = useNavigate();
    const [offlineCourses, setOfflineCourses] = useState([]);

    useEffect(() => {
        loadOfflineCourses();
    }, []);

    const loadOfflineCourses = () => {
        const courses = JSON.parse(localStorage.getItem('offline_courses') || '[]');
        setOfflineCourses(courses);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <WifiOff className="h-8 w-8 text-blue-600" />
                        Offline Learning
                    </h1>
                    <p className="text-slate-600">
                        Access your downloaded courses anytime, anywhere
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2">
                        {offlineCourses.length === 0 ? (
                            <Card className="border-0 shadow-xl">
                                <CardContent className="p-16 text-center">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                                        <Download className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                                        No Offline Courses Yet
                                    </h3>
                                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                        Download courses to access them without an internet connection
                                    </p>
                                    <Button
                                        onClick={() => navigate(createPageUrl("Dashboard"))}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Browse Courses
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {offlineCourses.map((course) => (
                                    <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="h-8 w-8 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                                            {course.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 mb-2">
                                                            {course.lessonCount} lessons available offline
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Downloaded on {new Date(course.downloadedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${course.id}`)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                    Continue
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <OfflineManager />
                        <OfflineSync />
                    </div>
                </div>
            </div>
        </div>
    );
}