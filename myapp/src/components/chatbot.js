import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './chatbot.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Webcam from 'react-webcam';
import AWS from 'aws-sdk';
import { Buffer } from 'buffer';
// Configure AWS
AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: 'AKIAQZFG4ZBR5OTINTGS',
  secretAccessKey: '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'
});

const rekognition = new AWS.Rekognition();

const initialMessages = [];

const Chat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentTypingMessageId, setCurrentTypingMessageId] = useState(null);
  const webcamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };
   
  const capture = useCallback(() => {
    return new Promise((resolve, reject) => {
      const imageSrc = webcamRef.current.getScreenshot();
  
      // Prepare the image data for Rekognition
      const params = {
        Image: {
          Bytes: Buffer.from(imageSrc.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        },
        Attributes: ['ALL']
      };
  
      // Call the Rekognition API
      rekognition.detectFaces(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.FaceDetails[0].Emotions);
        }
      });
    });
  }, [webcamRef, rekognition]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypingMessageId]);

  

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    let emotions = [];
  try {
    emotions = await capture();
    
  } catch (err) {
    
  }

  // Determine the dominant emotion
  const dominantEmotion = emotions.length > 0
    ? emotions.reduce((prev, current) => (prev.Confidence > current.Confidence ? prev : current)).Type
    : 'ignore'; 
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
    setIsBotTyping(true);

    axios.post("http://localhost:8000/chat", {
      prompt: `{ prompt:${inputMessage}}, {facial_emotion:${dominantEmotion}}`
    })
      .then((res) => {
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
      })
      .catch((err) => {
        // alert(err);
        setIsBotTyping(false);
      });
    if(dominantEmotion !== 'ignore') {

      const username = JSON.parse(localStorage.getItem('user')).username;
      const emotionsObj = emotions.reduce((acc, emotion) => {
        acc[emotion.Type.toLowerCase()] = emotion.Confidence;
        return acc;
      }, {});
      // console.log(emotionsObj);
      axios.post("http://localhost:8000/stats", { emotionsObj, prompt: inputMessage, username })
        .then((res) => {

        })
        .catch((err) => {
          // console.log(err);
        });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
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
      width={600}
      height={400}
      style={{opacity: 0}}
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