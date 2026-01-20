import { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import Prompt from '../components/Prompt'

// Constants for better maintainability
const MOBILE_BREAKPOINT = 1024
const RESIZE_DEBOUNCE_DELAY = 100

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [selectedChatId, setSelectedChatId] = useState(null)

    // Optimized resize handler with debouncing
    const checkMobile = useCallback(() => {
        const mobile = window.innerWidth < MOBILE_BREAKPOINT
        setIsMobile(mobile)
        
        // Auto-close sidebar when switching to desktop
        if (!mobile && sidebarOpen) {
            setSidebarOpen(false)
        }
    }, [sidebarOpen])

    // Debounced resize for better performance
    useEffect(() => {
        let timeoutId
        
        const debouncedResize = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(checkMobile, RESIZE_DEBOUNCE_DELAY)
        }

        // Initial check
        checkMobile()
        
        window.addEventListener('resize', debouncedResize)
        
        return () => {
            window.removeEventListener('resize', debouncedResize)
            clearTimeout(timeoutId)
        }
    }, [checkMobile])

    // Optimized event handlers with useCallback
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev)
    }, [])

    const handleNewChat = useCallback((newChatId) => {
        setSelectedChatId(newChatId)
        // Auto-close sidebar on mobile after creating new chat
        if (isMobile) {
            setSidebarOpen(false)
        }
    }, [isMobile])

    const handleChatSelect = useCallback((chatId) => {
        setSelectedChatId(chatId)
        // Auto-close sidebar on mobile after selecting chat
        if (isMobile) {
            setSidebarOpen(false)
        }
    }, [isMobile])

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = 'unset'
            }
        }
    }, [isMobile, sidebarOpen])

    // Memoized sidebar props to prevent unnecessary re-renders
    const sidebarProps = useMemo(() => ({
        isOpen: sidebarOpen,
        toggleSidebar,
        onNewChat: handleNewChat,
        onChatSelect: handleChatSelect
    }), [sidebarOpen, toggleSidebar, handleNewChat, handleChatSelect])

    return (
        <div className="h-screen w-full overflow-hidden bg-slate-900">
            {/* Desktop Layout */}
            <div className="hidden lg:flex h-full">
                {/* Sidebar - Fixed width with smooth transitions */}
                <div className="w-1/4 min-w-[320px] max-w-[400px] h-full border-r border-slate-700/50 transition-all duration-200">
                    <Sidebar {...sidebarProps} isOpen={true} />
                </div>
                
                {/* Main Content - Optimized flex */}
                <div className="flex-1 h-full min-w-0">
                    <Prompt selectedChatId={selectedChatId} />
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden h-full flex flex-col relative">
                {/* Backdrop overlay for better UX */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
                        onClick={toggleSidebar}
                    />
                )}
                
                {/* Mobile Sidebar - Improved slide animation */}
                <div className={`
                    fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 
                    transform transition-transform duration-200 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <Sidebar {...sidebarProps} />
                </div>
                
                {/* Main Content - Proper spacing */}
                <div className="flex-1 h-full min-h-0">
                    <Prompt selectedChatId={selectedChatId} />
                </div>
            </div>
        </div>
    )
}

export default Home