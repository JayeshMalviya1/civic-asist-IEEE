import { NextApiRequest, NextApiResponse } from 'next';
import { TranslationServiceClient } from '@google-cloud/translate';

// Initialize the Translation client
const translationClient = new TranslationServiceClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
});

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'global';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Construct request for language detection
    const detectRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      content: text,
      mimeType: 'text/plain',
    };

    // Detect language
    const [detectResponse] = await translationClient.detectLanguage(detectRequest);
    const detectedLanguage = detectResponse.languages?.[0]?.languageCode || 'und';
    const confidence = detectResponse.languages?.[0]?.confidence || 0;

    // Skip translation if source and target languages are the same
    if (detectedLanguage === targetLanguage) {
      return res.status(200).json({
        translatedText: text,
        detectedLanguage,
        confidence,
      });
    }

    // Construct request for translation
    const translateRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: detectedLanguage,
      targetLanguageCode: targetLanguage,
    };

    // Translate text
    const [translateResponse] = await translationClient.translateText(translateRequest);
    const translatedText = translateResponse.translations?.[0]?.translatedText || text;

    return res.status(200).json({
      translatedText,
      detectedLanguage,
      confidence,
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: 'Translation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 