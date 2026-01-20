import { LogOut, X, Menu, Plus, Clock, Sparkles, Trash2, MessageSquare, Search, Edit3, Archive, Settings } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
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
    const [searchQuery, setSearchQuery] = useState('')
    const [editingChatId, setEditingChatId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [showArchived, setShowArchived] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [, setAuthUser] = useAuth();
    const navigate = useNavigate();

    // Optimized chat history loading with error handling
    const loadChatHistory = useCallback(async () => {
        try {
            setIsLoading(true)
            const history = ChatManager.getChatHistory()
            setChatHistory(history)
        } catch (error) {
            console.error('Failed to load chat history:', error)
            toast.error('Failed to load chat history')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load chat history and current chat
    useEffect(() => {
        loadChatHistory()
        setCurrentChatId(ChatManager.getCurrentChatId())
    }, [refreshHistory, loadChatHistory])

    // Filtered and sorted chat history
    const filteredChatHistory = useMemo(() => {
        let filtered = chatHistory.filter(chat => {
            const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesArchive = showArchived ? chat.archived : !chat.archived
            return matchesSearch && matchesArchive
        })

        // Sort by timestamp (most recent first)
        return filtered.sort((a, b) => new Date(b.lastActivity || b.timestamp) - new Date(a.lastActivity || a.timestamp))
    }, [chatHistory, searchQuery, showArchived])

    // Grouped chat history by date
    const groupedChatHistory = useMemo(() => {
        const groups = {
            Today: [],
            Yesterday: [],
            'This Week': [],
            'This Month': [],
            Older: []
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        filteredChatHistory.forEach(chat => {
            const chatDate = new Date(chat.lastActivity || chat.timestamp)
            
            if (chatDate >= today) {
                groups.Today.push(chat)
            } else if (chatDate >= yesterday) {
                groups.Yesterday.push(chat)
            } else if (chatDate >= weekAgo) {
                groups['This Week'].push(chat)
            } else if (chatDate >= monthAgo) {
                groups['This Month'].push(chat)
            } else {
                groups.Older.push(chat)
            }
        })

        return groups
    }, [filteredChatHistory])

    const handleLogout = async () => {
        try {
            setIsLoading(true)
            const response = await axiosInstance.get("/user/logout", {
                withCredentials: true
            });
            
            localStorage.removeItem("user");
            localStorage.removeItem("localStrToken");
            localStorage.removeItem(ChatManager.STORAGE_KEY);
            localStorage.removeItem(ChatManager.CURRENT_CHAT_KEY);

            setAuthUser(null);
            navigate("/login")
            toast.success(response.data.message);
        } catch (error) {
            console.error(error);
            toast.error("Logout Failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewChat = useCallback(() => {
        const newChatId = ChatManager.createNewChat();
        setCurrentChatId(newChatId);
        onNewChat?.(newChatId);
        loadChatHistory();
        toggleSidebar();
    }, [onNewChat, loadChatHistory, toggleSidebar])

    const handleChatSelect = useCallback((chatId) => {
        ChatManager.setCurrentChatId(chatId);
        setCurrentChatId(chatId);
        onChatSelect?.(chatId);
        toggleSidebar();
    }, [onChatSelect, toggleSidebar])

    const handleDeleteChat = useCallback((chatId, e) => {
        e.stopPropagation();
        setDeleteConfirm(chatId);
    }, [])

    const confirmDelete = useCallback((chatId) => {
        ChatManager.deleteChat(chatId);
        const newCurrentId = ChatManager.getCurrentChatId();
        setCurrentChatId(newCurrentId);
        onNewChat?.(newCurrentId);
        loadChatHistory();
        setDeleteConfirm(null);
        toast.success("Chat deleted successfully");
    }, [onNewChat, loadChatHistory])

    const handleEditChat = useCallback((chatId, currentTitle, e) => {
        e.stopPropagation();
        setEditingChatId(chatId);
        setEditTitle(currentTitle);
    }, [])

    const handleSaveEdit = useCallback((chatId) => {
        if (editTitle.trim()) {
            ChatManager.updateChatTitle(chatId, editTitle.trim());
            loadChatHistory();
            toast.success("Chat title updated");
        }
        setEditingChatId(null);
        setEditTitle('');
    }, [editTitle, loadChatHistory])

    const handleArchiveChat = useCallback((chatId, e) => {
        e.stopPropagation();
        ChatManager.archiveChat(chatId);
        loadChatHistory();
        toast.success("Chat archived");
    }, [loadChatHistory])

    const handleKeyPress = useCallback((e, chatId) => {
        if (e.key === 'Enter') {
            handleSaveEdit(chatId);
        } else if (e.key === 'Escape') {
            setEditingChatId(null);
            setEditTitle('');
        }
    }, [handleSaveEdit])

    // Clear search when sidebar closes on mobile
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen])

    const renderChatItem = useCallback((chat) => (
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
                    {editingChatId === chat.id ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveEdit(chat.id)}
                            onKeyDown={(e) => handleKeyPress(e, chat.id)}
                            className="w-full bg-white/10 border border-purple-500/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <h3 className={`
                            text-sm font-medium truncate
                            ${currentChatId === chat.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                        `}>
                            {chat.title}
                        </h3>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                            {chat.timestamp}
                        </p>
                        {chat.messageCount && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {chat.messageCount}
                            </span>
                        )}
                        {chat.archived && (
                            <span className="text-xs text-amber-500 flex items-center gap-1">
                                <Archive className="w-3 h-3" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-70 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => handleEditChat(chat.id, chat.title, e)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
                        title="Edit title"
                    >
                        <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                    </button>
                    <button
                        onClick={(e) => handleArchiveChat(chat.id, e)}
                        className="p-1.5 rounded-lg hover:bg-amber-500/20 transition-all duration-200 border border-transparent hover:border-amber-500/30"
                        title={chat.archived ? "Unarchive" : "Archive"}
                    >
                        <Archive className="w-3.5 h-3.5 text-gray-400 hover:text-amber-400 transition-colors duration-200" />
                    </button>
                    <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-200 border border-transparent hover:border-red-500/30"
                        title="Delete chat"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400 transition-colors duration-200" />
                    </button>
                </div>
            </div>

            {/* Current chat indicator */}
            {currentChatId === chat.id && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full" />
            )}
        </div>
    ), [currentChatId, editingChatId, editTitle, handleChatSelect, handleEditChat, handleSaveEdit, handleKeyPress, handleArchiveChat, handleDeleteChat])

    return (
        <>
            {/* Enhanced Mobile Menu Button */}
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

                        {/* Close button for mobile */}
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
                        disabled={isLoading}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 transition-opacity duration-300 ${hoveredItem === 'newChat' ? 'opacity-100' : ''}`} />
                        <div className="relative flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">New Conversation</span>
                        </div>
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-transform duration-700 ${hoveredItem === 'newChat' ? 'translate-x-full' : '-translate-x-full'}`} />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="relative p-4 border-b border-white/10">
                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-200"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                showArchived 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <Archive className="w-3.5 h-3.5" />
                            {showArchived ? 'Hide Archived' : 'Show Archived'}
                        </button>
                        
                        <div className="text-xs text-gray-500">
                            {filteredChatHistory.length} chat{filteredChatHistory.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredChatHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                {searchQuery ? <Search className="w-8 h-8 text-gray-500" /> : <Sparkles className="w-8 h-8 text-gray-500" />}
                            </div>
                            <p className="text-gray-500 text-sm">
                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                                {searchQuery ? 'Try a different search term' : 'Start a new chat to see your history'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedChatHistory).map(([period, chats]) => 
                                chats.length > 0 && (
                                    <div key={period}>
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-3 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2 rounded-lg">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{period}</span>
                                            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent ml-2" />
                                        </div>
                                        <div className="space-y-2">
                                            {chats.map(renderChatItem)}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* User Profile & Settings */}
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
                        <div className="flex items-center gap-1">
                            <button
                                className="p-2 rounded-lg hover:bg-gray-500/20 transition-colors group"
                                title="Settings"
                            >
                                <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                            </button>
                            <button
                                onClick={handleLogout}
                                onMouseEnter={() => setHoveredItem('logout')}
                                onMouseLeave={() => setHoveredItem(null)}
                                disabled={isLoading}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
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
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => confirmDelete(deleteConfirm)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Sidebar;