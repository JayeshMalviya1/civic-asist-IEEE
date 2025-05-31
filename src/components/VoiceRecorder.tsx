import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Languages, MapPin, Clock, Waveform, AlertTriangle } from 'lucide-react';
import { categorizeComplaint, getPriorityLevel, formatComplaintForSubmission, analyzeSentiment } from '@/utils/complaintUtils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceRecorderProps {
  onComplaintSubmit: (complaint: any) => void;
}

export const VoiceRecorder = ({ onComplaintSubmit }: VoiceRecorderProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [sentiment, setSentiment] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Language options for translation
  const languageOptions = [
    { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇧🇩' },
    { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu (اردو)', flag: '🇵🇰' }
  ];

  // Initialize audio context for visualizer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Update analysis when transcript changes
  useEffect(() => {
    if (transcript) {
      const detectedCategory = categorizeComplaint(transcript);
      const detectedPriority = getPriorityLevel(transcript);
      const sentimentAnalysis = analyzeSentiment(transcript);
      
      setCategory(detectedCategory);
      setPriority(detectedPriority);
      setSentiment(sentimentAnalysis);
    }
  }, [transcript]);

  // Handle recording duration
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isListening]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced audio processing
  const processAudio = (stream: MediaStream) => {
    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;
    
    if (!audioContext || !analyser) return;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      if (!isListening) return;

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
      setAudioLevel(Math.min(100, (average / 256) * 100));

      // Calculate noise level (higher frequencies)
      const highFreqAvg = dataArray.slice(bufferLength / 2).reduce((acc, value) => acc + value, 0) / (bufferLength / 2);
      setNoiseLevel(Math.min(100, (highFreqAvg / 256) * 100));

      requestAnimationFrame(updateLevels);
    };

    updateLevels();
  };

  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try typing your complaint instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get audio stream for visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      processAudio(stream);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast({
          title: "🎤 Listening...",
          description: "Speak clearly about your civic complaint. Mention location, issue details, and urgency level."
        });
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            currentInterim += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
        setInterimTranscript(currentInterim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "There was an issue with speech recognition. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to record your complaint.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        setIsGettingLocation(false);
        toast({
          title: "📍 Location Added",
          description: "Your location has been attached to the complaint"
        });
      },
      (error) => {
        console.error('Location error:', error);
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Unable to get your location. You can manually specify it in the complaint.",
          variant: "destructive"
        });
      }
    );
  };

  // Enhanced translation function using MyMemory API (free translation service)
  const translateText = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No Text to Translate",
        description: "Please record your complaint first",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    console.log(`Translating text to ${selectedLanguage}:`, transcript);

    try {
      // Using MyMemory API - free translation service
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript)}&langpair=en|${selectedLanguage}`
      );
      
      if (!response.ok) {
        throw new Error('Translation service unavailable');
      }
      
      const data = await response.json();
      console.log('Translation response:', data);
      
      if (data.responseData && data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText);
        toast({
          title: "✅ Translation Complete",
          description: `Your complaint has been translated to ${languageOptions.find(lang => lang.code === selectedLanguage)?.name}`
        });
      } else {
        throw new Error('Invalid translation response');
      }
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to Google Translate API
      try {
        const googleResponse = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(transcript)}`
        );
        
        const googleData = await googleResponse.json();
        if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
          setTranslatedText(googleData[0][0][0]);
          toast({
            title: "✅ Translation Complete",
            description: `Your complaint has been translated to ${languageOptions.find(lang => lang.code === selectedLanguage)?.name}`
          });
        } else {
          throw new Error('Google Translate failed');
        }
      } catch (fallbackError) {
        console.error('Fallback translation failed:', fallbackError);
        toast({
          title: "Translation Failed",
          description: "Translation service is currently unavailable. Please try again later.",
          variant: "destructive"
        });
        
        // Basic fallback for Hindi only
        if (selectedLanguage === 'hi') {
          const basicHindi = `शिकायत: ${transcript}`;
          setTranslatedText(basicHindi);
          toast({
            title: "Basic Translation Applied",
            description: "Using basic Hindi translation as fallback"
          });
        }
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const submitComplaint = () => {
    if (!transcript.trim()) {
      toast({
        title: "Empty Complaint",
        description: "Please record or type your complaint first",
        variant: "destructive"
      });
      return;
    }

    const complaint = {
      originalText: transcript,
      translatedText: translatedText || '',
      category,
      language: selectedLanguage,
      method: 'voice',
      location: location || 'Not specified'
    };

    const formattedComplaint = formatComplaintForSubmission(complaint);
    onComplaintSubmit(formattedComplaint);
    
    // Reset form
    setTranscript('');
    setTranslatedText('');
    setCategory('');
    setPriority('');
    setLocation('');
    
    toast({
      title: "🎉 Complaint Submitted Successfully!",
      description: `Complaint ID: ${formattedComplaint.id}. You can track its status in "My Complaints" tab.`
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">🎤 Voice Complaint Recorder</h2>
        <p className="text-gray-600 text-lg">Press the microphone button and speak your civic complaint clearly. Include location details and describe the issue thoroughly.</p>
      </div>

      {/* Enhanced Recording Controls */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative p-8 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
            }`}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? <MicOff size={40} /> : <Mic size={40} />}
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25"></div>
            )}
          </button>

          <button
            onClick={getLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg"
            aria-label="Get current location"
          >
            <MapPin size={20} />
            {isGettingLocation ? 'Getting...' : 'Add Location'}
          </button>
        </div>

        {/* Audio Visualization */}
        {isListening && (
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Audio Level</span>
              <span>{Math.round(audioLevel)}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Background Noise</span>
              <span>{Math.round(noiseLevel)}%</span>
            </div>
            <Progress value={noiseLevel} className="h-2" />
          </div>
        )}

        {/* Recording Status */}
        <div className="text-center">
          {isListening ? (
            <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <Clock size={16} />
              <span>Recording... {formatDuration(recordingDuration)}</span>
            </div>
          ) : (
            <span className="text-gray-500 font-medium">
              {transcript ? 'Recording complete. Review and submit below.' : 'Click the microphone to start recording'}
            </span>
          )}
        </div>
      </div>

      {/* Real-time Transcription */}
      {isListening && interimTranscript && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-pulse">
          <p className="text-gray-600">{interimTranscript}</p>
        </div>
      )}

      {/* Location Display */}
      {location && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Location: </span>
            <span className="text-green-800">{location}</span>
          </div>
        </div>
      )}

      {/* Enhanced Transcript Display with Analysis */}
      {transcript && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-gray-700 text-lg">📝 Your Complaint (English)</label>
              <button
                onClick={() => speakText(transcript)}
                className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                aria-label="Read complaint aloud"
              >
                <Volume2 size={20} />
              </button>
            </div>
            <p className="text-gray-900 leading-relaxed text-lg">{transcript}</p>
            <div className="text-sm text-gray-500 mt-2">
              Word count: {transcript.split(' ').length} | Character count: {transcript.length}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {category && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">🏷️ Category: </span>
                <span className="text-blue-800 font-semibold text-lg">{category}</span>
              </div>
            )}

            {priority && (
              <div className={`p-4 rounded-lg border ${getPriorityColor(priority)}`}>
                <span className="text-sm font-medium">⚡ Priority: </span>
                <span className="font-semibold text-lg">{priority}</span>
              </div>
            )}

            {sentiment && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-purple-700">🎯 Impact: </span>
                    <span className="text-purple-800 font-semibold">{sentiment.impact}/10</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-purple-700">⏱️ Urgency: </span>
                    <span className="text-purple-800 font-semibold">{sentiment.urgency}/10</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Translation Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
                aria-label="Select translation language"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={translateText}
                disabled={isTranslating}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md"
                aria-label="Translate complaint"
              >
                <Languages size={20} />
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </div>

            {translatedText && (
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-orange-700 text-lg">
                    🌐 Translated Complaint ({languageOptions.find(lang => lang.code === selectedLanguage)?.flag} {languageOptions.find(lang => lang.code === selectedLanguage)?.name.split('(')[0]})
                  </label>
                  <button
                    onClick={() => speakText(translatedText)}
                    className="text-orange-600 hover:text-orange-700 p-2 rounded-full hover:bg-orange-100 transition-colors"
                    aria-label="Read translated complaint aloud"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <p className="text-orange-900 leading-relaxed text-lg font-medium" dir="auto">{translatedText}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={submitComplaint}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            <Send size={24} />
            Submit Complaint to Civic Authority
          </button>

          <p className="text-center text-sm text-gray-600">
            📋 Your complaint will be logged with a unique ID for tracking. Keep this reference for follow-up.
          </p>
        </div>
      )}
    </div>
  );
};
