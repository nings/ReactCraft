import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askArchitect } from '../services/geminiService';

interface ChatOverlayProps {
    onClose: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello Builder! I am the AI Architect. Need ideas for what to build? Just ask!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        (messagesEndRef.current as any)?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        const response = await askArchitect(userMsg);
        
        setMessages(prev => [...prev, { role: 'model', text: response }]);
        setIsLoading(false);
    };

    return (
        <>
            {/* Header */}
            <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-sky-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Architect AI
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[80%] rounded-lg p-3 text-sm
                            ${msg.role === 'user' 
                                ? 'bg-sky-600 text-white rounded-br-none' 
                                : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 rounded-lg p-3 rounded-bl-none flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-slate-800 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput((e.target as any).value)}
                        placeholder="Ask how to build a castle..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </>
    );
};