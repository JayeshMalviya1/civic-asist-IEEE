export const keywordMap = {
  // Category keywords
  categories: {
    'Roads & Infrastructure': [
      'road', 'street', 'pothole', 'footpath', 'bridge', 'construction', 'traffic',
      'signal', 'pavement', 'highway', 'pathway', 'crossing', 'divider', 'junction'
    ],
    'Water Supply': [
      'water', 'pipe', 'leak', 'supply', 'drainage', 'sewage', 'flood',
      'contamination', 'tap', 'pipeline', 'tank', 'reservoir', 'pressure'
    ],
    'Electricity': [
      'power', 'electricity', 'light', 'streetlight', 'outage', 'voltage',
      'transformer', 'wire', 'electric', 'meter', 'connection', 'bill'
    ],
    'Sanitation': [
      'garbage', 'waste', 'trash', 'cleaning', 'dump', 'sewage', 'hygiene',
      'sanitation', 'dirty', 'litter', 'bin', 'collection', 'disposal'
    ],
    'Public Safety': [
      'safety', 'dangerous', 'accident', 'crime', 'security', 'emergency',
      'threat', 'unsafe', 'risk', 'police', 'protection', 'hazard'
    ],
    'Noise Pollution': [
      'noise', 'loud', 'disturbance', 'sound', 'nuisance', 'party',
      'construction', 'vehicle', 'horn', 'music', 'speaker', 'decibel'
    ]
  },

  // Priority indicators
  priority: {
    urgent: [
      'immediate', 'urgent', 'emergency', 'critical', 'severe', 'dangerous',
      'life-threatening', 'hazardous', 'accident', 'disaster'
    ],
    high: [
      'important', 'serious', 'significant', 'major', 'risk', 'safety',
      'health', 'damage', 'broken', 'disruption'
    ],
    medium: [
      'moderate', 'issue', 'problem', 'concern', 'repair', 'fix',
      'attention', 'needed', 'required', 'regular'
    ],
    low: [
      'minor', 'small', 'slight', 'routine', 'regular', 'maintenance',
      'update', 'improve', 'enhance', 'suggestion'
    ]
  },

  // Sentiment indicators
  sentiment: {
    negative: [
      'bad', 'worse', 'worst', 'terrible', 'horrible', 'poor',
      'awful', 'unacceptable', 'disappointing', 'frustrated'
    ],
    positive: [
      'good', 'better', 'best', 'great', 'excellent', 'perfect',
      'fine', 'okay', 'satisfactory', 'pleased'
    ],
    neutral: [
      'normal', 'average', 'standard', 'usual', 'typical',
      'common', 'regular', 'ordinary', 'moderate'
    ]
  },

  // Impact indicators
  impact: {
    high: [
      'everyone', 'community', 'public', 'all', 'many', 'children',
      'elderly', 'disabled', 'residents', 'neighborhood'
    ],
    medium: [
      'several', 'some', 'few', 'people', 'group', 'area',
      'street', 'block', 'building', 'local'
    ],
    low: [
      'me', 'my', 'mine', 'personal', 'individual', 'single',
      'one', 'particular', 'specific', 'private'
    ]
  },

  // Time-related keywords
  timeIndicators: [
    'days', 'weeks', 'months', 'years', 'long', 'since',
    'still', 'always', 'never', 'frequently', 'constantly'
  ],

  // Location indicators
  locationIndicators: [
    'near', 'at', 'in', 'around', 'behind', 'front',
    'beside', 'between', 'across', 'opposite', 'junction'
  ]
}; 