import { ArrowUp, Bot, Zap, Sparkles, Code } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, tomorrow as CodeTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import logo from "../../public/logo.png"
import { axiosInstance } from '../../utils/axiosIntance'
import { ChatManager } from '../../utils/chatManager'

const Prompt = ({ selectedChatId, onChatUpdate }) => {
    const [inputValue, setInputValue] = useState("");
    const [typeMessage, setTypeMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [prompt, setPrompt] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const promptEndRef = useRef();

    // Initialize or load chat
    useEffect(() => {
        let chatId = selectedChatId || ChatManager.getCurrentChatId();
        
        if (!chatId) {
            chatId = ChatManager.createNewChat();
        }
        
        setCurrentChatId(chatId);
        ChatManager.setCurrentChatId(chatId);
        
        // Load chat messages
        const chat = ChatManager.getChat(chatId);
        setPrompt(chat?.messages || []);
    }, [selectedChatId]);

    // Auto-save chat on prompt changes
    useEffect(() => {
        if (currentChatId && prompt.length > 0) {
            ChatManager.saveChat(currentChatId, prompt);
            onChatUpdate?.(); // Notify parent to update chat history
        }
    }, [prompt, currentChatId]);

    useEffect(() => {
        promptEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [prompt, isTyping])

    // Enhanced code theme matching your dark aesthetic
    const codeTheme = {
        ...oneDark,
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
        }
    };

    const handleSend = async () => {
        const trimmed = inputValue.trim()
        if (!trimmed) return;

        setTypeMessage(trimmed)
        setInputValue("")
        setIsTyping(true)

        try {
            const localstrToken = localStorage.getItem("localStrToken")

            const response = await axiosInstance.post("/aithurAi/prompt",
                { content: trimmed },
                {
                    headers: {
                        authorization: `Bearer ${localstrToken}`
                    },
                    withCredentials: true
                }
            )

            setPrompt((prev) => [
                ...prev,
                { role: "user", content: trimmed },
                { role: "assistant", content: response.data.reply }
            ])

        } catch (error) {
            setPrompt((prev) => [
                ...prev,
                { role: "user", content: trimmed },
                { role: "assistant", content: "Something went wrong with the response" }
            ])
        } finally {
            setIsTyping(false)
            setTypeMessage("")
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleQuickAction = (actionText) => {
        setInputValue(actionText)
        setTimeout(() => {
            textareaRef.current?.focus()
        }, 0)
    }

    const autoResize = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            const newHeight = Math.min(textarea.scrollHeight, 150)
            textarea.style.height = `${newHeight}px`
        }
    }

    useEffect(() => {
        autoResize()
    }, [inputValue])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [prompt, isTyping])

    // Quick action suggestions
    const quickActions = [
        { icon: Code, text: "Help me code", color: "from-blue-500 to-cyan-500" },
        { icon: Sparkles, text: "Creative writing", color: "from-purple-500 to-pink-500" },
        { icon: Zap, text: "Quick summary", color: "from-orange-500 to-red-500" },
    ]

    return (
        <div className='flex flex-col h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden'>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-cyan-400/5 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            {/* Main Content Area */}
            <div className='flex-1 flex flex-col relative z-10'>

                {/* Welcome Section or Messages */}
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
                        </div>

                        {/* Quick Actions */}
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl animate-fade-in px-2 sm:px-0'>
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action.text)}
                                    className='group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10'
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

                        {/* Show conversation history from prompt array */}
                        {prompt.map((message, index) => (
                            <div
                                key={index}
                                className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                            >
                                {message.role === 'assistant' ? (
                                    // 🧠 Full-width assistant response with ReactMarkdown
                                    <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-100 rounded-xl px-4 py-3 text-sm shadow-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                                <Bot className='w-4 h-4 text-white' />
                                            </div>
                                            <span className="text-xs text-gray-400">Aithur AI</span>
                                        </div>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={codeTheme}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            className="rounded-lg mt-2 border border-white/10"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, "")}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code
                                                            className="bg-slate-800/80 text-cyan-400 px-2 py-1 rounded border border-white/10"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                h1: ({ children }) => (
                                                    <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>
                                                ),
                                                h2: ({ children }) => (
                                                    <h2 className="text-lg font-semibold text-white mb-2 mt-3">{children}</h2>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="text-md font-medium text-white mb-2 mt-2">{children}</h3>
                                                ),
                                                p: ({ children }) => (
                                                    <p className="text-gray-100 mb-3 leading-relaxed">{children}</p>
                                                ),
                                                ul: ({ children }) => (
                                                    <ul className="list-disc list-inside text-gray-100 mb-3 space-y-1">{children}</ul>
                                                ),
                                                ol: ({ children }) => (
                                                    <ol className="list-decimal list-inside text-gray-100 mb-3 space-y-1">{children}</ol>
                                                ),
                                                li: ({ children }) => (
                                                    <li className="text-gray-100">{children}</li>
                                                ),
                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-300 bg-white/5 py-2 rounded-r-lg mb-3">
                                                        {children}
                                                    </blockquote>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="text-white font-semibold">{children}</strong>
                                                ),
                                                em: ({ children }) => (
                                                    <em className="text-cyan-300 italic">{children}</em>
                                                ),
                                                table: ({ children }) => (
                                                    <div className="overflow-x-auto mb-3">
                                                        <table className="min-w-full border border-white/20 rounded-lg overflow-hidden">
                                                            {children}
                                                        </table>
                                                    </div>
                                                ),
                                                thead: ({ children }) => (
                                                    <thead className="bg-white/10">{children}</thead>
                                                ),
                                                th: ({ children }) => (
                                                    <th className="border border-white/20 px-3 py-2 text-left text-white font-medium">
                                                        {children}
                                                    </th>
                                                ),
                                                td: ({ children }) => (
                                                    <td className="border border-white/20 px-3 py-2 text-gray-100">
                                                        {children}
                                                    </td>
                                                ),
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                        <div className="text-xs mt-3 text-gray-500 border-t border-white/10 pt-2">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ) : (
                                    // 👤 User message - bigger on mobile (65% instead of 45%), responsive width with proper text wrapping
                                    <div className="w-[65%] sm:w-[40%] lg:w-[50%] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 text-sm shadow-xl break-words overflow-wrap-anywhere">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className='w-6 h-6 bg-white rounded-full' />
                                            <span className="text-xs text-blue-100">You</span>
                                        </div>
                                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                                        <div className="text-xs mt-2 text-blue-100 border-t border-white/20 pt-2">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading Indicator (when AI is thinking) */}
                        {isTyping && (
                            <div className='flex justify-start animate-slide-up'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center'>
                                        <Bot className='w-6 h-6 text-white' />
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

                {/* Input Section */}
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
                                    placeholder='Message Aithur...'
                                    className='w-full bg-transparent text-white placeholder-gray-400 text-base outline-none resize-none min-h-[20px] max-h-[120px] overflow-y-auto pr-16 leading-6'
                                    rows={1}
                                    disabled={isTyping}
                                    style={{
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <div className='absolute bottom-2 right-2'>
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${inputValue.trim() && !isTyping
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-700 cursor-not-allowed'
                                        } w-10 h-10 flex items-center justify-center group`}
                                >
                                    {inputValue.trim() && !isTyping && (
                                        <div className='absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                                    )}
                                    <ArrowUp className={`w-5 h-5 text-white relative z-10 transition-transform duration-200 ${inputValue.trim() && !isTyping ? 'group-hover:translate-y-[-1px]' : ''
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                /* Custom scrollbar for better aesthetics */
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
            `}</style>
        </div>
    )
}

export default Prompt