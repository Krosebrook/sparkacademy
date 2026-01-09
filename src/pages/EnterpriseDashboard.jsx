import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
    Building2, Key, Users, BarChart3, Download, Copy, 
    CheckCircle2, AlertCircle, Code, Book
} from "lucide-react";
import { toast } from "sonner";

export default function EnterpriseDashboard() {
    const [user, setUser] = useState(null);
    const [apiKey, setApiKey] = useState('••••••••••••••••');
    const [showApiKey, setShowApiKey] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        activeEnrollments: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            if (userData.role !== 'admin') {
                toast.error('Access denied: Admin privileges required');
                return;
            }

            // Load stats
            const courses = await base44.entities.Course.list();
            const enrollments = await base44.entities.Enrollment.list();
            
            setStats({
                totalUsers: enrollments.length,
                totalCourses: courses.length,
                activeEnrollments: enrollments.filter(e => e.completion_percentage < 100).length
            });
        } catch (error) {
            console.error('Error loading enterprise dashboard:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const generateApiKey = () => {
        const newKey = 'ent_' + Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
        setApiKey(newKey);
        setShowApiKey(true);
        toast.success('API key generated (store this securely)');
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p className="text-slate-600">Enterprise dashboard requires admin privileges.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-slate-900">Enterprise Dashboard</h1>
                    </div>
                    <p className="text-slate-600">LMS Integration & API Management</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Users</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                                </div>
                                <Users className="h-10 w-10 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Courses</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.totalCourses}</p>
                                </div>
                                <Book className="h-10 w-10 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Active Enrollments</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.activeEnrollments}</p>
                                </div>
                                <BarChart3 className="h-10 w-10 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="api" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="api">
                            <Key className="h-4 w-4 mr-2" />
                            API Configuration
                        </TabsTrigger>
                        <TabsTrigger value="endpoints">
                            <Code className="h-4 w-4 mr-2" />
                            API Endpoints
                        </TabsTrigger>
                        <TabsTrigger value="export">
                            <Download className="h-4 w-4 mr-2" />
                            SCORM/xAPI
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="api">
                        <Card>
                            <CardHeader>
                                <CardTitle>API Key Management</CardTitle>
                                <CardDescription>
                                    Secure API key for enterprise integrations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div className="text-sm text-amber-900">
                                            <p className="font-semibold mb-1">Security Notice</p>
                                            <p>Store your API key securely. It provides full access to user provisioning and progress tracking APIs.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Your API Key</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type={showApiKey ? "text" : "password"}
                                            value={apiKey}
                                            readOnly
                                            className="font-mono"
                                        />
                                        <Button 
                                            variant="outline"
                                            onClick={() => copyToClipboard(apiKey)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            variant="outline"
                                        >
                                            {showApiKey ? 'Hide' : 'Show'}
                                        </Button>
                                    </div>
                                </div>

                                <Button onClick={generateApiKey} className="w-full">
                                    <Key className="h-4 w-4 mr-2" />
                                    Generate New API Key
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="endpoints">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>User Provisioning API</CardTitle>
                                        <Badge>POST</Badge>
                                    </div>
                                    <CardDescription>
                                        Bulk invite users to the platform
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                                        <code className="text-sm">
                                            POST /functions/enterpriseProvisionUsers
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Headers:</p>
                                        <div className="bg-slate-50 p-3 rounded text-sm font-mono">
                                            X-API-Key: your_api_key
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Request Body:</p>
                                        <pre className="bg-slate-50 p-3 rounded text-xs overflow-x-auto">
{`{
  "organization_id": "your_org_id",
  "users": [
    {
      "email": "user@company.com",
      "full_name": "John Doe",
      "role": "user"
    }
  ]
}`}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Progress Tracking API</CardTitle>
                                        <Badge variant="outline">GET</Badge>
                                    </div>
                                    <CardDescription>
                                        Retrieve student progress and completion data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                                        <code className="text-sm">
                                            GET /functions/enterpriseGetProgress?user_email=...
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Query Parameters:</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <Badge variant="outline" className="mt-0.5">user_email</Badge>
                                                <span className="text-slate-600">Filter by student email</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Badge variant="outline" className="mt-0.5">course_id</Badge>
                                                <span className="text-slate-600">Filter by course ID</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Badge variant="outline" className="mt-0.5">organization_id</Badge>
                                                <span className="text-slate-600">Filter by organization</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Response:</p>
                                        <pre className="bg-slate-50 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "data": [
    {
      "user": { "email": "...", "full_name": "..." },
      "course": { "id": "...", "title": "..." },
      "progress": {
        "completion_percentage": 65,
        "completed_lessons": 8,
        "total_lessons": 12
      }
    }
  ]
}`}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="export">
                        <Card>
                            <CardHeader>
                                <CardTitle>SCORM & xAPI Export</CardTitle>
                                <CardDescription>
                                    Export capabilities are available on individual course pages. Visit any course and look for the "LMS Export" section in the course overview.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-blue-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-blue-900 mb-2">Export Features Available:</p>
                                            <ul className="space-y-2 text-sm text-blue-800">
                                                <li>• <strong>SCORM 1.2:</strong> Full course packages with progress tracking</li>
                                                <li>• <strong>xAPI (Tin Can):</strong> Activity metadata for Learning Record Stores</li>
                                                <li>• <strong>Compatible with:</strong> Moodle, Canvas, Blackboard, TalentLMS, and more</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}