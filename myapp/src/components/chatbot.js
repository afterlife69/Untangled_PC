import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './chatbot.css'; // You'll need to create this CSS file with the styles from the provided code
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import LiveEmotionDetection from './emotionDetection';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Link } from 'react-router-dom';
const initialMessages = [
  
];

const Chat = () => {

  
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentTypingMessageId, setCurrentTypingMessageId] = useState(null);
  const [expressions, setExpressions] = useState({});
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        setLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypingMessageId]);

  const captureEmotions = async () => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      try {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections.length > 0) {
          return detections[0].expressions;
        }
      } catch (error) {
        console.error('Error detecting emotions:', error);
      }
    }
    return null;
  };

  const getDominantEmotion = async (emotions) => {
    if (emotions) {
      const emotionValues = Object.values(emotions);
      const maxVal = Math.max(...emotionValues);
      return Object.keys(emotions).find(key => emotions[key] === maxVal);
    }
    return null;
  };
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    const emotions = await captureEmotions();
    // get the dominant emotion
    let dominantEmotion = await getDominantEmotion(emotions);
    console.log(emotions);
    const newMessage = {
      id: Date.now(),
      person: {
      name: "user",
      avatar: require('../assets/user.png')
      },
      text: inputMessage,
      isUser: true
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    // Simulate bot response
    setIsBotTyping(true);
    axios.post("http://localhost:8000/chat", {prompt: '{prompt: '+inputMessage+'} {facial_emotion:{'+dominantEmotion+'}}'}).then((res) =>{
      setIsBotTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        person: {
          name: "Bot",
          avatar: require('../assets/bot.png')
        },
        text: res.data,
        isUser: false
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setCurrentTypingMessageId(botResponse.id);
    }).catch((err) => { 
      alert(err);
      setIsBotTyping(false);
     });
    
    // get username from local storage
    // parse json
    const username = JSON.parse(localStorage.getItem('user')).username;
    
    axios.post("http://localhost:8000/stats", {emotions: emotions, prompt: inputMessage, username : username}).then((res) => {
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    })
  };
  function handleLogout(){
    localStorage.removeItem('user');
  }
  return (
    <div className='chatMain'>
      <div className=''>
      <span className="container">
        <span className="checkbox-container">
          <input className="checkbox-trigger" type="checkbox" id="menu-checkbox" />
          <label className="menu-content" htmlFor="menu-checkbox">
            <ul>
              <Link to={'/chatb'} className='menuLink'><li>Chatbot</li></Link>
              <Link to={'/stats'} className='menuLink'><li>Statistics</li></Link>
              <Link onClick={handleLogout} to={'/'} className='menuLink'><li>Log out</li></Link>
            </ul>
            <span className="hamburger-menu"></span>
          </label>
          <div className="menu-overlay"></div>
        </span>
      </span>
    </div>
    <div className='chat__body'>
    <div className="--dark-theme" id="chat">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={0}
        height={0}
      />
      <div className="chat__conversation-board" ref={messageContainerRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat__conversation-board__message-container ${
              message.isUser ? 'reversed' : ''
            }`}
          >
            <div className="chat__conversation-board__message__person">
              <div className="chat__conversation-board__message__person__avatar">
                <img src={message.person.avatar} alt={message.person.name} />
              </div>
              <span className="chat__conversation-board__message__person__nickname">
                {message.person.name}
              </span>
            </div>
            <div className="chat__conversation-board__message__context">
              <div className="chat__conversation-board__message__bubble">
              {currentTypingMessageId === message.id ? (
                  <TypewriterEffect 
                    text={message.text}
                    scrollToBottom={scrollToBottom}
                    onComplete={() => {
                      setCurrentTypingMessageId(null);
                      setIsBotTyping(false);
                    }}
                  />
                ) : (
                  <span><ReactMarkdown components={{
                    p: ({node, ...props}) => <p style={{margin: 0}} {...props} />,
                    a: ({node, ...props}) => <a style={{color: '#4a90e2'}} {...props} />
                  }}>{message.text}</ReactMarkdown></span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isBotTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat__conversation-panel">
        <div className="chat__conversation-panel__container">
          <input
            className="chat__conversation-panel__input panel-item"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button
            className="chat__conversation-panel__button panel-item btn-icon send-message-button"
            onClick={handleSendMessage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="chat__conversation-board__message-container">
    <div className="chat__conversation-board__message__person">
      <div className="chat__conversation-board__message__person__avatar">
        <img src={require('../assets/bot.png')} alt="Bot" />
      </div>
    </div>
    <div className="chat__conversation-board__message__context">
      <div className="chat__conversation-board__message__bubble typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

const TypewriterEffect = ({ text,scrollToBottom, speed = 1, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        scrollToBottom(); // Add this line to scroll after each character
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span><ReactMarkdown style={{borderRadius:'30px'}}>{displayedText}</ReactMarkdown></span>
};



export default Chat;