'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format, isSameDay } from 'date-fns'
import { useApp } from '@/context/AppContext'

export default function DashboardBookings() {
     const { selectedResort, loading } = useApp()
    const [bookings, setBookings] = useState([])

    const [updateBookingProgress, setUpdateBookingProgress] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // ✅ Fetch bookings using selectedResort.id
    const fetchBookings = useCallback(async () => {
        if (!selectedResort?.id) return

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('resort_id', selectedResort.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setBookings(data || [])
    }, [selectedResort])

    // ✅ Trigger fetch when selectedResort is ready
    useEffect(() => {
        if (selectedResort?.id) {
            fetchBookings()
        }
    }, [selectedResort, fetchBookings])

    
    const updateStatus = async (id, status) => {
        
        if (!selectedResort) {
            setErrorMessage('User or selectedResort not found.')
            return
        }

        setUpdateBookingProgress(true)
        setErrorMessage('')

        const newStart = new Date(`${form.start_date}T${form.start_time}`)
        const newEnd = new Date(`${form.end_date}T${form.end_time}`)

        if (newEnd <= newStart) {
            setErrorMessage('Check-out must be later than check-in.')
            setUpdateBookingProgress(false)
            return
        }

        const { data: existingBookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('resort_id', selectedResort.id)
            .in('status', ['pending'])

        if (bookingError) {
            console.error(bookingError)
            setErrorMessage('Failed to check existing bookings.')
            setUpdateBookingProgress(false)
            return
        }

        const hasConflict = (existingBookings || []).some((booking) => {
            const existingStart = new Date(
                booking.start_datetime
            )

            const existingEnd = new Date(
                booking.end_datetime
            )

            return newStart <= existingEnd && newEnd >= existingStart
        })

        if (hasConflict) {
            setErrorMessage('Selected date and time are already booked.')
            setUpdateBookingProgress(false)
            return
        }

        await supabase.from('bookings').update({ status }).eq('id', id)
        fetchBookings()
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Bookings</h1>

            <div className="space-y-4">
                {bookings && bookings.length > 0 ? (bookings).map((booking) => (
                    
                                  <div
                                    key={booking.id}
                                    className="border rounded-xl p-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-bold text-lg">
                                        {booking.name}
                                      </h3>
                    
                                      <span
                                        className={`px-3 py-1 rounded-full text-sm text-white ${
                                          booking.status === 'confirmed'
                                            ? 'bg-green-500'
                                            : 'bg-yellow-400 text-black'
                                        }`}
                                      >
                                        {booking.status}
                                      </span>
                                    </div>
                    
                                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                                      <p>
                                        📅 {`${format(new Date(booking.start_datetime), 'MMMM d, yyyy hh:mm a')} → ${format(new Date(booking.end_datetime), 'MMMM d, yyyy hh:mm a')}`}
                                      </p>
                    
                                      <p>
                                        👥 Guests: {booking.guests}
                                      </p>
                    
                                      <p>
                                        📞 {booking.contact}
                                      </p>
                    
                                      {booking.notes && (
                                        <p>
                                          📝 {booking.notes}
                                        </p>
                                      )}
                                    </div>

                                      <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => updateStatus(b.id, 'confirmed')}
                                className="bg-green-600 text-white px-2 py-1 rounded"
                            >
                                Confirm
                            </button>

                            <button
                                onClick={() => updateStatus(b.id, 'cancelled')}
                                className="bg-red-600 text-white px-2 py-1 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                                  </div>
                    
                    // <div key={b.id} className="border p-4 rounded">
                    //     <p><strong>{b.name}</strong></p>
                    //     <p>{b.start_datetime} → {b.end_datetime}</p>
                    //     <p>Guests: {b.guests}</p>
                    //     <p>Status: {b.status}</p>

                    //     <div className="flex gap-2 mt-2">
                    //         <button
                    //             onClick={() => updateStatus(b.id, 'confirmed')}
                    //             className="bg-green-600 text-white px-2 py-1 rounded"
                    //         >
                    //             Confirm
                    //         </button>

                    //         <button
                    //             onClick={() => updateStatus(b.id, 'cancelled')}
                    //             className="bg-red-600 text-white px-2 py-1 rounded"
                    //         >
                    //             Cancel
                    //         </button>
                    //     </div>
                    // </div>
                )) : (
                    <div>
                        <p className='text-xs'>No Record Found</p>
                    </div>
                )}
            </div>
        </div>
    )
}