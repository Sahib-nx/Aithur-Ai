export class ChatManager {
    static STORAGE_KEY = 'aithur_chats';
    static CURRENT_CHAT_KEY = 'current_chat_id';

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Generate chat title from first message
    static generateTitle(messages) {
        const firstUserMessage = messages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.slice(0, 50).trim() + 
                   (firstUserMessage.content.length > 50 ? '...' : '');
        }
        return `New Chat ${new Date().toLocaleDateString()}`;
    }

    // Get all chats from localStorage
    static getAllChats() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }

    // Get current chat ID
    static getCurrentChatId() {
        return localStorage.getItem(this.CURRENT_CHAT_KEY);
    }

    // Set current chat ID
    static setCurrentChatId(chatId) {
        localStorage.setItem(this.CURRENT_CHAT_KEY, chatId);
    }

    // Get specific chat
    static getChat(chatId) {
        const chats = this.getAllChats();
        return chats[chatId] || null;
    }

    // Save chat
    static saveChat(chatId, messages) {
        if (!messages.length) return;
        
        const chats = this.getAllChats();
        const existingChat = chats[chatId];
        
        chats[chatId] = {
            id: chatId,
            messages,
            title: existingChat?.title || this.generateTitle(messages),
            updatedAt: Date.now(),
            createdAt: existingChat?.createdAt || Date.now()
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chats));
    }

    // Create new chat
    static createNewChat() {
        const newChatId = this.generateId();
        this.setCurrentChatId(newChatId);
        return newChatId;
    }

    // Get chat history for sidebar (sorted by updatedAt)
    static getChatHistory() {
        const chats = this.getAllChats();
        return Object.values(chats)
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map(chat => ({
                id: chat.id,
                title: chat.title,
                timestamp: this.formatTimestamp(chat.updatedAt)
            }));
    }

    // Format timestamp
    static formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    // Delete chat
    static deleteChat(chatId) {
        const chats = this.getAllChats();
        delete chats[chatId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chats));
        
        // If deleted chat was current, create new one
        if (this.getCurrentChatId() === chatId) {
            this.createNewChat();
        }
    }
}