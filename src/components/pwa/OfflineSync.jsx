import React, { useState, useEffect } from "react";
import { RefreshCw, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

export default function OfflineSync() {
    const [pendingActions, setPendingActions] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        loadPendingActions();
        
        const handleOnline = () => {
            setIsOnline(true);
            // Auto-sync when coming back online
            syncPendingActions();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadPendingActions = () => {
        const actions = JSON.parse(localStorage.getItem('pending_sync') || '[]');
        setPendingActions(actions);
    };

    const syncPendingActions = async () => {
        if (!isOnline || pendingActions.length === 0) return;

        setIsSyncing(true);
        setSyncStatus(null);

        try {
            const actions = [...pendingActions];
            let successCount = 0;
            let failCount = 0;

            for (const action of actions) {
                try {
                    if (action.type === 'progress_update') {
                        await base44.entities.Enrollment.update(action.enrollmentId, {
                            progress: action.data.progress,
                            completion_percentage: action.data.completion_percentage
                        });
                    } else if (action.type === 'quiz_completion') {
                        await base44.entities.Enrollment.update(action.enrollmentId, {
                            progress: action.data.progress
                        });
                    } else if (action.type === 'review_submission') {
                        await base44.entities.CourseFeedback.create(action.data);
                    } else if (action.type === 'discussion_post') {
                        await base44.entities.CourseDiscussion.create(action.data);
                    }
                    successCount++;
                } catch (error) {
                    console.error('Sync error for action:', action, error);
                    failCount++;
                }
            }

            // Clear synced actions
            if (successCount > 0) {
                const remainingActions = pendingActions.slice(successCount);
                localStorage.setItem('pending_sync', JSON.stringify(remainingActions));
                setPendingActions(remainingActions);
            }

            setSyncStatus({
                success: successCount,
                failed: failCount,
                message: `Synced ${successCount} action(s)${failCount > 0 ? `, ${failCount} failed` : ''}`
            });
        } catch (error) {
            console.error('Sync error:', error);
            setSyncStatus({
                success: 0,
                failed: pendingActions.length,
                message: 'Sync failed. Please try again.'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isOnline && pendingActions.length === 0) return null;

    return (
        <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Background Sync
                    </span>
                    {pendingActions.length > 0 && (
                        <Badge variant="secondary">{pendingActions.length} pending</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isOnline && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                            You're offline. Changes will sync automatically when you reconnect.
                        </p>
                    </div>
                )}

                {pendingActions.length > 0 && (
                    <div>
                        <p className="text-sm text-slate-600 mb-2">
                            Actions waiting to sync:
                        </p>
                        <ul className="space-y-1">
                            {pendingActions.slice(0, 5).map((action, idx) => (
                                <li key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                                    <Upload className="h-3 w-3 text-blue-600" />
                                    {action.description || `${action.type} (${new Date(action.timestamp).toLocaleTimeString()})`}
                                </li>
                            ))}
                            {pendingActions.length > 5 && (
                                <li className="text-xs text-slate-500">
                                    ... and {pendingActions.length - 5} more
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {syncStatus && (
                    <div className={`p-3 rounded-lg border ${
                        syncStatus.failed > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {syncStatus.failed > 0 ? (
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <p className={`text-sm ${
                                syncStatus.failed > 0 ? 'text-orange-800' : 'text-green-800'
                            }`}>
                                {syncStatus.message}
                            </p>
                        </div>
                    </div>
                )}

                {isOnline && pendingActions.length > 0 && (
                    <Button
                        onClick={syncPendingActions}
                        disabled={isSyncing}
                        className="w-full"
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Sync Now
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}