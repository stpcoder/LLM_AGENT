import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SERVER_URL = "http://localhost:11437";
const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"], // WebSocket 및 폴링 지원
});

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [responseTime, setResponseTime] = useState(null); 
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    socket.on('response', (data) => {
      const endTime = Date.now();
      setResponseTime(endTime);
      setChat((prevChat) => [...prevChat, { sender: 'server', text: data.response }]);
    });

    socket.on('error', (data) => {
      setChat((prevChat) => [...prevChat, { sender: 'server', text: data.error }]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const startTime_now = Date.now();
    socket.emit('generate', { prompt: message });
    setStartTime(startTime_now);
    setChat((prevChat) => [...prevChat, { sender: 'user', text: message }]);
    setMessage('');
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
        <div className="h-96 overflow-y-scroll mb-4">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-2 rounded w-max ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        {startTime && responseTime && responseTime - startTime > 0 && (
          <div className="mb-4 text-sm text-gray-500 text-center">
            응답 소요 시간: {responseTime - startTime}ms
          </div>
        )}
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메세지를 입력하세요"
            className="flex-1 px-4 py-2 border rounded-l focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
