// useSpeechRecognition.js

import { useState, useEffect } from 'react';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  let recognition;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const lastTranscript = event.results[0][0].transcript;
        setTranscript(lastTranscript);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };
    } else {
      console.error('Speech recognition not supported by this browser.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  };

  return { transcript, listening, startListening, stopListening };
};
