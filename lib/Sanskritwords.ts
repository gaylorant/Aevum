export interface SanskritWord {
  sanskrit: string;
  phonetic: string;
  meaning: string;
  description: string;
}

export const samevaWords: SanskritWord[] = [
  { sanskrit: "समत्व", phonetic: "Samatva", meaning: "Equanimity", description: "Mental stability in both joy and sorrow." },
  { sanskrit: "करुणा", phonetic: "Karuṇā", meaning: "Compassion", description: "Empathetic sharing of others' feelings." },
  { sanskrit: "मैत्री", phonetic: "Maitrī", meaning: "Loving Kindness", description: "Unconditional goodwill toward all." },
  { sanskrit: "मौन", phonetic: "Mauna", meaning: "Healing Silence", description: "Intentional stillness to listen deeply." },
  { sanskrit: "स्वाध्याय", phonetic: "Svādhyāya", meaning: "Self-Study", description: "Conscious self-reflection and journaling." },
  { sanskrit: "शान्ति", phonetic: "Shānti", meaning: "Inner Peace", description: "Deep tranquility, free from anxiety." },
  { sanskrit: "अभय", phonetic: "Abhaya", meaning: "Fearlessness", description: "Freedom from judgment and fear." },
  { sanskrit: "संतोष", phonetic: "Saṁtoṣa", meaning: "Contentment", description: "Being fully present and accepting." },
  { sanskrit: "चित्त", phonetic: "Citta", meaning: "Consciousness", description: "The seat of feelings and thoughts." },
  { sanskrit: "विवेक", phonetic: "Viveka", meaning: "Discernment", description: "Clarity to distinguish what truly matters." },
  { sanskrit: "विसर्ग", phonetic: "Visarga", meaning: "Letting Go", description: "Releasing built-up pressure and control." },
  { sanskrit: "आरोग्य", phonetic: "Ārogya", meaning: "Wellbeing", description: "Complete mental and emotional health." },
  { sanskrit: "सौहार्द", phonetic: "Sauhārda", meaning: "Goodwill", description: "Warm-hearted fellowship with others." },
  { sanskrit: "उपेक्षा", phonetic: "Upekṣā", meaning: "Non-Judgment", description: "Observing without reaction or attachment." },
  { sanskrit: "श्रवण", phonetic: "Shravana", meaning: "Deep Listening", description: "The art of truly hearing another." },
];

export const particleWordsList = samevaWords.map(w => w.sanskrit);