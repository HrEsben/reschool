// OpenMoji smiley collection for Dagens Smiley tool
// Using Unicode emojis that match OpenMoji style

export interface SmileyOption {
  unicode: string;
  name: string;
  category: string;
  description: string;
}

// Curated collection of smileys for different emotions and topics
export const SMILEY_OPTIONS: SmileyOption[] = [
  // Happy emotions
  { unicode: '😊', name: 'Smiling Face', category: 'happy', description: 'Glad og tilfreds' },
  { unicode: '😄', name: 'Grinning Face', category: 'happy', description: 'Meget glad og begejstret' },
  { unicode: '🥰', name: 'Smiling Face with Hearts', category: 'happy', description: 'Forelskelse og kærlighed' },
  { unicode: '😎', name: 'Cool Face', category: 'happy', description: 'Cool og selvsikker' },
  { unicode: '🤗', name: 'Hugging Face', category: 'happy', description: 'Kærlig og omfavnende' },
  
  // Sad/Upset emotions  
  { unicode: '😢', name: 'Crying Face', category: 'sad', description: 'Ked af det og trist' },
  { unicode: '😭', name: 'Loudly Crying Face', category: 'sad', description: 'Meget ked af det' },
  { unicode: '☹️', name: 'Frowning Face', category: 'sad', description: 'Utilfreds og trist' },
  { unicode: '😞', name: 'Disappointed Face', category: 'sad', description: 'Skuffet og nedtrykt' },
  { unicode: '💔', name: 'Broken Heart', category: 'sad', description: 'Hjertesorg og sorg' },
  
  // Angry/Frustrated emotions
  { unicode: '😠', name: 'Angry Face', category: 'angry', description: 'Irriteret og vred' },
  { unicode: '😡', name: 'Pouting Face', category: 'angry', description: 'Meget vred og frustreret' },
  { unicode: '🤬', name: 'Face with Swearing', category: 'angry', description: 'Ekstrem frustration' },
  { unicode: '😤', name: 'Huffing Face', category: 'angry', description: 'Støttede og irriteret' },
  
  // Anxious/Worried emotions
  { unicode: '😰', name: 'Anxious Face', category: 'worried', description: 'Nervøs og bekymret' },
  { unicode: '😨', name: 'Fearful Face', category: 'worried', description: 'Bange og forskrækket' },
  { unicode: '😟', name: 'Worried Face', category: 'worried', description: 'Bekymret og urolig' },
  { unicode: '😦', name: 'Frowning Face with Open Mouth', category: 'worried', description: 'Chokeret og bekymret' },
  
  // Neutral/Mixed emotions
  { unicode: '😐', name: 'Neutral Face', category: 'neutral', description: 'Neutral og udforsket' },
  { unicode: '🤔', name: 'Thinking Face', category: 'neutral', description: 'Tænksom og reflekterende' },
  { unicode: '😌', name: 'Relieved Face', category: 'neutral', description: 'Rolig og afslappet' },
  { unicode: '😑', name: 'Expressionless Face', category: 'neutral', description: 'Ligegyldig eller træt' },
  
  // Excited/Energy emotions
  { unicode: '🤩', name: 'Star-Struck', category: 'excited', description: 'Begejstret og imponeret' },
  { unicode: '😆', name: 'Grinning Squinting Face', category: 'excited', description: 'Griner højt' },
  { unicode: '🥳', name: 'Partying Face', category: 'excited', description: 'Festlig og fejrende' },
  { unicode: '🙌', name: 'Raising Hands', category: 'excited', description: 'Sejr og celebration' },
  
  // Tired/Low energy emotions
  { unicode: '😴', name: 'Sleeping Face', category: 'tired', description: 'Træt og søvnig' },
  { unicode: '🥱', name: 'Yawning Face', category: 'tired', description: 'Gaber og træt' },
  { unicode: '😪', name: 'Sleepy Face', category: 'tired', description: 'Døsig og træt' },
  
  // Surprised emotions
  { unicode: '😮', name: 'Face with Open Mouth', category: 'surprised', description: 'Overrasket' },
  { unicode: '😲', name: 'Astonished Face', category: 'surprised', description: 'Forbløffet og chokeret' },
  { unicode: '🤯', name: 'Exploding Head', category: 'surprised', description: 'Mind blown og overrasket' },
  
  // Silly/Playful emotions
  { unicode: '😜', name: 'Winking Face with Tongue', category: 'silly', description: 'Sjov og legende' },
  { unicode: '🤪', name: 'Zany Face', category: 'silly', description: 'Skør og skæv' },
  { unicode: '🙃', name: 'Upside-Down Face', category: 'silly', description: 'Ironisk og fjollet' },
  { unicode: '😝', name: 'Squinting Face with Tongue', category: 'silly', description: 'Drillende og legende' },
];

// Helper functions
export function getSmileyByUnicode(unicode: string): SmileyOption | undefined {
  return SMILEY_OPTIONS.find(smiley => smiley.unicode === unicode);
}

export function getSmileysByCategory(category: string): SmileyOption[] {
  return SMILEY_OPTIONS.filter(smiley => smiley.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set(SMILEY_OPTIONS.map(smiley => smiley.category));
  return Array.from(categories);
}

// Category display names in Danish
export const CATEGORY_NAMES: Record<string, string> = {
  happy: 'Glad',
  sad: 'Trist',
  angry: 'Vred',
  worried: 'Bekymret',
  neutral: 'Neutral',
  excited: 'Begejstret',
  tired: 'Træt',
  surprised: 'Overrasket',
  silly: 'Sjov',
};
