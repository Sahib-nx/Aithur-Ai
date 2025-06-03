import { LogOut, X, Menu, Plus, Clock, Sparkles, Trash2, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import user from "../../public/user.png"
import { useAuth } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../utils/axiosIntance'
import { ChatManager } from '../../utils/chatManager'

const Sidebar = ({ isOpen, toggleSidebar, onChatSelect, onNewChat, refreshHistory }) => {
    const userData = JSON.parse(localStorage.getItem("user"))
    const [hoveredItem, setHoveredItem] = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [currentChatId, setCurrentChatId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    // Load chat history and current chat
    useEffect(() => {
        loadChatHistory()
        setCurrentChatId(ChatManager.getCurrentChatId())
    }, [refreshHistory])

    const loadChatHistory = () => {
        setChatHistory(ChatManager.getChatHistory())
    }

    const [, setAuthUser] = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axiosInstance.get("/user/logout", {
                withCredentials: true
            });
            console.log(response.data)
            localStorage.removeItem("user");
            localStorage.removeItem("localStrToken");

            // // Clear chat data on logout
            localStorage.removeItem(ChatManager.STORAGE_KEY);
            localStorage.removeItem(ChatManager.CURRENT_CHAT_KEY);

            setAuthUser(null);
            navigate("/login")
            toast.success(response.data.message);
        } catch (error) {
            console.error(error);
            toast.error("Logout Failed")
        }
    }

    const handleNewChat = () => {
        const newChatId = ChatManager.createNewChat();
        setCurrentChatId(newChatId);
        onNewChat?.(newChatId);
        loadChatHistory(); // Refresh history
        toggleSidebar(); // Close sidebar on mobile after action
    }

    const handleChatSelect = (chatId) => {
        ChatManager.setCurrentChatId(chatId);
        setCurrentChatId(chatId);
        onChatSelect?.(chatId);
        toggleSidebar(); // Close sidebar on mobile after action
    }

    const handleDeleteChat = (chatId, e) => {
        e.stopPropagation(); // Prevent chat selection when deleting
        setDeleteConfirm(chatId);
    }

    const confirmDelete = (chatId) => {
        ChatManager.deleteChat(chatId);

        // If deleted chat was current, create new one and update state
        const newCurrentId = ChatManager.getCurrentChatId();
        setCurrentChatId(newCurrentId);

        // Notify parent components
        onNewChat?.(newCurrentId);
        loadChatHistory();
        setDeleteConfirm(null);

        toast.success("Chat deleted successfully");
    }

    const cancelDelete = () => {
        setDeleteConfirm(null);
    }

    return (
        <>
            {/* Enhanced Mobile Menu Button - Blends with prompt background */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden fixed top-4 left-4 z-50 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/10"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <Menu className="text-gray-300 hover:text-white w-6 h-6 transition-colors duration-200" />
                </button>
            )}

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative inset-y-0 left-0 z-40 lg:z-0
                w-80 lg:w-full h-full
                transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                transition-transform duration-300 ease-in-out
                bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900
                border-r border-purple-500/20
                backdrop-blur-xl
                flex flex-col
                shadow-2xl lg:shadow-none
            `}>
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                {/* Header */}
                <div className="relative p-6 border-b border-gradient-to-r from-purple-500/20 to-cyan-500/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                Aithur
                            </div>
                        </div>

                        {/* Enhanced Close button for mobile - matches menu button style */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                        >
                            <X className="text-gray-400 group-hover:text-white w-5 h-5 transition-colors duration-200" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <button
                        onClick={handleNewChat}
                        onMouseEnter={() => setHoveredItem('newChat')}
                        onMouseLeave={() => setHoveredItem(null)}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                        {/* Animated background */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 transition-opacity duration-300 ${hoveredItem === 'newChat' ? 'opacity-100' : ''}`} />

                        <div className="relative flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">New Conversation</span>
                        </div>

                        {/* Shine effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-transform duration-700 ${hoveredItem === 'newChat' ? 'translate-x-full' : '-translate-x-full'}`} />
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-6 pb-4 relative z-10">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-4">
                            <Clock className="w-4 h-4" />
                            <span>Recent Conversations</span>
                        </div>

                        {chatHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-500 text-sm">No conversations yet</p>
                                <p className="text-gray-600 text-xs mt-1">Start a new chat to see your history</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`
                                            group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border
                                            ${currentChatId === chat.id
                                                ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30'
                                                : 'hover:bg-white/5 border-transparent hover:border-purple-500/20'
                                            }
                                        `}
                                        onClick={() => handleChatSelect(chat.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className={`
                                                    text-sm font-medium truncate
                                                    ${currentChatId === chat.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                                                `}>
                                                    {chat.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {chat.timestamp}
                                                </p>
                                            </div>

                                            {/* Enhanced Delete Button - Better mobile visibility */}
                                            <button
                                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                                className="opacity-70 lg:opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 flex-shrink-0 bg-white/5 lg:bg-transparent border border-white/10 lg:border-transparent hover:border-red-500/30"
                                                title="Delete chat"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors duration-200" />
                                            </button>
                                        </div>

                                        {/* Current chat indicator */}
                                        {currentChatId === chat.id && (
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Profile & Logout */}
                <div className="relative z-10 p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                            {userData?.profilePicture ? (
                                <img
                                    src={userData.profilePicture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={user}
                                    alt="Default User"
                                    className="w-6 h-6"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                                {userData?.username || userData?.email || 'User'}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                                {userData?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            onMouseEnter={() => setHoveredItem('logout')}
                            onMouseLeave={() => setHoveredItem(null)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Custom Scrollbar Styles */}
                <style jsx>{`
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-2">Delete Chat?</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                This action cannot be undone. The conversation will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => confirmDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default Sidebar