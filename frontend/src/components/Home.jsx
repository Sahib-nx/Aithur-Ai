import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Prompt from '../components/Prompt'

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [selectedChatId, setSelectedChatId] = useState(null)

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleNewChat = (newChatId) => {
        setSelectedChatId(newChatId)
    }

    const handleChatSelect = (chatId) => {
        setSelectedChatId(chatId)
    }

    return (
        <div className="h-screen w-full overflow-hidden bg-slate-900">
            {/* Desktop Layout */}
            <div className="hidden lg:flex h-full">
                {/* Sidebar - 25% width on desktop */}
                <div className="w-1/4 min-w-[320px] max-w-[400px] h-full">
                    <Sidebar 
                        isOpen={true} 
                        toggleSidebar={toggleSidebar} 
                        onNewChat={handleNewChat} 
                        onChatSelect={handleChatSelect} 
                    />
                </div>
                
                {/* Main Content - 75% width on desktop */}
                <div className="flex-1 h-full">
                    <Prompt selectedChatId={selectedChatId} />
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden h-full flex flex-col">
                {/* Sidebar - Slides in from left on mobile */}
                <Sidebar 
                    isOpen={sidebarOpen} 
                    toggleSidebar={toggleSidebar} 
                    onNewChat={handleNewChat} 
                    onChatSelect={handleChatSelect} 
                />
                
                {/* Main Content - Full width on mobile */}
                <div className="flex-1 h-full">
                    <Prompt selectedChatId={selectedChatId} />
                </div>
            </div>
        </div>
    )
}

export default Home
