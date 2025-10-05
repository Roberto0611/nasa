// FloatingChat.tsx - Componente de chat flotante para el simulador
// Chat integrado con NASAbot que aparece como una ventana flotante

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
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-80 h-[450px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col z-50"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                        🤖
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">NASAbot</h3>
                        <p className="text-blue-100 text-xs">Asistente de Simulaciones</p>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className="text-white/80 hover:text-white transition p-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            {messages.length === 1 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-gray-400 mb-2">Preguntas frecuentes:</p>
                    <div className="grid grid-cols-1 gap-1 max-h-20 overflow-y-auto">
                        {quickQuestions.map((question, index) => (
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
        </motion.div>
    )
}

export default FloatingChat