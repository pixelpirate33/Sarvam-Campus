import { LanguageOption, VoiceOption, PodcastEpisode } from '../types/podcast';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en-IN',
    name: 'Indian English',
    flag: '🇮🇳',
    popularSpeakers: { male: 'shubh', female: 'simran' }
  },
  {
    code: 'hi-IN',
    name: 'Hindi (हिंदी)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'shubh', female: 'priya' }
  },
  {
    code: 'ta-IN',
    name: 'Tamil (தமிழ்)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'ratan', female: 'ishita' }
  },
  {
    code: 'te-IN',
    name: 'Telugu (తెలుగు)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'shubh', female: 'neha' }
  },
  {
    code: 'bn-IN',
    name: 'Bengali (বাংলা)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'rohan', female: 'shreya' }
  },
  {
    code: 'mr-IN',
    name: 'Marathi (मराठी)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'shubh', female: 'pooja' }
  },
  {
    code: 'kn-IN',
    name: 'Kannada (ಕನ್ನಡ)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'ratan', female: 'kavitha' }
  },
  {
    code: 'ml-IN',
    name: 'Malayalam (മലയാളം)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'mani', female: 'priya' }
  },
  {
    code: 'gu-IN',
    name: 'Gujarati (ગુજરાતી)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'shubh', female: 'neha' }
  },
  {
    code: 'pa-IN',
    name: 'Punjabi (ਪੰਜਾਬੀ)',
    flag: '🇮🇳',
    popularSpeakers: { male: 'shubh', female: 'simran' }
  }
];

export const SARVAM_VOICES: VoiceOption[] = [
  // Official Sarvam Bulbul v3 Male Speakers
  { id: 'shubh', name: 'Shubh', gender: 'male', recommendedRole: 'Host 1', description: 'Energetic, natural Indian lead anchor across Hindi & English' },
  { id: 'aditya', name: 'Aditya', gender: 'male', recommendedRole: 'Host 1', description: 'Deep, conversational, documentary style tone' },
  { id: 'rahul', name: 'Rahul', gender: 'male', recommendedRole: 'Host 1', description: 'Youthful, friendly, modern casual host' },
  { id: 'ratan', name: 'Ratan', gender: 'male', recommendedRole: 'Host 1', description: 'Clear, resonant South and North Indic voice' },
  { id: 'rohan', name: 'Rohan', gender: 'male', recommendedRole: 'Host 1', description: 'Dynamic, versatile podcast conversationalist' },
  { id: 'ashutosh', name: 'Ashutosh', gender: 'male', recommendedRole: 'Host 1', description: 'Authoritative, broadcast journalism tone in Hindi' },
  { id: 'mani', name: 'Mani', gender: 'male', recommendedRole: 'Host 1', description: 'Rich, expressive South Indic regional voice' },
  { id: 'dev', name: 'Dev', gender: 'male', recommendedRole: 'Host 1', description: 'Warm, calm, analytical podcast speaker' },

  // Official Sarvam Bulbul v3 Female Speakers
  { id: 'simran', name: 'Simran', gender: 'female', recommendedRole: 'Host 2', description: 'Crisp, witty, expressive co-host persona' },
  { id: 'priya', name: 'Priya', gender: 'female', recommendedRole: 'Host 2', description: 'Warm, melodic, natural storytelling voice' },
  { id: 'ritu', name: 'Ritu', gender: 'female', recommendedRole: 'Host 2', description: 'Lively, inquisitive, articulate podcast analyst' },
  { id: 'neha', name: 'Neha', gender: 'female', recommendedRole: 'Host 2', description: 'Bright, knowledgeable, engaging voice' },
  { id: 'kavya', name: 'Kavya', gender: 'female', recommendedRole: 'Host 2', description: 'Sophisticated, smooth, insightful narrator' },
  { id: 'suhani', name: 'Suhani', gender: 'female', recommendedRole: 'Host 2', description: 'Expressive, friendly conversational Hindi speaker' },
  { id: 'ishita', name: 'Ishita', gender: 'female', recommendedRole: 'Host 2', description: 'Modern, confident, articulate presenter' },
  { id: 'kavitha', name: 'Kavitha', gender: 'female', recommendedRole: 'Host 2', description: 'Melodic South Indic narrator for Kannada/Tamil' }
];

