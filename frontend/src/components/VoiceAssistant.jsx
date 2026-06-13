import React, { useState, useEffect } from 'react';
import voiceService from '../services/voice';
import './VoiceAssistant.css';

function VoiceAssistant({ onMessageSend }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const savedAutoSpeak = localStorage.getItem('voiceAutoSpeak');
    if (savedAutoSpeak !== null) {
      setAutoSpeak(savedAutoSpeak === 'true');
    }

    // Set up transcript handler
    voiceService.onTranscript = (text) => {
      setTranscript(text);
      setIsListening(false);

      if (onMessageSend) {
        onMessageSend(text);
      }
    };

    // Set up error handler
    voiceService.onError = (error) => {
      console.error('Voice error:', error);
      setIsListening(false);
      setTranscript('Error: ' + error);
    };

    // Check speaking status periodically
    const speakingInterval = setInterval(() => {
      setIsSpeaking(voiceService.getIsSpeaking());
    }, 100);

    return () => {
      clearInterval(speakingInterval);
    };
  }, [onMessageSend]);

  const handleMicClick = () => {
    if (!voiceService.isRecognitionAvailable()) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      voiceService.startListening(
        (text) => {
          // Handled by onTranscript callback
        },
        (error) => {
          console.error('Voice error:', error);
        }
      );
      setIsListening(true);
      setTranscript('');
    }
  };

  const handleSpeakToggle = () => {
    const newValue = !autoSpeak;
    setAutoSpeak(newValue);
    localStorage.setItem('voiceAutoSpeak', newValue.toString());
  };

  const stopSpeaking = () => {
    voiceService.stopSpeaking();
  };

  return (
    <div className="voice-assistant">
      <button
        className={`mic-button ${isListening ? 'listening' : ''}`}
        onClick={handleMicClick}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? '🎤 (Listening...)' : '🎤'}
      </button>

      {transcript && !isListening && (
        <div className="transcript-display">
          <span className="transcript-text">"{transcript}"</span>
        </div>
      )}

      <button
        className={`voice-toggle ${autoSpeak ? 'active' : ''}`}
        onClick={handleSpeakToggle}
        title={autoSpeak ? 'Voice output enabled' : 'Voice output disabled'}
      >
        {autoSpeak ? '🔊' : '🔇'}
      </button>

      {isSpeaking && (
        <button
          className="stop-speaking-button"
          onClick={stopSpeaking}
          title="Stop speaking"
        >
          ⏹️
        </button>
      )}

      {!voiceService.isRecognitionAvailable() && (
        <div className="voice-warning">
          ⚠️ Voice not supported
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;