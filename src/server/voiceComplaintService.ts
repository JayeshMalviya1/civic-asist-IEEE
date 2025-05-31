import { TranslationServiceClient } from '@google-cloud/translate';
import { SpeechClient, protos } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';

interface VoiceComplaint {
  id: string;
  audioUrl?: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  category: string;
  priority: string;
  location?: string;
  timestamp: Date;
  metadata: {
    deviceInfo?: string;
    browserInfo?: string;
    audioQuality?: number;
    noiseLevel?: number;
    duration?: number;
  };
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  languageCode: string;
  words?: Array<{
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
}

class VoiceComplaintService {
  private translationClient: TranslationServiceClient;
  private speechClient: SpeechClient;
  private storage: Storage;
  private bucketName: string;

  constructor() {
    // Initialize Google Cloud clients
    this.translationClient = new TranslationServiceClient({
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
    });
    
    this.speechClient = new SpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
    });
    
    this.storage = new Storage({
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
    });

    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'voice-complaints';
  }

  async processVoiceComplaint(
    audioBuffer: Buffer,
    targetLanguage: string,
    metadata: VoiceComplaint['metadata'],
    userId?: string
  ): Promise<VoiceComplaint> {
    const complaintId = uuidv4();
    
    // Upload audio file to Cloud Storage
    const audioUrl = await this.uploadAudio(audioBuffer, complaintId);
    
    // Transcribe audio
    const transcriptionResult = await this.transcribeAudio(audioBuffer);
    
    // Translate if needed
    const translationResult = await this.translateText(
      transcriptionResult.text,
      transcriptionResult.languageCode,
      targetLanguage
    );

    // Analyze content for categorization
    const category = await this.analyzeContent(transcriptionResult.text);
    
    // Determine priority based on content and metadata
    const priority = await this.determinePriority(
      transcriptionResult.text,
      category,
      metadata
    );

    // Create complaint in database
    const complaint = await db.createVoiceComplaint({
      audioUrl,
      originalText: transcriptionResult.text,
      translatedText: translationResult.translatedText,
      sourceLanguage: transcriptionResult.languageCode,
      targetLanguage,
      confidence: transcriptionResult.confidence,
      category,
      priority,
      metadata: {
        ...metadata,
        audioQuality: await this.analyzeAudioQuality(audioBuffer),
        noiseLevel: await this.detectNoiseLevel(audioBuffer),
        duration: await this.getAudioDuration(audioBuffer),
      }
    }, userId);

    return complaint;
  }

  private async uploadAudio(audioBuffer: Buffer, complaintId: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(`complaints/${complaintId}.wav`);
    
    await blob.save(audioBuffer, {
      metadata: {
        contentType: 'audio/wav',
      },
    });

    return `https://storage.googleapis.com/${this.bucketName}/complaints/${complaintId}.wav`;
  }

  private async transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode: 'auto',
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
      useEnhanced: true,
      model: 'latest_long',
    };

    const request = {
      audio,
      config,
    };

    const [response] = await this.speechClient.recognize(request);
    const transcription = response.results?.[0]?.alternatives?.[0];

    if (!transcription) {
      throw new Error('Transcription failed');
    }

    return {
      text: transcription.transcript || '',
      confidence: transcription.confidence || 0,
      languageCode: response.results?.[0]?.languageCode || 'und',
      words: transcription.words?.map(word => ({
        word: word.word || '',
        startTime: Number(word.startTime?.seconds || 0),
        endTime: Number(word.endTime?.seconds || 0),
        confidence: word.confidence || 0,
      })),
    };
  }

  private async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ translatedText: string }> {
    if (sourceLanguage === targetLanguage) {
      return { translatedText: text };
    }

    const request = {
      parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    };

    const [response] = await this.translationClient.translateText(request);
    return {
      translatedText: response.translations?.[0]?.translatedText || text,
    };
  }

  private async analyzeContent(text: string): Promise<string> {
    // Implement content analysis using Natural Language Processing
    const categories = {
      infrastructure: ['road', 'bridge', 'building', 'construction', 'repair'],
      sanitation: ['garbage', 'waste', 'trash', 'cleaning', 'sewage'],
      safety: ['crime', 'accident', 'emergency', 'danger', 'unsafe'],
      utilities: ['water', 'electricity', 'power', 'gas', 'outage'],
      noise: ['loud', 'noise', 'disturbance', 'sound', 'quiet'],
      environment: ['pollution', 'tree', 'park', 'green', 'environmental'],
    };

    const textLower = text.toLowerCase();
    let maxCategory = 'other';
    let maxCount = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const count = keywords.reduce((acc, keyword) => 
        acc + (textLower.split(keyword).length - 1), 0
      );
      
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    }

    return maxCategory;
  }

  private async determinePriority(
    text: string,
    category: string,
    metadata: VoiceComplaint['metadata']
  ): Promise<string> {
    const urgentKeywords = ['emergency', 'immediate', 'danger', 'urgent', 'critical'];
    const textLower = text.toLowerCase();
    
    // Check for urgent keywords
    const hasUrgentKeywords = urgentKeywords.some(keyword => textLower.includes(keyword));
    
    // Consider category-based priority
    const categoryPriority = {
      safety: 3,
      utilities: 2,
      infrastructure: 2,
      sanitation: 1,
      noise: 1,
      environment: 1,
      other: 1,
    }[category] || 1;

    // Calculate final priority score
    let priorityScore = categoryPriority;
    if (hasUrgentKeywords) priorityScore += 2;
    if (metadata.noiseLevel && metadata.noiseLevel > 0.8) priorityScore += 1;

    // Map score to priority levels
    if (priorityScore >= 4) return 'Urgent';
    if (priorityScore === 3) return 'High';
    if (priorityScore === 2) return 'Medium';
    return 'Low';
  }

  private async analyzeAudioQuality(audioBuffer: Buffer): Promise<number> {
    // Implement audio quality analysis
    // This is a placeholder - implement actual audio quality analysis
    return 0.9;
  }

  private async detectNoiseLevel(audioBuffer: Buffer): Promise<number> {
    // Implement noise level detection
    // This is a placeholder - implement actual noise level detection
    return 0.2;
  }

  private async getAudioDuration(audioBuffer: Buffer): Promise<number> {
    // Implement audio duration calculation
    // This is a placeholder - implement actual duration calculation
    return 30; // seconds
  }
}

export const voiceComplaintService = new VoiceComplaintService(); 