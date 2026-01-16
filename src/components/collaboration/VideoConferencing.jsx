/**
 * VideoConferencing Component
 * 
 * Embeds Daily.co video conferencing interface
 * Handles participant management, screen sharing, recording
 * 
 * @component
 * @param {string} roomToken - Daily.co meeting token
 * @param {string} roomName - Room identifier
 * @param {Object} options - Configuration options
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Share2, Loader2, Volume2, Monitor } from 'lucide-react';

export default function VideoConferencing({ roomToken, roomName, isOwner = false, options = {} }) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load Daily.co library
    const script = document.createElement('script');
    script.src = 'https://cdn.daily.co/daily-js/daily-1.24.0.js';
    script.async = true;
    script.onload = initializeRoom;
    script.onerror = () => setError('Failed to load video conferencing library');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeRoom = async () => {
    try {
      if (!window.DailyIframe) {
        setError('Daily.co library failed to load');
        return;
      }

      const callFrame = window.DailyIframe.createFrame({
        iframeStyle: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        },
        showLeaveButton: isOwner,
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%'
        }
      });

      // Join room
      await callFrame.join({
        url: `https://flashfusion.daily.co/${roomName}`,
        token: roomToken,
        userName: options.userName || 'Participant'
      });

      // Handle recording events
      if (isOwner) {
        callFrame.on('recording-started', () => setIsRecording(true));
        callFrame.on('recording-stopped', () => setIsRecording(false));
        callFrame.on('recording-error', (error) => console.error('Recording error:', error));
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize video room:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    try {
      if (!window.DailyIframe?.callInstance) return;
      
      if (isRecording) {
        await window.DailyIframe.callInstance.stopRecording();
      } else {
        await window.DailyIframe.callInstance.startRecording();
      }
    } catch (err) {
      console.error('Recording control error:', err);
    }
  };

  if (error) {
    return (
      <Card className="card-glow">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">❌ {error}</p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Session</CardTitle>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              onClick={toggleRecording}
              className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'btn-primary'}
              size="sm"
            >
              {isRecording ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Recording
                </>
              ) : (
                'Start Recording'
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-gray-300">Connecting...</p>
              </div>
            </div>
          )}
          <div ref={iframeRef} id="daily-frame" style={{ width: '100%', height: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
}