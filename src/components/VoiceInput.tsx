import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Languages, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscriptionComplete: (data: {
    originalText: string;
    translatedText: string;
    detectedLanguage: string;
    confidence: number;
  }) => void;
  targetLanguage?: string;
}

export const VoiceInput = ({ onTranscriptionComplete, targetLanguage = 'en' }: VoiceInputProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(targetLanguage);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'auto'; // Auto language detection

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening Started",
          description: "Speak clearly into your microphone",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onresult = async (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const confidence = event.results[current][0].confidence;
        
        setTranscript(transcript);
        setConfidence(confidence);

        // Detect language and translate if needed
        if (event.results[current].isFinal) {
          await translateText(transcript);
        }
      };
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setTranslatedText('');
      recognitionRef.current?.start();
    }
  };

  const translateText = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      // Using Google Cloud Translation API (you'll need to set up authentication)
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: selectedLanguage,
        }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setDetectedLanguage(data.detectedLanguage);

      onTranscriptionComplete({
        originalText: text,
        translatedText: data.translatedText,
        detectedLanguage: data.detectedLanguage,
        confidence,
      });

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Could not translate the text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playText = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Input
        </CardTitle>
        <CardDescription>
          Speak your complaint in any language
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Target Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center">
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Original Text */}
        {transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Original Text</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playText(transcript, detectedLanguage || 'auto')}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{transcript}</p>
              {detectedLanguage && (
                <p className="text-xs text-muted-foreground mt-1">
                  Detected Language: {languages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}
                  {confidence > 0 && ` (${(confidence * 100).toFixed(1)}% confidence)`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Translated Text */}
        {translatedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Translated Text</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playText(translatedText, selectedLanguage)}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{translatedText}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Translated to: {languages.find(l => l.code === selectedLanguage)?.name}
              </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 