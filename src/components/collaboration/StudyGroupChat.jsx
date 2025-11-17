import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export default function StudyGroupChat({ group, currentUser, onSendMessage }) {
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [group.chat_messages]);

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage("");
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 rounded-t-lg">
                {group.chat_messages?.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    group.chat_messages?.map((msg, idx) => (
                        <div 
                            key={idx}
                            className={`flex ${msg.sender_email === currentUser.email ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] ${
                                msg.sender_email === currentUser.email 
                                    ? 'bg-violet-600 text-white' 
                                    : 'bg-white text-slate-900'
                            } rounded-lg p-3 shadow`}>
                                <p className="text-xs font-semibold mb-1 opacity-75">
                                    {msg.sender_name}
                                </p>
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-3 bg-white rounded-b-lg">
                <div className="flex gap-2">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your message..."
                        rows={2}
                        className="resize-none"
                    />
                    <Button onClick={handleSend} disabled={!message.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}