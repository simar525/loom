import React, { useState, useCallback, useRef } from 'react';
import { Video, Camera, Monitor, StopCircle, Pause, Play } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import VideoPreview from './VideoPreview';

type RecordingState = 'idle' | 'countdown' | 'requesting' | 'recording' | 'paused';
type RecordingType = 'screen' | 'camera' | 'tab';

const RecordingWidget = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingType, setRecordingType] = useState<RecordingType>('screen');
  const [error, setError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingRecordingType = useRef<RecordingType | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recordingState === 'recording') {
      mediaRecorder.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecordingState('idle');
    }
  }, [recordingState]);

  const handleDataAvailable = useCallback((event: BlobEvent) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  }, []);

  const handleStop = useCallback(() => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    setRecordedBlob(blob);
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async (type: RecordingType) => {
    pendingRecordingType.current = type;
    setRecordingState('countdown');
  }, []);

  const handleCountdownComplete = useCallback(async () => {
    if (!pendingRecordingType.current) return;
    
    try {
      setError(null);
      setRecordingState('requesting');
      setRecordingType(pendingRecordingType.current);

      let stream: MediaStream;
      const options = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      };

      if (pendingRecordingType.current === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ ...options });
      } else if (pendingRecordingType.current === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia(options);
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ ...options, preferCurrentTab: true });
      }

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 3000000 // 3 Mbps
      });
      
      recorder.ondataavailable = handleDataAvailable;
      recorder.onstop = handleStop;
      
      mediaRecorder.current = recorder;
      recorder.start();
      setRecordingState('recording');

      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setRecordingState('idle');
    }
  }, [handleDataAvailable, handleStop, stopRecording]);

  const togglePause = useCallback(() => {
    if (!mediaRecorder.current) return;

    if (recordingState === 'recording') {
      mediaRecorder.current.pause();
      setRecordingState('paused');
    } else if (recordingState === 'paused') {
      mediaRecorder.current.resume();
      setRecordingState('recording');
    }
  }, [recordingState]);

  const closePreview = useCallback(() => {
    setRecordedBlob(null);
  }, []);

  const isRecording = recordingState === 'recording' || recordingState === 'paused';

  return (
    <>
      {recordingState === 'countdown' && (
        <CountdownTimer duration={3} onComplete={handleCountdownComplete} />
      )}

      {recordedBlob && (
        <VideoPreview videoBlob={recordedBlob} onClose={closePreview} />
      )}

      <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg shadow-lg mb-4 max-w-xs">
            {error}
          </div>
        )}
        
        {isRecording && (
          <div className="flex space-x-2 bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={togglePause}
              className="p-2 rounded-full hover:bg-gray-100"
              title={recordingState === 'paused' ? 'Resume' : 'Pause'}
            >
              {recordingState === 'paused' ? (
                <Play className="w-6 h-6 text-green-600" />
              ) : (
                <Pause className="w-6 h-6 text-yellow-600" />
              )}
            </button>
            <button
              onClick={stopRecording}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Stop Recording"
            >
              <StopCircle className="w-6 h-6 text-red-600" />
            </button>
          </div>
        )}

        {!isRecording && recordingState !== 'countdown' && (
          <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
            <button
              onClick={() => startRecording('screen')}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Record Screen"
            >
              <Monitor className="w-6 h-6 text-indigo-600" />
            </button>
            <button
              onClick={() => startRecording('tab')}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Record Tab"
            >
              <Video className="w-6 h-6 text-purple-600" />
            </button>
            <button
              onClick={() => startRecording('camera')}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Record Camera"
            >
              <Camera className="w-6 h-6 text-pink-600" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RecordingWidget;