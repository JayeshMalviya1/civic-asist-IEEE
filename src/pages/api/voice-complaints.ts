import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { voiceComplaintService } from '@/server/voiceComplaintService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const audioFile = files.audio as formidable.File;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const targetLanguage = fields.targetLanguage as string || 'en';
    const metadata = {
      deviceInfo: fields.deviceInfo as string,
      browserInfo: fields.browserInfo as string,
    };

    // Read the audio file
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const readStream = require('fs').createReadStream(audioFile.filepath);
      
      readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      readStream.on('error', (err: Error) => reject(err));
      readStream.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Process the voice complaint
    const complaint = await voiceComplaintService.processVoiceComplaint(
      audioBuffer,
      targetLanguage,
      metadata
    );

    // Clean up the temporary file
    require('fs').unlink(audioFile.filepath, (err: Error) => {
      if (err) console.error('Error deleting temporary file:', err);
    });

    return res.status(200).json(complaint);

  } catch (error) {
    console.error('Voice complaint processing error:', error);
    return res.status(500).json({
      error: 'Failed to process voice complaint',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 