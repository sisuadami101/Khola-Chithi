import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage } from '../types';
import Card from './ui/Card';

interface ChatModalProps {
    sessionId: string;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ sessionId, onClose }) => {
    const { user } = useAuth();
    const { getChatSession, addChatMessage } = useData();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const session = getChatSession(sessionId);
        if (session) {
            setMessages(session.messages);
        }
    }, [sessionId, getChatSession]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && user) {
            addChatMessage(sessionId, { senderId: user.id, text: newMessage });
            // Simulate moderator reply after a delay
            setTimeout(() => {
                addChatMessage(sessionId, { senderId: 'moderator_1', text: "ধন্যবাদ আপনার উত্তরের জন্য। বিষয়টি নিয়ে আরও ভাবার সুযোগ দিন।" });
            }, 1500);
            setNewMessage('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
            <Card className="w-full max-w-lg h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">{t('chat.title')}</h2>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                <div ref={chatBodyRef} className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                    <p className="text-center text-xs text-gray-500 p-2 bg-yellow-100 rounded-full">{t('chat.welcome')}</p>
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === user?.id ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('chat.placeholder')}
                            className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="bg-accent text-text-dark font-bold px-6 rounded-full">{t('chat.send')}</button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default ChatModal;
