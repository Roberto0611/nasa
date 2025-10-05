// MeteoritesPage.tsx - Galería de meteoritos de NASA y guardados por usuarios
// Muestra todos los meteoritos disponibles en cards organizadas

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Toaster } from '@/components/sonner'
import { Link } from '@inertiajs/react'

type MeteoroidRecord = {
    id?: number
    name: string
    radiusMeteroid?: number
    radius?: number
    velocity?: number
    angle?: number
    entry_angle?: number
    material?: string
    lat?: number
    lng?: number
    mass?: string
    recclass?: string
    year?: string
}

const MeteoritesPage = () => {
    const [nasaMeteorites, setNasaMeteorites] = useState<MeteoroidRecord[]>([])
    const [savedMeteorites, setSavedMeteorites] = useState<MeteoroidRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'nasa' | 'saved'>('nasa')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchNasaMeteorites()
        fetchSavedMeteorites()
    }, [])

    const fetchNasaMeteorites = async () => {
        try {
            const response = await fetch('/getMeteoritesNames')
            if (!response.ok) throw new Error('Failed to fetch NASA meteorites')

            const data = await response.json()
            const mappedData: MeteoroidRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                mass: item.mass,
                recclass: item.recclass,
                year: item.year,
            }))

            setNasaMeteorites(mappedData)
            toast.success(`${mappedData.length} NASA meteorites loaded`)
        } catch (error) {
            console.error('Error fetching NASA meteorites:', error)
            toast.error('Error loading NASA meteorites')
        }
    }

    const fetchSavedMeteorites = async () => {
        try {
            const response = await fetch('/getAllUserMeteorites')
            if (!response.ok) throw new Error('Failed to fetch saved meteorites')

            const data = await response.json()
            const mappedData: MeteoroidRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                radiusMeteroid: item.radius,
                velocity: item.velocity,
                angle: item.entry_angle,
                material: item.material,
                lat: item.lat,
                lng: item.lng,
            }))

            setSavedMeteorites(mappedData)
            toast.success(`${mappedData.length} saved meteorites loaded`)
        } catch (error) {
            console.error('Error fetching saved meteorites:', error)
            toast.error('Error loading saved meteorites')
        } finally {
            setLoading(false)
        }
    }

    const filteredMeteorites = (activeTab === 'nasa' ? nasaMeteorites : savedMeteorites).filter(
        (meteorite) => meteorite.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Meteorites Database</h1>
                            <p className="text-gray-400">Explore NASA's collection and user-created meteoroids</p>
                        </div>
                        <Link href="/">
                            <button className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition">
                                Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Search and Tabs */}
            <div className="bg-gray-900/50 border-b border-gray-800">
                <div className="container mx-auto px-6 py-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search meteorites by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-2xl px-6 py-4 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('nasa')}
                            className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'nasa'
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            NASA Meteorites ({nasaMeteorites.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'saved'
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            User Created ({savedMeteorites.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Meteorites Grid */}
            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading meteorites...</p>
                        </div>
                    </div>
                ) : filteredMeteorites.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold mb-2">No meteorites found</h3>
                        <p className="text-gray-400">Try adjusting your search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMeteorites.map((meteorite, index) => (
                            <motion.div
                                key={meteorite.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition group cursor-pointer"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl">☄️</div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${activeTab === 'nasa'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                : 'bg-green-500/20 text-green-400 border border-green-500/50'
                                            }`}>
                                            {activeTab === 'nasa' ? 'NASA' : 'User'}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-gray-300 transition line-clamp-2">
                                        {meteorite.name}
                                    </h3>

                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        {activeTab === 'nasa' ? (
                                            <>
                                                {meteorite.mass && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">⚖️ Mass:</span>
                                                        <span>{parseFloat(meteorite.mass).toLocaleString()} g</span>
                                                    </div>
                                                )}
                                                {meteorite.recclass && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">🔬 Class:</span>
                                                        <span>{meteorite.recclass}</span>
                                                    </div>
                                                )}
                                                {meteorite.year && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">📅 Year:</span>
                                                        <span>{new Date(meteorite.year).getFullYear()}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {meteorite.radiusMeteroid && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">📏 Radius:</span>
                                                        <span>{meteorite.radiusMeteroid} m</span>
                                                    </div>
                                                )}
                                                {meteorite.velocity && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">⚡ Velocity:</span>
                                                        <span>{meteorite.velocity} m/s</span>
                                                    </div>
                                                )}
                                                {meteorite.angle && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">📐 Angle:</span>
                                                        <span>{meteorite.angle}°</span>
                                                    </div>
                                                )}
                                                {meteorite.material && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-gray-500">🪨 Material:</span>
                                                        <span className="capitalize">{meteorite.material}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Link href="/sim">
                                        <button className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white hover:text-black rounded-lg font-semibold transition text-sm">
                                            Use in Simulator
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <Toaster />
        </div>
    )
}

export default MeteoritesPage
