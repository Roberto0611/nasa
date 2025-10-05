// ChatToggleButton.tsx - Botón flotante para abrir/cerrar el chat
// Botón estilizado que se mantiene visible en el simulador

import React from 'react'
import { motion } from 'framer-motion'

interface ChatToggleButtonProps {
    isOpen: boolean
    onClick: () => void
    hasUnread?: boolean
}

const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({ isOpen, onClick, hasUnread = false }) => {
    if (isOpen) return null

    return (
        <motion.div className="fixed bottom-6 right-6 z-40 group">
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 relative"
            >
                {/* Icono del chat */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                
                {/* Indicador de mensajes no leídos */}
                {hasUnread && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                    >
                        <span className="text-white text-xs font-bold">!</span>
                    </motion.div>
                )}

                {/* Efecto de pulso para llamar la atención */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.button>
            
            {/* Tooltip mejorado */}
            <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700">
                    💬 Pregunta a NASAbot
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            </div>
        </motion.div>
    )
}

export default ChatToggleButton