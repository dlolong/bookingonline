'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

export default function AddBookingModal({
    open,
    onClose,
    onSuccess,
}) {
    const { selectedResort, loading } = useApp()
    const [addBookingProgress, setAddBookingProgress] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [form, setForm] = useState({
        name: '',
        contact: '',
        start_date: '',
        start_time: '07:00',
        end_date: '',
        end_time: '15:00',
        guests: '',
        notes: '',
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const resetForm = () => {
        setForm({
            name: '',
            contact: '',
            start_date: '',
            start_time: '14:00',
            end_date: '',
            end_time: '12:00',
            guests: '',
            notes: '',
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedResort) {
            setErrorMessage('Resort not found.')
            return
        }

        setAddBookingProgress(true)
        setErrorMessage('')

        const newStart = new Date(`${form.start_date}T${form.start_time}`)
        const newEnd = new Date(`${form.end_date}T${form.end_time}`)

        if (newEnd <= newStart) {
            setErrorMessage('Check-out must be later than check-in.')
            setAddBookingProgress(false)
            return
        }

        const { data: existingBookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('resort_id', selectedResort.id)
            .in('status', ['confirmed', 'pending'])

        if (bookingError) {
            console.error(bookingError)
            setErrorMessage('Failed to check existing bookings.')
            setAddBookingProgres(false)
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
            setAddBookingProgress(false)
            return
        }

        const { error } = await supabase.from('bookings').insert([
            {
                resort_id: selectedResort.id,
                name: form.name,
                contact: form.contact,
                start_datetime: new Date(`${form.start_date}T${form.start_time}`),
                end_datetime: new Date(`${form.end_date}T${form.end_time}`),
                guests: Number(form.guests || 0),
                notes: form.notes,
                status: 'confirmed',
            },
        ])

        setAddBookingProgres(false)

        if (error) {
            console.error(error)
            setErrorMessage('Failed to save booking.')
            return
        }

        resetForm()
        onSuccess?.()
        onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Add Booking</h2>
                        {selectedResort && (
                            <p className="text-sm text-gray-500">
                                {selectedResort.name}
                            </p>
                        )}
                    </div>

                    <button onClick={onClose}>✕</button>
                </div>

                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        placeholder="Guest Name"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="contact"
                        value={form.contact}
                        placeholder="Contact Number"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            min={new Date().toISOString().split('T')[0]}
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            className="border p-2 rounded"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="time"
                            name="start_time"
                            value={form.start_time}
                            className="border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            min={new Date().toISOString().split('T')[0]}
                            type="date"
                            name="end_date"
                            value={form.end_date}
                            className="border p-2 rounded"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="time"
                            name="end_time"
                            value={form.end_time}
                            className="border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        type="number"
                        name="guests"
                        value={form.guests}
                        placeholder="Guests"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                    <textarea
                        name="notes"
                        value={form.notes}
                        placeholder="Notes"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                    <button
                        disabled={addBookingProgress || !selectedResort}
                        className="w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
                    >
                        {addBookingProgress ? 'Saving...' : 'Save Booking'}
                    </button>
                </form>
            </div>
        </div>
    )
}