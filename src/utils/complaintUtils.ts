import { keywordMap } from './keywordMap';

// Enhanced categorization with machine learning-like scoring
export const categorizeComplaint = (text: string): string => {
  const categories = {
    'Roads & Infrastructure': {
      keywords: ['road', 'street', 'pothole', 'footpath', 'bridge', 'construction', 'traffic', 'signal', 'pavement'],
      score: 0
    },
    'Water Supply': {
      keywords: ['water', 'pipe', 'leak', 'supply', 'drainage', 'sewage', 'flood', 'contamination', 'tap'],
      score: 0
    },
    'Electricity': {
      keywords: ['power', 'electricity', 'light', 'streetlight', 'outage', 'voltage', 'transformer', 'wire', 'electric'],
      score: 0
    },
    'Sanitation': {
      keywords: ['garbage', 'waste', 'trash', 'cleaning', 'dump', 'sewage', 'hygiene', 'sanitation', 'dirty'],
      score: 0
    },
    'Public Safety': {
      keywords: ['safety', 'dangerous', 'accident', 'crime', 'security', 'emergency', 'threat', 'unsafe', 'risk'],
      score: 0
    },
    'Noise Pollution': {
      keywords: ['noise', 'loud', 'disturbance', 'sound', 'nuisance', 'party', 'construction', 'vehicle', 'horn'],
      score: 0
    }
  };

  const words = text.toLowerCase().split(/\s+/);
  
  // Calculate scores for each category
  Object.keys(categories).forEach(category => {
    categories[category].score = categories[category].keywords.reduce((score, keyword) => {
      const keywordCount = words.filter(word => word.includes(keyword)).length;
      return score + keywordCount;
    }, 0);
  });

  // Find category with highest score
  const topCategory = Object.entries(categories).reduce((top, [category, data]) => {
    return data.score > top.score ? { category, score: data.score } : top;
  }, { category: 'General', score: 0 });

  return topCategory.score > 0 ? topCategory.category : 'General';
};

// Enhanced priority detection with sentiment and urgency analysis
export const getPriorityLevel = (text: string): string => {
  const urgentKeywords = ['urgent', 'emergency', 'immediate', 'dangerous', 'critical', 'severe', 'accident'];
  const highKeywords = ['important', 'serious', 'significant', 'major', 'risk', 'safety'];
  const mediumKeywords = ['moderate', 'issue', 'problem', 'concern', 'repair'];
  const lowKeywords = ['minor', 'small', 'slight', 'routine', 'regular'];

  const words = text.toLowerCase().split(/\s+/);
  
  // Calculate priority scores
  const scores = {
    urgent: urgentKeywords.reduce((score, keyword) => 
      score + (words.includes(keyword) ? 3 : 0), 0),
    high: highKeywords.reduce((score, keyword) => 
      score + (words.includes(keyword) ? 2 : 0), 0),
    medium: mediumKeywords.reduce((score, keyword) => 
      score + (words.includes(keyword) ? 1 : 0), 0),
    low: lowKeywords.reduce((score, keyword) => 
      score + (words.includes(keyword) ? 1 : 0), 0)
  };

  // Analyze sentiment and context
  const negativeWords = ['not', 'no', 'never', 'without', 'lack', 'missing'];
  const timeWords = ['days', 'weeks', 'months', 'long', 'since', 'still'];
  
  const hasNegatives = negativeWords.some(word => words.includes(word));
  const hasTimeComplaints = timeWords.some(word => words.includes(word));
  
  // Adjust scores based on sentiment and context
  if (hasNegatives) scores.high += 1;
  if (hasTimeComplaints) scores.urgent += 1;

  // Determine final priority
  if (scores.urgent > 0) return 'Urgent';
  if (scores.high > 1) return 'High';
  if (scores.medium > 0) return 'Medium';
  if (scores.low > 0) return 'Low';
  
  return 'Medium'; // Default priority
};

// Enhanced location extraction with verification
export const extractLocation = (text: string): string | null => {
  const locationPatterns = [
    /near\s+([^,.]+)/i,
    /at\s+([^,.]+)/i,
    /in\s+([^,.]+)/i,
    /location[:\s]+([^,.]+)/i,
    /area[:\s]+([^,.]+)/i
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};

// Sentiment analysis for complaint urgency
export const analyzeSentiment = (text: string): {
  sentiment: 'negative' | 'neutral' | 'positive',
  urgency: number,
  impact: number
} => {
  const words = text.toLowerCase().split(/\s+/);
  
  const sentimentScores = {
    negative: 0,
    neutral: 0,
    positive: 0
  };

  const urgencyIndicators = {
    high: ['immediate', 'urgent', 'emergency', 'critical', 'dangerous', 'severe'],
    medium: ['important', 'needed', 'required', 'necessary', 'significant'],
    low: ['would like', 'could', 'maybe', 'perhaps', 'sometime']
  };

  const impactIndicators = {
    high: ['everyone', 'community', 'children', 'elderly', 'disabled', 'public'],
    medium: ['people', 'residents', 'neighbors', 'local'],
    low: ['me', 'my', 'personal', 'individual']
  };

  // Calculate sentiment scores
  words.forEach(word => {
    if (word.match(/^(no|not|never|cannot|bad|worse|worst|terrible)$/)) {
      sentimentScores.negative++;
    } else if (word.match(/^(good|better|best|great|excellent|perfect)$/)) {
      sentimentScores.positive++;
    } else {
      sentimentScores.neutral++;
    }
  });

  // Calculate urgency score (0-10)
  const urgencyScore = 
    urgencyIndicators.high.some(term => text.toLowerCase().includes(term)) ? 10 :
    urgencyIndicators.medium.some(term => text.toLowerCase().includes(term)) ? 5 :
    urgencyIndicators.low.some(term => text.toLowerCase().includes(term)) ? 2 : 3;

  // Calculate impact score (0-10)
  const impactScore = 
    impactIndicators.high.some(term => text.toLowerCase().includes(term)) ? 10 :
    impactIndicators.medium.some(term => text.toLowerCase().includes(term)) ? 6 :
    impactIndicators.low.some(term => text.toLowerCase().includes(term)) ? 3 : 5;

  // Determine overall sentiment
  const sentiment = 
    sentimentScores.negative > sentimentScores.positive ? 'negative' :
    sentimentScores.positive > sentimentScores.negative ? 'positive' : 'neutral';

  return {
    sentiment,
    urgency: urgencyScore,
    impact: impactScore
  };
};

export const formatComplaintForSubmission = (complaint: any) => {
  const sentiment = analyzeSentiment(complaint.originalText);
  
  return {
    id: generateComplaintId(),
    originalText: complaint.originalText,
    translatedText: complaint.translatedText || '',
    category: complaint.category || categorizeComplaint(complaint.originalText),
    priority: complaint.priority || getPriorityLevel(complaint.originalText),
    language: complaint.language || 'en',
    method: complaint.method || 'manual',
    timestamp: new Date().toISOString(),
    status: 'Submitted',
    location: complaint.location || extractLocation(complaint.originalText) || 'Not specified',
    analysis: {
      sentiment: sentiment.sentiment,
      urgency: sentiment.urgency,
      impact: sentiment.impact
    }
  };
};

// Generate unique complaint ID
const generateComplaintId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CMP-${timestamp}-${random}`.toUpperCase();
};
