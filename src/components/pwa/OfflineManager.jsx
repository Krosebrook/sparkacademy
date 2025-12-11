import React, { useState, useEffect } from "react";
import { Download, Wifi, WifiOff, Trash2, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function OfflineManager() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineCourses, setOfflineCourses] = useState([]);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageQuota, setStorageQuota] = useState(0);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadOfflineCourses();
        checkStorage();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadOfflineCourses = () => {
        const courses = JSON.parse(localStorage.getItem('offline_courses') || '[]');
        setOfflineCourses(courses);
    };

    const checkStorage = async () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            setStorageUsed(estimate.usage || 0);
            setStorageQuota(estimate.quota || 0);
        }
    };

    const removeCourse = (courseId) => {
        const courses = offlineCourses.filter(c => c.id !== courseId);
        localStorage.setItem('offline_courses', JSON.stringify(courses));
        
        // Remove course data
        localStorage.removeItem(`course_${courseId}`);
        localStorage.removeItem(`course_progress_${courseId}`);
        
        setOfflineCourses(courses);
        checkStorage();
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const storagePercentage = storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0;

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            {isOnline ? (
                                <>
                                    <Wifi className="h-5 w-5 text-green-600" />
                                    <span>Online</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-5 w-5 text-orange-600" />
                                    <span>Offline</span>
                                </>
                            )}
                        </span>
                        <Badge variant={isOnline ? "default" : "secondary"}>
                            {isOnline ? "Connected" : "Disconnected"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                Storage Used
                            </span>
                            <span className="text-sm text-slate-600">
                                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
                            </span>
                        </div>
                        <Progress value={storagePercentage} className="h-2" />
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Downloaded Courses ({offlineCourses.length})</h4>
                        {offlineCourses.length === 0 ? (
                            <p className="text-sm text-slate-600">No courses downloaded for offline access</p>
                        ) : (
                            <div className="space-y-2">
                                {offlineCourses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{course.title}</p>
                                            <p className="text-xs text-slate-600">
                                                {course.lessonCount} lessons • Downloaded {new Date(course.downloadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCourse(course.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}