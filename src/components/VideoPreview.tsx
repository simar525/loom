import React, { useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { uploadVideo } from '../utils/videoUpload';

interface VideoPreviewProps {
  videoBlob: Blob;
  onClose: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoBlob, onClose }) => {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  React.useEffect(() => {
    const uploadVideoFile = async () => {
      try {
        setError(null);
        setUploadProgress(25);
        const videoLink = await uploadVideo(videoBlob);
        setUploadProgress(100);
        setPublicUrl(videoLink);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload video');
        console.error('Upload error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    uploadVideoFile();
  }, [videoBlob]);

  const handleDownload = async () => {
    try {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download video. Please try again.');
      console.error('Download error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recording Preview</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            className="w-full rounded-lg"
            autoPlay
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mt-4 flex flex-col space-y-4">
            {isProcessing && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-gray-600">
                  Generating a public link...
                </p>
              </>
            )}
            
            {publicUrl && (
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 bg-transparent outline-none"
                />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Open
                </a>
              </div>
            )}
            
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Download Recording</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;