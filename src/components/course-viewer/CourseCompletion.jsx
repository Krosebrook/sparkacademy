import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share2, Linkedin, Trophy, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CourseRecommendations from '../dashboard/CourseRecommendations';

export default function CourseCompletion({ course, enrollment }) {
  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState(null);

  const completionDate = new Date(enrollment.updated_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    loadUser();
    checkCertificate();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const checkCertificate = async () => {
    try {
      const certs = await base44.entities.Certificate.filter({
        course_id: course.id,
        student_email: (await base44.auth.me()).email
      });
      if (certs.length > 0) setCertificate(certs[0]);
    } catch (error) {
      console.error('Error checking certificate:', error);
    }
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      const { data } = await base44.functions.invoke('generateCourseCertificate', {
        course_id: course.id,
        student_email: user.email
      });
      setCertificate(data.certificate);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnLinkedIn = () => {
    const text = `I just completed "${course.title}" on CourseSpark! 🎓`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Course Completion',
          text: `I just completed "${course.title}"!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Congratulations!</h1>
            <p className="text-lg text-slate-600">You've completed the course</p>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{course.title}</h2>
            <p className="text-slate-600 mb-4">Completed on {completionDate}</p>
            
            {enrollment.completion_percentage && (
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-slate-700">
                  Final Score: {enrollment.completion_percentage}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <Badge className="bg-emerald-100 text-emerald-700 px-4 py-2 text-sm">
              <Award className="w-4 h-4 mr-2" />
              Certificate Available
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
              <Star className="w-4 h-4 mr-2" />
              Course Completed
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            {certificate ? (
              <Button
                onClick={() => window.open(certificate.certificate_url, '_blank')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Download className="w-4 h-4 mr-2" />
                View Certificate
              </Button>
            ) : (
              <Button
                onClick={generateCertificate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Award className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Certificate'}
              </Button>
            )}
            
            <Button
              onClick={shareOnLinkedIn}
              variant="outline"
              className="border-[#0077b5] text-[#0077b5] hover:bg-[#0077b5] hover:text-white"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Share on LinkedIn
            </Button>

            {navigator.share && (
              <Button onClick={shareCertificate} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
          </div>

          {certificate && (
            <p className="text-xs text-slate-500">
              Verification Code: <span className="font-mono">{certificate.verification_code}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {user && <CourseRecommendations userEmail={user.email} />}
    </div>
  );
}