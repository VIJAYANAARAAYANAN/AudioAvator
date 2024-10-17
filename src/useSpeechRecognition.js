import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState(''); // State to hold the recognized speech transcript
  const [listening, setListening] = useState(false); // State to track if speech recognition is active
  const recognitionRef = useRef(null); // useRef to hold the recognition object across renders

  useEffect(() => {
    // Check if the browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
      // Initialize the speech recognition object and store it in the ref
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false; // Only listen for one speech input at a time
      recognition.interimResults = false; // Do not return interim results
      recognition.lang = 'en-US'; // Set the language to English (US)

      // Event handler for speech recognition result
      recognition.onresult = (event) => {
        const lastTranscript = event.results[0][0].transcript; // Get the recognized text
        setTranscript(lastTranscript); // Update the transcript state
        setListening(false); // Stop the listening state
      };

      // Event handler for when recognition ends
      recognition.onend = () => {
        setListening(false); // Update listening state when recognition stops
      };

      recognitionRef.current = recognition; // Save the recognition instance in the ref
    } else {
      console.error('Speech recognition not supported by this browser.');
    }
  }, []);

  // Function to start speech recognition
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start(); // Start recognition
      setListening(true); // Set listening state to true
    }
  };

  // Function to stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Stop recognition
      setListening(false); // Set listening state to false
    }
  };

  // Function to reset the transcript
  const resetTranscript = () => {
    setTranscript(''); // Reset the transcript state to an empty string
  };

  return { transcript, listening, startListening, stopListening, resetTranscript }; // Return the transcript, control functions, and resetTranscript
};
