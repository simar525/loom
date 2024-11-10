import { FFmpeg } from '@ffmpeg/ffmpeg';

const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';
const YOUTUBE_VIDEO_URL = 'https://www.googleapis.com/youtube/v3/videos';

export async function uploadToYouTube(
  file: Blob,
  accessToken: string,
  title: string = 'Screen Recording',
  description: string = 'Recorded with Screen Recorder'
): Promise<string> {
  // First, get the file as an ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Initialize the upload
  const initResponse = await fetch(`${YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Length': fileBuffer.byteLength.toString(),
      'X-Upload-Content-Type': 'video/mp4',
    },
    body: JSON.stringify({
      snippet: {
        title,
        description,
        categoryId: '22', // People & Blogs category
      },
      status: {
        privacyStatus: 'private',
        selfDeclaredMadeForKids: false,
      },
    }),
  });

  if (!initResponse.ok) {
    throw new Error('Failed to initialize YouTube upload');
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('No upload URL received from YouTube');
  }

  // Perform the actual upload
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': fileBuffer.byteLength.toString(),
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload video to YouTube');
  }

  const videoData = await uploadResponse.json();
  return `https://youtube.com/watch?v=${videoData.id}`;
}