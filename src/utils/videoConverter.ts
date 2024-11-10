import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

export async function convertToMp4(webmBlob: Blob): Promise<Blob> {
  const ffmpeg = await initFFmpeg();
  
  // Write the input WebM file
  await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
  
  // Run the conversion
  await ffmpeg.exec([
    '-i', 'input.webm',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-c:a', 'aac',
    'output.mp4'
  ]);
  
  // Read the output file
  const data = await ffmpeg.readFile('output.mp4');
  
  // Clean up
  await ffmpeg.deleteFile('input.webm');
  await ffmpeg.deleteFile('output.mp4');
  
  // Convert Uint8Array to Blob
  return new Blob([data], { type: 'video/mp4' });
}