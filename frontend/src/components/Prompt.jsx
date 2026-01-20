import { ArrowUp, Bot, Zap, Sparkles, Code, Copy, RotateCcw, Trash2, Settings, Volume2, Check } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, tomorrow as CodeTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { axiosInstance } from '../../utils/axiosIntance'
import { ChatManager } from '../../utils/chatManager'

const Prompt = ({ selectedChatId, onChatUpdate }) => {
    const [inputValue, setInputValue] = useState("");
    const [typeMessage, setTypeMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [copiedStates, setCopiedStates] = useState({});
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const promptEndRef = useRef();
    
    const [prompt, setPrompt] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);

    // Initialize or load chat
    useEffect(() => {
        let chatId = selectedChatId || ChatManager.getCurrentChatId();
        
        if (!chatId) {
            chatId = ChatManager.createNewChat();
        }
        
        setCurrentChatId(chatId);
        ChatManager.setCurrentChatId(chatId);
        
        const chat = ChatManager.getChat(chatId);
        setPrompt(chat?.messages || []);
    }, [selectedChatId]);

    // Auto-save chat on prompt changes
    useEffect(() => {
        if (currentChatId && prompt.length > 0) {
            ChatManager.saveChat(currentChatId, prompt);
            onChatUpdate?.();
        }
    }, [prompt, currentChatId, onChatUpdate]);

    // Auto-scroll to bottom
    useEffect(() => {
        promptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prompt, isTyping]);

    // Your original send handler with optimizations
    const handleSend = useCallback(async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isTyping) return;

        setTypeMessage(trimmed);
        setInputValue("");
        setIsTyping(true);

        try {
            const localstrToken = localStorage.getItem("localStrToken");

            const response = await axiosInstance.post("/aithurAi/prompt",
                { content: trimmed },
                {
                    headers: {
                        authorization: `Bearer ${localstrToken}`
                    },
                    withCredentials: true
                }
            );

            setPrompt(prev => [
                ...prev,
                { role: "user", content: trimmed },
                { role: "assistant", content: response.data.reply }
            ]);

        } catch (error) {
            console.error('API Error:', error);
            setPrompt(prev => [
                ...prev,
                { role: "user", content: trimmed },
                { role: "assistant", content: "Something went wrong with the response" }
            ]);
        } finally {
            setIsTyping(false);
            setTypeMessage("");
        }
    }, [inputValue, isTyping]);

    // Enhanced keyboard handling
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'Escape') {
            setInputValue("");
            textareaRef.current?.blur();
        }
    }, [handleSend]);

    // Quick action handler
    const handleQuickAction = useCallback((actionText) => {
        setInputValue(actionText);
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
    }, []);

    // Auto-resize textarea
    const autoResize = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 150);
            textarea.style.height = `${newHeight}px`;
        }
    }, []);

    useEffect(() => {
        autoResize();
    }, [inputValue, autoResize]);

    // Copy message content with feedback
    const copyToClipboard = useCallback(async (text, id = 'default') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedStates(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    // Clear chat
    const clearChat = useCallback(() => {
        if (window.confirm('Are you sure you want to clear this chat?')) {
            setPrompt([]);
        }
    }, []);

    // Regenerate last response
    const regenerateResponse = useCallback(async () => {
        if (prompt.length < 2) return;
        
        const lastUserMessage = prompt[prompt.length - 2];
        if (lastUserMessage?.role === 'user') {
            // Remove last AI response and regenerate
            setPrompt(prev => prev.slice(0, -1));
            setInputValue(lastUserMessage.content);
            setTimeout(() => handleSend(), 100);
        }
    }, [prompt, handleSend]);

    // Text-to-speech for AI responses
    const speakText = useCallback((text) => {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            speechSynthesis.speak(utterance);
        }
    }, []);

    // Stop speech function
    const stopSpeech = useCallback(() => {
        if ('speechSynthesis' in window && isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSpeaking]);

    // Quick actions with enhanced options
    const quickActions = useMemo(() => [
        { icon: Code, text: "Help me debug this code", color: "from-blue-500 to-cyan-500" },
        { icon: Sparkles, text: "Write a creative story about", color: "from-purple-500 to-pink-500" },
        { icon: Zap, text: "Explain this concept simply:", color: "from-orange-500 to-red-500" },
    ], []);

    // Custom markdown components
    const markdownComponents = useMemo(() => ({
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            
            return !inline && match ? (
                <div className="relative group my-4">
                    <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-lg border border-white/10">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                            {match[1]}
                        </span>
                    </div>
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-b-lg border-x border-b border-white/10"
                        customStyle={{
                            margin: 0,
                            background: 'rgba(15, 23, 42, 0.8)',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code 
                    className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono" 
                    {...props}
                >
                    {children}
                </code>
            );
        },
        h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mb-4 mt-6 border-b border-white/20 pb-2">
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mb-3 mt-5">
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-lg font-medium text-white mb-2 mt-4">
                {children}
            </h3>
        ),
        p: ({ children }) => (
            <p className="text-gray-100 mb-3 leading-relaxed">
                {children}
            </p>
        ),
        ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-gray-100 ml-4">
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-100 ml-4">
                {children}
            </ol>
        ),
        li: ({ children }) => (
            <li className="text-gray-100 mb-1">
                {children}
            </li>
        ),
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300 my-4 bg-white/5 py-2 rounded-r">
                {children}
            </blockquote>
        ),
        strong: ({ children }) => (
            <strong className="font-semibold text-white">
                {children}
            </strong>
        ),
        em: ({ children }) => (
            <em className="italic text-gray-200">
                {children}
            </em>
        ),
        a: ({ href, children }) => (
            <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
                {children}
            </a>
        ),
        table: ({ children }) => (
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-white/20 rounded-lg overflow-hidden">
                    {children}
                </table>
            </div>
        ),
        thead: ({ children }) => (
            <thead className="bg-white/10">
                {children}
            </thead>
        ),
        th: ({ children }) => (
            <th className="px-4 py-2 text-left text-white font-medium border-b border-white/20">
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className="px-4 py-2 text-gray-100 border-b border-white/10">
                {children}
            </td>
        ),
    }), [copyToClipboard, copiedStates]);

    return (
        <div className='flex flex-col h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden'>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-cyan-400/5 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            {/* Header with controls */}
            <div className="relative z-10 p-4 flex justify-between items-center border-b border-white/10">
                <h1 className="text-xl font-semibold text-white">Aithur AI</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    {prompt.length > 0 && (
                        <>
                            <button
                                onClick={regenerateResponse}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                title="Regenerate last response"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={clearChat}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                                title="Clear chat"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="relative z-10 p-4 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            Auto-scroll to bottom
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            Sound notifications
                        </label>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className='flex-1 flex flex-col relative z-10'>
                {prompt.length === 0 && !typeMessage ? (
                    <div className='flex-1 flex flex-col items-center justify-center px-4 min-h-0'>
                        {/* Logo and Welcome */}
                        <div className='text-center mb-12 animate-fade-in'>
                            <div className='mb-10 relative'>
                                <div className='w-60 h-60 mx-auto flex items-center justify-center relative overflow-hidden'>
                                    <img src="logo.png" alt="Aithur Logo" className="max-h-50 drop-shadow-[0_0_4px_#00FFFF]" />
                                </div>
                                <div className='absolute -inset-10 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full blur-xl animate-pulse' />
                            </div>
                            <p className="text-gray-400 text-lg">How can I help you today?</p>
                        </div>

                        {/* Quick Actions */}
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl animate-fade-in px-2 sm:px-0'>
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action.text)}
                                    className='group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10'
                                    aria-label={`Quick action: ${action.text}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 rounded-xl sm:rounded-2xl transition-opacity duration-300`} />
                                    <div className='relative z-10 flex flex-col items-center text-center'>
                                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                            <action.icon className='w-4 h-4 sm:w-6 sm:h-6 text-white' />
                                        </div>
                                        <span className='text-gray-300 font-medium group-hover:text-white transition-colors duration-300 text-sm sm:text-base'>
                                            {action.text}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Enhanced Scrollable Messages Area */
                    <div className='flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 py-6 space-y-6 min-h-0 max-h-[72vh] sm:max-h-[75vh] lg:max-h-[78vh]'>
                        {/* Show current typed message first */}
                        {typeMessage && (
                            <div className="w-full flex justify-end animate-slide-up">
                                <div className="w-[65%] sm:w-[40%] lg:w-[50%] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap shadow-xl break-words">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className='w-6 h-6 bg-white rounded-full' />
                                        <span className="text-xs text-blue-100">You</span>
                                    </div>
                                    {typeMessage}
                                </div>
                            </div>
                        )}

                        {/* Show conversation history */}
                        {prompt.map((message, index) => (
                            <div
                                key={index}
                                className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up group`}
                            >
                                {message.role === 'assistant' ? (
                                    <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-100 rounded-xl px-4 py-3 text-sm shadow-xl relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                                    <Bot className='w-4 h-4 text-white' />
                                                </div>
                                                <span className="text-xs text-gray-400">Aithur AI</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => copyToClipboard(message.content, `msg-${index}`)}
                                                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                                                    title="Copy message"
                                                >
                                                    {copiedStates[`msg-${index}`] ? (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="prose prose-invert max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={markdownComponents}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                        <div className="text-xs mt-3 text-gray-500 border-t border-white/10 pt-2">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-[65%] sm:w-[40%] lg:w-[50%] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 text-sm shadow-xl break-words overflow-wrap-anywhere relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className='w-6 h-6 bg-white rounded-full' />
                                                <span className="text-xs text-blue-100">You</span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(message.content, `user-${index}`)}
                                                className="p-1 rounded hover:bg-white/10 text-blue-100 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Copy message"
                                            >
                                                {copiedStates[`user-${index}`] ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                                        <div className="text-xs mt-2 text-blue-100 border-t border-white/20 pt-2">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Enhanced Loading Indicator */}
                        {isTyping && (
                            <div className='flex justify-start animate-slide-up'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center'>
                                        <Bot className='w-6 h-6 text-white animate-pulse' />
                                    </div>
                                    <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
                                        <div className='flex space-x-2'>
                                            <div className='w-2 h-2 bg-cyan-400 rounded-full animate-bounce' />
                                            <div className='w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75' />
                                            <div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150' />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">Aithur is thinking...</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={promptEndRef} />
                    </div>
                )}

                {/* Enhanced Input Section */}
                <div className='p-3 sm:p-4 sm:pb-16 lg:p-6 lg:pb-20 mt-auto'>
                    <div className='w-full max-w-4xl mx-auto relative px-2 sm:px-0'>
                        <div className={`relative bg-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-300 ${inputFocused
                            ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10'
                            : 'border-white/10 hover:border-white/20'
                            }`}>
                            {/* Glowing effect when focused */}
                            {inputFocused && (
                                <div className='absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur-xl' />
                            )}

                            <div className='relative p-3 lg:p-4'>
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    placeholder='Message Aithur... (Press Enter to send, Shift+Enter for new line)'
                                    className='w-full bg-transparent text-white placeholder-gray-400 text-base outline-none resize-none min-h-[20px] max-h-[120px] overflow-y-auto pr-24 leading-6'
                                    rows={1}
                                    disabled={isTyping}
                                    aria-label="Chat input"
                                    style={{
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                />
                            </div>

                            {/* Input Controls */}
                            <div className='absolute bottom-2 right-2 flex gap-2'>
                                {/* Send Button */}
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${inputValue.trim() && !isTyping
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-700 cursor-not-allowed'
                                        } w-10 h-10 flex items-center justify-center group`}
                                    title="Send message"
                                    aria-label="Send message"
                                >
                                    {inputValue.trim() && !isTyping && (
                                        <div className='absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                    )}
                                    <ArrowUp className={`w-5 h-5 text-white relative z-10 transition-transform duration-200 ${inputValue.trim() && !isTyping ? 'group-hover:translate-y-[-1px]' : ''
                                        }`} />
                                </button>
                            </div>
                        </div>

                        {/* Input hints */}
                        <div className="mt-2 text-xs text-gray-500 text-center">
                            Press Enter to send • Shift+Enter for new line • ESC to clear
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Styles */}
            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                /* Custom scrollbar */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.3);
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.5);
                }
                
                /* Focus styles for accessibility */
                button:focus-visible {
                    outline: 2px solid #8b5cf6;
                    outline-offset: 2px;
                }
                
                textarea:focus-visible {
                    outline: none;
                }
                
                /* Smooth transitions */
                * {
                    transition-property: color, background-color, border-color, opacity, transform;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                /* Prose styling overrides for better integration */
                .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
                    color: white;
                }
                
                .prose p {
                    color: rgb(243 244 246);
                }
                
                .prose strong {
                    color: white;
                    font-weight: 600;
                }
                
                .prose em {
                    color: rgb(229 231 235);
                }
                
                .prose ul, .prose ol {
                    color: rgb(243 244 246);
                }
                
                .prose li {
                    color: rgb(243 244 246);
                }
                
                .prose blockquote {
                    color: rgb(209 213 219);
                    border-left-color: rgb(168 85 247);
                }
                
                .prose a {
                    color: rgb(34 211 238);
                }
                
                .prose a:hover {
                    color: rgb(103 232 249);
                }
                
                .prose code {
                    color: rgb(165 243 252);
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .prose pre {
                    background-color: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .prose table {
                    color: rgb(243 244 246);
                }
                
                .prose th {
                    color: white;
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .prose td {
                    color: rgb(243 244 246);
                }
            `}</style>
        </div>
    )
}

export default Prompt;