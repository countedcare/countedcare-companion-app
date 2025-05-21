
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bot, Send } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello, I'm your CareAI Assistant. How can I help with your caregiving questions today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response - in a production app, this would call an AI API
    setTimeout(() => {
      const questions = [
        "What tax benefits are available for caregivers?",
        "How can I find local support groups?",
        "What respite care options are available?",
        "Are there any caregiver training programs?",
        "How do I manage medication schedules?",
      ];
      
      let response = "I'm here to help with caregiving resources. ";
      
      // Sample responses based on keywords
      const userQ = input.toLowerCase();
      
      if (userQ.includes('tax') || userQ.includes('deduction') || userQ.includes('credit')) {
        response += "Caregivers may qualify for tax benefits like the Child and Dependent Care Credit, Medical Expense Deductions, or Dependent Care FSAs. Check the resources tab for official IRS publications or consult with a tax professional for your specific situation.";
      } else if (userQ.includes('support group') || userQ.includes('community')) {
        response += "Local support groups can be found through organizations like the Family Caregiver Alliance, hospitals, or community centers. You can filter the resources by your ZIP code to find nearby support.";
      } else if (userQ.includes('respite') || userQ.includes('break') || userQ.includes('time off')) {
        response += "Respite care provides temporary relief for primary caregivers. Options include in-home care services, adult day centers, or short-term nursing facilities. Many states have respite care programs that may help with costs.";
      } else if (userQ.includes('training') || userQ.includes('learn') || userQ.includes('skills')) {
        response += "Many hospitals, community colleges, and organizations offer caregiver training programs. The Red Cross, Alzheimer's Association, and local Area Agencies on Aging often provide courses on caregiving skills.";
      } else if (userQ.includes('medication') || userQ.includes('medicine') || userQ.includes('pills')) {
        response += "Managing medications can be challenging. Consider using pill organizers, setting alarms, or medication management apps. Some pharmacies also offer blister packs or other organization systems.";
      } else {
        response += "I'd be happy to help you find information about that. You might want to check the resources section for more detailed information, or ask me about common topics like tax benefits, support groups, respite care, training programs, or medication management.";
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Bot className="mr-2 h-5 w-5" />
        <h2 className="text-lg font-semibold">CareAI Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "flex w-max max-w-[80%] rounded-lg p-4",
              message.role === 'user' 
                ? "ml-auto bg-primary text-primary-foreground" 
                : "bg-muted"
            )}
          >
            {message.content}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
            <span>AI is thinking</span>
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about caregiving..."
            className="min-h-[60px] flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
