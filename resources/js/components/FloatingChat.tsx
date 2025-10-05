// FloatingChat.tsx - Componente de chat flotante para el simulador
// Chat integrado con NASAbot que aparece como una ventana flotante redimensionable

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
    id: number
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

interface FloatingChatProps {
    isOpen: boolean
    onToggle: () => void
}

interface ChatSize {
    width: number
    height: number
}

interface ChatPosition {
    x: number
    y: number
}

const FloatingChat: React.FC<FloatingChatProps> = ({ isOpen, onToggle }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "¡Hola! Soy NASAbot, tu asistente personal del simulador de impactos de asteroides. 🚀\n\nPuedo ayudarte a:\n• Interpretar los resultados de tu simulación\n• Explicar conceptos como f_atm, f_frag y ablación\n• Entender el tamaño de cráteres\n• Optimizar parámetros de tu meteorito\n• Responder dudas sobre física espacial\n\n¿En qué te puedo ayudar con tu simulación?",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    
    // Estados para el redimensionamiento
    const [size, setSize] = useState<ChatSize>({ width: 320, height: 450 })
    const [position, setPosition] = useState<ChatPosition>({ x: window.innerWidth - 344, y: window.innerHeight - 474 })
    const [isResizing, setIsResizing] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [resizeHandle, setResizeHandle] = useState<string>('')
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 })
    const chatRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    // Initialize position when window resizes
    useEffect(() => {
        const handleWindowResize = () => {
            const maxX = window.innerWidth - size.width - 24
            const maxY = window.innerHeight - size.height - 24
            setPosition(prev => ({
                x: Math.min(prev.x, maxX),
                y: Math.min(prev.y, maxY)
            }))
        }

        window.addEventListener('resize', handleWindowResize)
        return () => window.removeEventListener('resize', handleWindowResize)
    }, [size])

    // Handle drag functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as Element).classList.contains('drag-handle')) {
            setIsDragging(true)
            setDragStart({
                x: e.clientX,
                y: e.clientY,
                startX: position.x,
                startY: position.y
            })
        }
    }

    // Handle resize functionality
    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        setResizeHandle(handle)
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            startX: position.x,
            startY: position.y
        })
    }

    // Mouse move handler
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - dragStart.x
                const deltaY = e.clientY - dragStart.y
                const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStart.startX + deltaX))
                const newY = Math.max(0, Math.min(window.innerHeight - size.height, dragStart.startY + deltaY))
                setPosition({ x: newX, y: newY })
            }

            if (isResizing) {
                const deltaX = e.clientX - dragStart.x
                const deltaY = e.clientY - dragStart.y

                let newWidth = size.width
                let newHeight = size.height
                let newX = position.x
                let newY = position.y

                // Handle different resize directions
                if (resizeHandle.includes('right')) {
                    newWidth = Math.max(280, Math.min(600, size.width + deltaX))
                }
                if (resizeHandle.includes('left')) {
                    const widthChange = -deltaX
                    newWidth = Math.max(280, Math.min(600, size.width + widthChange))
                    newX = position.x + (size.width - newWidth)
                }
                if (resizeHandle.includes('bottom')) {
                    newHeight = Math.max(300, Math.min(700, size.height + deltaY))
                }
                if (resizeHandle.includes('top')) {
                    const heightChange = -deltaY
                    newHeight = Math.max(300, Math.min(700, size.height + heightChange))
                    newY = position.y + (size.height - newHeight)
                }

                // Ensure window stays within bounds
                newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX))
                newY = Math.max(0, Math.min(window.innerHeight - newHeight, newY))

                setSize({ width: newWidth, height: newHeight })
                setPosition({ x: newX, y: newY })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            setIsResizing(false)
            setResizeHandle('')
        }

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, isResizing, dragStart, size, position, resizeHandle])

    // API call to NASA Expert using Gemini
    const getBotResponse = async (userMessage: string): Promise<string> => {
        try {
            const response = await fetch('/askNASAExpert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    question: userMessage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                return data.data.expert_response;
            } else {
                return `Lo siento, hubo un error al procesar tu pregunta: ${data.message}`;
            }
        } catch (error) {
            console.error('Error calling NASA Expert API:', error);
            return "Lo siento, no pude conectarme con el sistema de IA en este momento. Por favor, intenta de nuevo más tarde. 🤖";
        }
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const currentMessage = inputMessage
        setInputMessage('')
        setIsTyping(true)

        try {
            // Get bot response from Gemini API
            const botResponseText = await getBotResponse(currentMessage)
            
            const botResponse: Message = {
                id: messages.length + 2,
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
        } catch (error) {
            console.error('Error getting bot response:', error)
            const errorResponse: Message = {
                id: messages.length + 2,
                text: "Lo siento, hubo un problema técnico. Por favor, intenta de nuevo. 🤖",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorResponse])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Quick question suggestions
    const quickQuestions = [
        "¿Qué significa f_atm en mi simulación?",
        "¿Cómo interpreto el tamaño del cráter?",
        "¿Qué parámetros debo cambiar para más daño?",
        "Explícame la ablación atmosférica",
        "¿Por qué mi asteroide se fragmentó?",
        "¿Cómo afecta el ángulo de entrada?"
    ]

    const handleQuickQuestion = (question: string) => {
        setInputMessage(question)
        inputRef.current?.focus()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Overlay for preventing selection during resize/drag */}
            {(isResizing || isDragging) && (
                <div className="fixed inset-0 z-[1150]" style={{ cursor: isResizing ? `${resizeHandle.includes('right') ? 'e' : resizeHandle.includes('left') ? 'w' : resizeHandle.includes('bottom') ? 's' : resizeHandle.includes('top') ? 'n' : 'nw'}-resize` : 'move' }} />
            )}
            
            <motion.div
                ref={chatRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                    zIndex: 1200,
                    userSelect: (isResizing || isDragging) ? 'none' : 'auto'
                }}
                className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col"
            >
            {/* Resize handles */}
            {/* Top resize handle */}
            <div
                className="absolute -top-1 left-2 right-2 h-2 cursor-n-resize hover:bg-blue-500/20 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
            />
            
            {/* Bottom resize handle */}
            <div
                className="absolute -bottom-1 left-2 right-2 h-2 cursor-s-resize hover:bg-blue-500/20 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            />
            
            {/* Left resize handle */}
            <div
                className="absolute -left-1 top-2 bottom-2 w-2 cursor-w-resize hover:bg-blue-500/20 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            />
            
            {/* Right resize handle */}
            <div
                className="absolute -right-1 top-2 bottom-2 w-2 cursor-e-resize hover:bg-blue-500/20 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            />
            
            {/* Corner resize handles */}
            <div
                className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize hover:bg-blue-500/30 transition-colors rounded-tl-lg"
                onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
            />
            <div
                className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize hover:bg-blue-500/30 transition-colors rounded-tr-lg"
                onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
            />
            <div
                className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize hover:bg-blue-500/30 transition-colors rounded-bl-lg"
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
            />
            <div
                className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize hover:bg-blue-500/30 transition-colors rounded-br-lg group"
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            >
                {/* Resize indicator icon */}
                <div className="absolute bottom-0 right-0 p-0.5 text-gray-400 group-hover:text-blue-400 transition-colors">
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M12 0v4l-1.5-1.5L9 4l-1-1 1.5-1.5L8 0h4zM0 12V8l1.5 1.5L3 8l1 1-1.5 1.5L4 12H0z" />
                    </svg>
                </div>
            </div>

            {/* Header - draggable */}
            <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between cursor-move drag-handle"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                        🤖
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">NASAbot</h3>
                        <p className="text-blue-100 text-xs">Asistente de Simulaciones</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Minimize/Restore button */}
                    <button
                        onClick={() => {
                            if (size.height > 100) {
                                setSize(prev => ({ ...prev, height: 60 }))
                            } else {
                                setSize(prev => ({ ...prev, height: 450 }))
                            }
                        }}
                        className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded"
                        title="Minimizar/Restaurar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    {/* Close button */}
                    <button
                        onClick={onToggle}
                        className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded"
                        title="Cerrar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Container - only show if not minimized */}
            {size.height > 100 && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                        message.sender === 'bot'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                            : 'bg-gray-600'
                                    }`}>
                                        {message.sender === 'bot' ? '🤖' : '👤'}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div className={`px-3 py-2 rounded-lg text-sm ${
                                            message.sender === 'bot'
                                                ? 'bg-gray-800 text-white border border-gray-700'
                                                : 'bg-white text-black'
                                        }`}>
                                            <p className="whitespace-pre-line">{message.text}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 px-2">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0">
                                    🤖
                                </div>
                                <div className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions (only show if no messages from user yet) */}
                    {messages.length === 1 && size.height > 350 && (
                        <div className="px-4 pb-2">
                            <p className="text-xs text-gray-400 mb-2">Preguntas frecuentes:</p>
                            <div className="grid grid-cols-1 gap-1 max-h-20 overflow-y-auto">
                                {quickQuestions.slice(0, 4).map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickQuestion(question)}
                                        className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition border border-gray-700 hover:border-gray-500 text-gray-300 text-left"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Pregunta sobre tu simulación..."
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition text-sm"
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-lg font-semibold transition transform hover:scale-105 disabled:transform-none flex items-center gap-1 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
        </>
    )
}

export default FloatingChat