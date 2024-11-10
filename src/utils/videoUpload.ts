export async function uploadVideo(videoBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', videoBlob, `recording-${Date.now()}.webm`);

    const response = await fetch('https://hook.integrator.boost.space/zzgnhkw6d2s43fwaajt7h51fmnskwkb1', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    const result = await response.json();
    return result.url || '';
  } catch (error) {
    console.error('Upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload video');
  }
}