import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
    Smartphone, 
    Bell, 
    Download, 
    Wifi, 
    HardDrive,
    CheckCircle,
    AlertCircle
} from "lucide-react";

export default function PWASettings() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [autoSync, setAutoSync] = useState(true);
    const [autoDownload, setAutoDownload] = useState(false);

    useEffect(() => {
        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check notification permission
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }

        // Load settings
        const settings = JSON.parse(localStorage.getItem('pwa_settings') || '{}');
        setAutoSync(settings.autoSync !== false);
        setAutoDownload(settings.autoDownload === true);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsInstallable(false);
        }
        setDeferredPrompt(null);
    };

    const requestNotifications = async () => {
        if (!('Notification' in window)) {
            alert('Notifications are not supported in your browser');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');

        if (permission === 'granted') {
            new Notification('Notifications Enabled!', {
                body: 'You\'ll now receive updates about your courses',
                icon: '/logo.png'
            });
        }
    };

    const updateSetting = (key, value) => {
        const settings = JSON.parse(localStorage.getItem('pwa_settings') || '{}');
        settings[key] = value;
        localStorage.setItem('pwa_settings', JSON.stringify(settings));
    };

    const handleAutoSyncToggle = (checked) => {
        setAutoSync(checked);
        updateSetting('autoSync', checked);
    };

    const handleAutoDownloadToggle = (checked) => {
        setAutoDownload(checked);
        updateSetting('autoDownload', checked);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">PWA Settings</h1>
                    <p className="text-slate-600">
                        Configure app installation and offline features
                    </p>
                </div>

                <div className="space-y-4">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-purple-600" />
                                App Installation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isInstalled ? (
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-900">App Installed</p>
                                        <p className="text-sm text-green-700">
                                            You're using the installed version of the app
                                        </p>
                                    </div>
                                </div>
                            ) : isInstallable ? (
                                <div>
                                    <p className="text-sm text-slate-600 mb-3">
                                        Install this app on your device for a better experience with offline access and faster loading.
                                    </p>
                                    <Button onClick={installApp} className="w-full bg-purple-600 hover:bg-purple-700">
                                        <Download className="h-4 w-4 mr-2" />
                                        Install App
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-slate-600" />
                                    <p className="text-sm text-slate-600">
                                        App installation is not available in this browser
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Push Notifications</p>
                                    <p className="text-sm text-slate-600">
                                        Get notified about course updates and deadlines
                                    </p>
                                </div>
                                {notificationsEnabled ? (
                                    <Badge className="bg-green-600">Enabled</Badge>
                                ) : (
                                    <Button onClick={requestNotifications} size="sm">
                                        Enable
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wifi className="h-5 w-5 text-green-600" />
                                Offline Sync Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Auto-Sync</p>
                                    <p className="text-sm text-slate-600">
                                        Automatically sync data when online
                                    </p>
                                </div>
                                <Switch
                                    checked={autoSync}
                                    onCheckedChange={handleAutoSyncToggle}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Auto-Download Enrolled Courses</p>
                                    <p className="text-sm text-slate-600">
                                        Automatically download courses for offline access
                                    </p>
                                </div>
                                <Switch
                                    checked={autoDownload}
                                    onCheckedChange={handleAutoDownloadToggle}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-orange-600" />
                                Storage Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-3">
                                Manage your offline courses and cached data in the Offline Learning section.
                            </p>
                            <Button variant="outline" className="w-full">
                                Manage Offline Content
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}