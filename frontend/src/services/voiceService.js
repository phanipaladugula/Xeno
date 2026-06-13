// Voice service for Web Speech API integration

class VoiceService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.onTranscript = null;
    this.onError = null;
    this.onSpeakingEnd = null;

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.onTranscript) {
          this.onTranscript(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.onError) {
          this.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  // Check if speech recognition is available
  isRecognitionAvailable() {
    return this.recognition !== null;
  }

  // Check if speech synthesis is available
  isSynthesisAvailable() {
    return this.synthesis !== null;
  }

  // Start listening for voice input
  startListening(onTranscript, onError) {
    if (!this.isRecognitionAvailable()) {
      onError && onError('Speech recognition not supported');
      return;
    }

    this.onTranscript = onTranscript;
    this.onError = onError;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      onError && onError('Failed to start recognition: ' + err.message);
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Speak text aloud
  speak(text, onEnd) {
    if (!this.isSynthesisAvailable()) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    this.synthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices
  getVoices() {
    if (!this.isSynthesisAvailable()) {
      return [];
    }
    return this.synthesis.getVoices();
  }

  // Set voice
  setVoice(voiceName) {
    // Can be implemented to set a specific voice
    console.log('Voice set to:', voiceName);
  }

  // Check if currently listening
  getIsListening() {
    return this.isListening;
  }

  // Check if currently speaking
  getIsSpeaking() {
    return this.synthesis && this.synthesis.speaking;
  }
}

export default new VoiceService();