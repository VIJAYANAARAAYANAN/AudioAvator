import React, { useState, useEffect } from 'react';
import './App.css'; // Import your CSS file
import avatarImage from './assets/avatorNoelle.png'; // Use the avatar image
import { useSpeechRecognition } from './useSpeechRecognition'; // Import speech recognition hook

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();

  // Effect to auto-fill input when speech recognition is done
  useEffect(() => {
    if (!listening && transcript) {
      setUserInput(transcript);
    }
  }, [transcript, listening]);

  // Function to handle sending the message and generating the video
  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;

    const newMessage = { text: userInput, sender: 'user' };
    setMessages([...messages, newMessage]);
    setUserInput('');

    // Call the D-ID API to generate video
    try {
      console.log('Sending message to bot...');
      setLoading(true);

      // Post request to create the talking head video
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('dmlqYXliYWxhcmFtMDVAZ21haWwuY29t:UdbQtr9JJGxq8E7h5ZtY-'), // Use your API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: 'https://raw.githubusercontent.com/VIJAYANAARAAYANAN/Avatorimage/refs/heads/main/avatorNoelle.png',
          script: {
            type: 'text',
            input: newMessage.text,
          },
        }),
      });

      const data = await response.json();
      const talkId = data.id;

      // Poll the GET endpoint to check the status and get the video URL
      let videoReady = false;
      while (!videoReady) {
        console.log('Checking video processing status...');
        const getResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('dmlqYXliYWxhcmFtMDVAZ21haWwuY29t:UdbQtr9JJGxq8E7h5ZtY-'), // Use your API key
          },
        });

        const getData = await getResponse.json();
        if (getData.status === 'done') {
          setVideoUrl(getData.result_url);
          videoReady = true;
        } else {
          console.log('Video processing...');
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before checking again
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error creating video:', error);
      setLoading(false);
    }
  };

  // Handle when avatar is clicked to start speech recognition
  const handleAvatarClick = () => {
    console.log('Avatar clicked, starting speech recognition...');
    startListening();
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Chat with AI</h1>
      <div className="avatar-container" onClick={handleAvatarClick}>
        {videoUrl && !loading ? (
          <video width="100" autoPlay onEnded={() => setVideoUrl(null)}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={avatarImage} alt="Avatar" className="avatar-image" />
        )}
      </div>
      <MessageList messages={messages} />
      {loading && <p>Generating video...</p>}
      <MessageInput
        userInput={userInput}
        setUserInput={setUserInput}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

// Component to display chat messages
const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-bubble ${message.sender === 'user' ? 'user' : 'bot'}`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

// Component to handle user input
const MessageInput = ({ userInput, setUserInput, handleSendMessage }) => {
  return (
    <div className="message-input-container">
      <input
        type="text"
        className="message-input"
        placeholder="Type a message..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
      />
      <button className="send-button" onClick={handleSendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatApp;
