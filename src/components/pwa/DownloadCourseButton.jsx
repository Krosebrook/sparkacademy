import React, { useState, useEffect } from "react";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function DownloadCourseButton({ courseId, courseTitle, size = "default" }) {
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        checkIfDownloaded();
    }, [courseId]);

    const checkIfDownloaded = () => {
        const offlineCourses = JSON.parse(localStorage.getItem('offline_courses') || '[]');
        const downloaded = offlineCourses.some(c => c.id === courseId);
        setIsDownloaded(downloaded);
    };

    const downloadCourse = async () => {
        setIsDownloading(true);
        setProgress(0);

        try {
            // Fetch course data
            const course = await base44.entities.Course.get(courseId);
            setProgress(20);

            // Fetch enrollment data
            const user = await base44.auth.me();
            const enrollments = await base44.entities.Enrollment.filter({
                student_email: user.email,
                course_id: courseId
            });
            setProgress(40);

            // Store course data in localStorage
            localStorage.setItem(`course_${courseId}`, JSON.stringify(course));
            setProgress(60);

            if (enrollments.length > 0) {
                localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(enrollments[0]));
            }
            setProgress(80);

            // Add to offline courses list
            const offlineCourses = JSON.parse(localStorage.getItem('offline_courses') || '[]');
            if (!offlineCourses.some(c => c.id === courseId)) {
                offlineCourses.push({
                    id: courseId,
                    title: courseTitle || course.title,
                    lessonCount: course.lessons?.length || 0,
                    downloadedAt: new Date().toISOString()
                });
                localStorage.setItem('offline_courses', JSON.stringify(offlineCourses));
            }
            setProgress(100);

            setIsDownloaded(true);
            alert('Course downloaded successfully for offline access!');
        } catch (error) {
            console.error('Error downloading course:', error);
            alert('Failed to download course. Please try again.');
        } finally {
            setIsDownloading(false);
            setProgress(0);
        }
    };

    const removeCourse = () => {
        const offlineCourses = JSON.parse(localStorage.getItem('offline_courses') || '[]');
        const updated = offlineCourses.filter(c => c.id !== courseId);
        localStorage.setItem('offline_courses', JSON.stringify(updated));
        
        localStorage.removeItem(`course_${courseId}`);
        localStorage.removeItem(`course_progress_${courseId}`);
        
        setIsDownloaded(false);
        alert('Course removed from offline storage');
    };

    if (isDownloading) {
        return (
            <Button disabled size={size} variant="outline">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading... {progress}%
            </Button>
        );
    }

    if (isDownloaded) {
        return (
            <Button onClick={removeCourse} size={size} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Downloaded
            </Button>
        );
    }

    return (
        <Button onClick={downloadCourse} size={size} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
        </Button>
    );
}