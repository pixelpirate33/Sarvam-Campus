/**
 * Web Speech API Fallback Player
 * When Sarvam API is not connected or in Demo Mode, this service speaks
 * the real text using the browser's built-in human speech synthesis voices
 * (e.g. Indian English / natural voices) with zero robotic beep-boop sounds.
 */

let speechUtterance: SpeechSynthesisUtterance | null = null;

export function stopWebSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakScriptLine(
  text: string,
  speaker: 'Host 1' | 'Host 2',
  languageCode = 'en-IN',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  stopWebSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  speechUtterance = utterance;
  utterance.lang = languageCode || 'en-IN';

  const voices = window.speechSynthesis.getVoices();
  const isHost1 = speaker === 'Host 1';

  // Target specific Indic language (e.g. 'hi' for Hindi, 'ta' for Tamil, 'te' for Telugu)
  const langPrefix = (languageCode || 'en-IN').split('-')[0].toLowerCase();
  const langVoices = voices.filter(
    (v) => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase().includes('in')
  );
  const matchingVoices = langVoices.length > 0 ? langVoices : voices;

  if (isHost1) {
    // Male host voice
    const male = matchingVoices.find(
      (v) =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('ravi') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('guy') ||
        v.name.toLowerCase().includes('george')
    );
    if (male) utterance.voice = male;
    utterance.pitch = 0.92;
    utterance.rate = 1.05;
  } else {
    // Female co-host voice
    const female = matchingVoices.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('jenny') ||
        v.name.toLowerCase().includes('samantha')
    );
    if (female) utterance.voice = female;
    utterance.pitch = 1.18;
    utterance.rate = 1.05;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}
