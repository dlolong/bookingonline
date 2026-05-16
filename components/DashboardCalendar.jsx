'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CalendarView from '@/components/CalendarView'
import AddBookingModal from '@/components/AddBookingModal'
import { useApp } from '@/context/AppContext'

export default function DashboardCalendarPage() {
    const { selectedResort, loading } = useApp()
    const [bookings, setBookings] = useState([])
    const [showModal, setShowModal] = useState(false)

    // ✅ Fetch bookings using selectedResort.id
    const fetchBookings = useCallback(async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('resort_id', selectedResort.id)
            .eq('status', 'confirmed')
            .order('start_datetime', { ascending: true })

        if (error) {
            console.error(error)
            return
        }

        setBookings(data || [])
    }, [selectedResort])

    // ✅ Trigger fetch when resort is ready
    useEffect(() => {
        if (!loading && selectedResort?.id) {
            fetchBookings()
        }
    }, [loading, selectedResort])

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            <div className='mb-4'>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Add Booking
                </button>
            </div>

            <div style={{ width: '100%' }}>
                <CalendarView bookings={bookings} />
            </div>

            <AddBookingModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchBookings}
            />
        </div>
    )
}