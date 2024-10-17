import React, { useState, useEffect } from 'react';
import './App.css'; // Import your CSS file
import avatarImage from './assets/noelleAva.png'; // Use the avatar image
import { useSpeechRecognition } from './useSpeechRecognition'; // Import speech recognition hook

const ChatApp = () => {
  const [messages, setMessages] = useState([]); // State to hold chat messages
  const [userInput, setUserInput] = useState(''); // State to hold user input
  const [videoUrl, setVideoUrl] = useState(null); // State to hold the video URL (for bot response video)
  const [loading, setLoading] = useState(false); // State to handle loading status for bot response
  const [preloadVideo, setPreloadVideo] = useState(null); // State to hold the preloaded video
  const { transcript, listening, startListening, stopListening, resetTranscript } = useSpeechRecognition(); // Hook to handle speech recognition
  const [showVideo, setShowVideo] = useState(false); // State to control the visibility of the video

  // Effect to auto-fill input when speech recognition is done
  useEffect(() => {
    if (!listening && transcript) {
      console.log('Speech recognition completed. Transcript:', transcript);
      setUserInput(transcript); // Set the recognized speech into the input field
      stopListening(); // Ensure speech recognition stops after completion
    }
  }, [transcript, listening, stopListening]);

  // Function to simulate a bot response (static sentence for now)
  const generateBotResponse = () => {
    return "Hello! I'm a bot, and I'm here to help! Text me whatever you need to ask with me. I am here to guide you.";
  };

  // Function to handle sending the user message and then bot response to D-ID API
  const handleSendMessage = async () => {
    if (userInput.trim() === '') return; // If input is empty, do nothing

    const userMessage = { text: userInput, sender: 'user' }; // Create a new user message object
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add the user message to the messages list
    setUserInput(''); // Clear the input field

    // Debug message
    console.log('User message:', userMessage.text);

    // Start loading for video generation and show loader instead of bot response
    setLoading(true);
    setShowVideo(false); // Hide the video initially

    try {
      // Generate bot message but delay adding it to messages
      const botMessageText = generateBotResponse();

      console.log('Sending bot message to D-ID API...');

      // POST request to D-ID API to generate the video for bot response
      const postResponse = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('dmlqYXlkaWR0ZXN0bWFpbEBnbWFpbC5jb20:A7aKuOgdems0bGDoDA2_g'), // Use the provided API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: 'https://raw.githubusercontent.com/VIJAYANAARAAYANAN/Avatorimage/refs/heads/main/avatorNoelle.png',
          script: {
            type: 'text',
            input: botMessageText, // Send the bot message instead of the user message
          },
        }),
      });

      const postData = await postResponse.json();
      const talkId = postData.id; // Get the talk ID from the response
      console.log('Talk ID from POST response:', talkId);

      // Check if the video is ready by making a GET request
      let videoReady = false;
      while (!videoReady) {
        console.log('Checking video processing status...');
        const getResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('dmlqYXlkaWR0ZXN0bWFpbEBnbWFpbC5jb20:A7aKuOgdems0bGDoDA2_g'), // Use the provided API key
          },
        });

        const getData = await getResponse.json();
        console.log('GET response data:', getData);

        if (getData.status === 'done') {
          setVideoUrl(getData.result_url); // Set the video URL when the video is ready
          console.log('Video ready! Result URL:', getData.result_url);
          videoReady = true; // Exit the loop
    
          // Preload the video
          const video = document.createElement('video');
          video.src = getData.result_url; // Set the source to the video URL
          video.preload = 'auto'; // Preload the video
    
          // Log the preloading action
          console.log("Starting to preload video...");
    
          video.oncanplaythrough = () => {
            console.log("Video is ready to play!"); // Log when video is ready
            setPreloadVideo(video.src); // Store the preloaded video URL
          };
    
          // Add a 2-second delay before showing the video
          setTimeout(() => {
            console.log("Showing video after 2 seconds..."); // Log when video will be shown
            setShowVideo(true); // Set the state to show the video after 2 seconds
          }, 2000); // 2-second delay before changing to video
        } else {
          console.log('Video still processing...');
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before rechecking
        }
      }

      // Once the video is ready, add the bot message
      const botMessage = { text: botMessageText, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]); // Add the bot message to the messages list

      // Stop loading when the video is ready
      setLoading(false);
    } catch (error) {
      console.error('Error creating video:', error);
      setLoading(false); // Reset loading state on error
    }
  };

  // Handle when avatar is clicked to start speech recognition
  const handleAvatarClick = () => {
    if (!listening) {
      console.log('Avatar clicked, starting speech recognition...');
      resetTranscript(); // Reset transcript for a new recognition session
      startListening(); // Start listening for user speech
    } else {
      console.log('Already listening, stopping speech recognition...');
      stopListening(); // If it's already listening, stop it
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Chat with AI</h1>
      <div className="avatar-container" onClick={handleAvatarClick}>
        {showVideo && preloadVideo ? ( // Show video only when preloaded
          <video width="100" autoPlay onEnded={() => setVideoUrl(null)}>
            <source src={preloadVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={avatarImage} alt="Avatar" className="avatar-image" /> // Display the avatar image when no video is present
        )}
      </div>
      <MessageList messages={messages} /> {/* Render the message list */}
      {loading && <p>Generating bot response and video...</p>} {/* Show loading message */}
      <MessageInput
        userInput={userInput} // Pass the current user input to the MessageInput component
        setUserInput={setUserInput} // Pass the setUserInput function to the MessageInput component
        handleSendMessage={handleSendMessage} // Pass the handleSendMessage function to the MessageInput component
      />
    </div>
  );
};

// Component to render the list of messages
const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-bubble ${message.sender === 'user' ? 'user' : 'bot'}`} // Different styles for user and bot messages
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

// Component to handle message input and send button
const MessageInput = ({ userInput, setUserInput, handleSendMessage }) => {
  return (
    <div className="message-input-container">
      <input
        type="text"
        className="message-input"
        placeholder="Type a message..."
        value={userInput} // Bind the input field to the userInput state
        onChange={(e) => setUserInput(e.target.value)} // Update the userInput state when the input changes
        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // Send the message when 'Enter' is pressed
      />
      <button className="send-button" onClick={handleSendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatApp;
