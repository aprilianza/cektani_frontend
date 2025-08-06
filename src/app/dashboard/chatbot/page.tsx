'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, User, Bot, MessageCircle, Sparkles } from 'lucide-react';
import { sendMessage } from '@/lib/chatbot';
import { formatMessage } from '@/lib/formatter'

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya Pak Tani, asisten ahli botani Anda. Saya siap membantu dengan semua pertanyaan tentang tanaman, berkebun, dan pertanian. Ada yang ingin Anda tanyakan?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/auth/login');
    } else {
      setToken(savedToken);
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(inputMessage, token);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b flex-shrink-0">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pak Tani</h1>
            <p className="text-sm text-gray-600">Asisten Ahli Botani Anda</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm border-green-100 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
                {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              <div className={`max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-blue-500 text-white rounded-tr-md' : 'bg-white border border-green-100 text-gray-800 rounded-tl-md shadow-sm'}`}>
                  {message.role === 'assistant' ? <div className="text-sm leading-relaxed whitespace-pre-wrap">{formatMessage(message.content)}</div> : <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-green-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600">Pak Tani sedang mengetik...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-green-100 bg-white/80 backdrop-blur-sm p-6 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tanyakan tentang tanaman, berkebun, atau pertanian..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button onClick={() => setInputMessage('Bagaimana cara merawat tanaman hias?')} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Merawat Tanaman Hias
            </button>
            <button onClick={() => setInputMessage('Tips berkebun untuk pemula?')} className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Tips Berkebun
            </button>
            <button onClick={() => setInputMessage('Tanaman apa yang cocok untuk indoor?')} className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Tanaman Indoor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
