import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { sendChatMessage } from '../services/apiClient';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your Breast Health Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    // Temporary API key storage (in real app, use .env or secure backend proxy)
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage(input, apiKey);
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now. Please check your connection or API key." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 p-4 bg-[var(--color-secondary)] text-white rounded-full shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all transform hover:scale-105 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <MessageCircle size={28} />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-secondary)] to-pink-400 rounded-t-2xl text-white">
                    <div className="flex items-center gap-2">
                        <Bot size={24} />
                        <div>
                            <h3 className="font-bold text-sm">Breast Health Assistant</h3>
                            <p className="text-[10px] opacity-90">AI-powered support</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* API Key Prompt (Simple implementation for demo) */}
                <div className="px-4 py-2 bg-slate-50 border-b text-xs flex justify-between items-center text-slate-500">
                    <span>Powered by Gemini</span>
                    <button onClick={() => setShowKeyInput(!showKeyInput)} className="underline hover:text-slate-700">Settings</button>
                </div>
                {showKeyInput && (
                    <div className="p-2 bg-slate-100 border-b">
                        <input
                            type="password"
                            placeholder="Enter Gemini API Key"
                            className="w-full text-xs p-1 border rounded"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                    ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question..."
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-[var(--color-secondary)] text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
