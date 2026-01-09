import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Package, FileJson, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LmsExportPanel({ course }) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState(null);

    const handleScormExport = async () => {
        setIsExporting(true);
        setExportType('scorm');
        
        try {
            const response = await base44.functions.invoke('exportScorm', { 
                courseId: course.id 
            });
            
            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${course.title.replace(/[^a-z0-9]/gi, '_')}_scorm.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast.success('SCORM package exported successfully');
        } catch (error) {
            console.error('SCORM export error:', error);
            toast.error('Failed to export SCORM package');
        } finally {
            setIsExporting(false);
            setExportType(null);
        }
    };

    const handleXapiExport = async () => {
        setIsExporting(true);
        setExportType('xapi');
        
        try {
            const response = await base44.functions.invoke('exportXapi', { 
                courseId: course.id 
            });
            
            // Download as JSON
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
                type: 'application/json' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${course.title.replace(/[^a-z0-9]/gi, '_')}_xapi.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast.success('xAPI metadata exported successfully');
        } catch (error) {
            console.error('xAPI export error:', error);
            toast.error('Failed to export xAPI metadata');
        } finally {
            setIsExporting(false);
            setExportType(null);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">SCORM 1.2 Export</CardTitle>
                    </div>
                    <CardDescription>
                        Export course as SCORM 1.2 package for LMS compatibility (Moodle, Canvas, Blackboard, etc.)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-semibold mb-1">Includes:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• imsmanifest.xml metadata</li>
                                        <li>• All lesson content as HTML</li>
                                        <li>• Progress tracking support</li>
                                        <li>• LMS-compatible structure</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Button 
                            onClick={handleScormExport} 
                            disabled={isExporting}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isExporting && exportType === 'scorm' ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating Package...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export SCORM Package
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <FileJson className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">xAPI Export</CardTitle>
                    </div>
                    <CardDescription>
                        Export course metadata as xAPI (Tin Can) format for Learning Record Stores (LRS)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5" />
                                <div className="text-sm text-purple-900">
                                    <p className="font-semibold mb-1">Includes:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Course activity definition</li>
                                        <li>• Lesson structure metadata</li>
                                        <li>• Sample xAPI statements</li>
                                        <li>• LRS integration guide</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Button 
                            onClick={handleXapiExport} 
                            disabled={isExporting}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {isExporting && exportType === 'xapi' ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating Metadata...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export xAPI Metadata
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2 border-2 border-amber-100">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-lg">Integration Notes</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-slate-700">
                        <div>
                            <p className="font-semibold mb-1">SCORM 1.2:</p>
                            <p>Upload the .zip file to your LMS. The package is compatible with Moodle, Canvas, Blackboard, TalentLMS, and most modern LMS platforms.</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">xAPI:</p>
                            <p>Configure your Learning Record Store (LRS) to receive statements from Base44. Use the provided metadata to map course activities.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="font-semibold mb-1">Need help?</p>
                            <p className="text-xs">Contact enterprise support for assistance with LMS integration and custom export formats.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}