export interface PresetTopic {
  id: string;
  topic: string;
  category: string;
  tagline: string;
  language: string;
  host1: string;
  host2: string;
  duration: 1 | 3;
}

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: 'upi-growth',
    topic: 'The Growth of UPI in India: From Street Chai to Global Rails',
    category: 'Fintech & Economy',
    tagline: 'How 14 Billion monthly instant transactions reshaped a nation',
    language: 'en-IN',
    host1: 'shubh',
    host2: 'simran',
    duration: 1
  },
  {
    id: 'ai-devs',
    topic: 'AI vs Human Developers: The 2026 Shift',
    category: 'Artificial Intelligence',
    tagline: 'Will software engineers write code or orchestrate autonomous agents?',
    language: 'en-IN',
    host1: 'aditya',
    host2: 'kavya',
    duration: 1
  },
  {
    id: 'chandrayaan',
    topic: 'Chandrayaan Mission & Space Exploration',
    category: 'Aerospace & Science',
    tagline: 'Inside ISRO\'s frugal engineering triumph at the Moon\'s south pole',
    language: 'en-IN',
    host1: 'shubh',
    host2: 'priya',
    duration: 1
  },
  {
    id: 'silk-road',
    topic: 'Why Silk Road Failed: The Fall of Ross Ulbricht',
    category: 'Cybersecurity & History',
    tagline: 'OPSEC failures, Bitcoin tracing, and the birth of modern cyber forensics',
    language: 'en-IN',
    host1: 'ratan',
    host2: 'simran',
    duration: 1
  }
];

export const SAMPLE_EPISODE_DATA: PodcastEpisode = {
  id: 'preset-upi-demo',
  createdAt: new Date().toISOString(),
  config: {
    topic: 'The Growth of UPI in India: From Street Chai to Global Rails',
    language: 'en-IN',
    languageName: 'Indian English',
    host1Speaker: 'shubh',
    host1Name: 'Arjun',
    host2Speaker: 'simran',
    host2Name: 'Priya',
    duration: 1,
    pace: 1.05,
    useDemoMode: true
  },
  metadata: {
    title: 'The Digital Rupee Revolution: How UPI Conquered India',
    tagline: 'From humble roadside tea stalls to 14 billion monthly transactions across the globe',
    summary: 'In this episode, Arjun and Priya dissect how India built the world’s most dominant instant payments rail. They break down the architectural brilliance of the Unified Payments Interface (UPI), why interoperable QR codes beat closed wallets, and how NPCI is now taking this public digital good worldwide.',
    keyTakeaways: [
      'UPI processes over 14 billion transactions per month, representing over 80% of India’s digital retail volume.',
      'The genius was a public-private two-tier architecture: NPCI handled the settlement rails while private apps competed on UX.',
      'Interoperable zero-MDR soundboxes and QR codes catalyzed micro-merchants who were previously cash-only.',
      'Cross-border integration with Singapore (PayNow), UAE, and France proves UPI as an exportable digital public infrastructure.'
    ],
    artworkPrompt: 'A vibrant retro-futuristic podcast album cover showing glowing digital soundwaves, QR codes transforming into geometric constellations, and a bustling Indian cyber-bazaar at twilight with neon indigo and amber lighting.',
  },
  totalDuration: 52,
  script: [
    {
      id: 'line-1',
      speaker: 'Host 1',
      speakerName: 'Arjun',
      text: "Welcome back to EchoCast! Today, we're talking about something you probably used before your morning tea: India's Unified Payments Interface, or UPI.",
      duration: 7.2,
      startTime: 0,
      endTime: 7.2
    },
    {
      id: 'line-2',
      speaker: 'Host 2',
      speakerName: 'Priya',
      text: "I actually just scanned a QR code for my coconut water five minutes ago! It feels so natural now, but Arjun, remember ten years ago when paying five rupees meant hunting for loose coins?",
      duration: 8.5,
      startTime: 7.2,
      endTime: 15.7
    },
    {
      id: 'line-3',
      speaker: 'Host 1',
      speakerName: 'Arjun',
      text: "Exactly. Back in 2016, traditional banking giants thought people needed proprietary cards or closed wallets. Then NPCI stepped in with a radical vision: open interoperability on top of the India Stack.",
      duration: 9.8,
      startTime: 15.7,
      endTime: 25.5
    },
    {
      id: 'line-4',
      speaker: 'Host 2',
      speakerName: 'Priya',
      text: "That was the game changer. Any bank account talking to any app instantly via a simple virtual handle. And today? Over fourteen billion transactions every single month. That's nearly half of global real-time payments!",
      duration: 10.3,
      startTime: 25.5,
      endTime: 35.8
    },
    {
      id: 'line-5',
      speaker: 'Host 1',
      speakerName: 'Arjun',
      text: "And what fascinates me is the hardware innovation too—like those audio soundboxes chirping instant confirmation on every bustling street corner in Mumbai and Bengaluru.",
      duration: 8.4,
      startTime: 35.8,
      endTime: 44.2
    },
    {
      id: 'line-6',
      speaker: 'Host 2',
      speakerName: 'Priya',
      text: "Total trust through sound! Now UPI is expanding to Paris, Singapore, and Dubai. It's truly India's gift to global digital public infrastructure. Until next time, keep streaming and stay curious!",
      duration: 7.8,
      startTime: 44.2,
      endTime: 52.0
    }
  ]
};
