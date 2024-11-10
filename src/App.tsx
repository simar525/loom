import React from 'react';
import { Monitor, Video, Camera } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import RecordingWidget from './components/RecordingWidget';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Screen Recorder</h1>
            <p className="text-lg text-gray-600">
              Record your screen, browser tab, or camera with just a few clicks
            </p>
          </header>

          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Full Screen Recording</h3>
                  <p className="text-gray-600">Capture your entire screen with system audio</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browser Tab Recording</h3>
                  <p className="text-gray-600">Record specific browser tabs with audio</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Camera Recording</h3>
                  <p className="text-gray-600">Record yourself with your webcam and microphone</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecordingWidget />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;