import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // You'll need to replace this with your actual client ID

export async function uploadToGoogleDrive(file: Blob, fileName: string, accessToken: string): Promise<string> {
  // Create file metadata
  const metadata = {
    name: fileName,
    mimeType: 'video/mp4',
  };

  // Create multipart request body
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  // Upload to Google Drive
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error('Failed to upload to Google Drive');
  }

  const result = await response.json();
  
  // Make the file publicly accessible
  await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  // Get the sharing link
  const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const shareResult = await shareResponse.json();
  return shareResult.webViewLink;
}