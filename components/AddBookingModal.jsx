'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { formatAmountInput, parseAmount, formatAmount } from '@/utils/amount'

function normalizeMobile(value) {
    if (value.startsWith('09')) {
        return '+63' + value.slice(1)
    }
    if (value.startsWith('639')) {
        return '+' + value
    }
    return value
}

function isValidMobileNumber(value) {
        const cleaned = value.replace(/\s+/g, '')

        const regex = /^(09|\+639|639)\d{9}$/
        return regex.test(cleaned)
    }

export default function AddBookingModal({
    open,
    onClose,
    onSuccess,
    bookingModalData = null
}) {
    const { selectedResort, refreshBookings, showToast } = useApp()
    const [addBookingProgress, setAddBookingProgress] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const defaultForm = {
        name: '',
        contact: '',
        start_date: '',
        start_time: '07:00',
        end_date: '',
        end_time: '17:00',
        guests: '',
        agreed_amount: '',
        notes: '',
    }

    const [form, setForm] = useState(defaultForm)

    useEffect(() => {
        console.log(bookingModalData)
        if (bookingModalData) {
            setForm({
                ...form,
                start_date: format(new Date(bookingModalData), 'yyyy-MM-dd')
            })
        }
    }, [bookingModalData])



    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const resetForm = () => {
        setForm(defaultForm)
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

          if (!isValidMobileNumber(form.contact)) {
            showToast({
                type: 'error',
                message:
                    'Please enter a valid mobile number (e.g. 09171234567 or +639171234567)',
            })
            setAddBookingProgress(false)
            return
        }

        if (newEnd <= newStart) {
             showToast({
                type: 'error',
                message:
                   'Check-out must be later than check-in.',
            })
            setAddBookingProgress(false)
            return
        }

        const { data: existingBookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('resort_id', selectedResort.id)
            .in('status', ['confirmed'])

        if (bookingError) {
            console.error(bookingError)
              showToast({
                type: 'error',
                message:
                 'Failed to check existing bookings.',
            })
            setAddBookingProgress(false)
            return
        }

        const hasConflict = (existingBookings || []).some((booking) => {
            const existingStart = new Date(
                booking.start_datetime
            )

            const existingEnd = new Date(
                booking.end_datetime
            )

            return newStart < existingEnd && newEnd > existingStart
        })

        if (hasConflict) {
             showToast({
                type: 'error',
                message:
                'Selected date and time are already booked.',
            })
            setForm({ ...form, start_date: '', end_date: '' })
            setAddBookingProgress(false)
            return
        }

        const { error } = await supabase.from('bookings').insert([
            {
                resort_id: selectedResort.id,
                name: form.name,
                contact: normalizeMobile(form.contact),
                start_datetime: new Date(`${form.start_date}T${form.start_time}`),
                end_datetime: new Date(`${form.end_date}T${form.end_time}`),
                guests: Number(form.guests || 0),
               agreed_amount: parseAmount(form.agreed_amount),
                proposed_amount: parseAmount(form.agreed_amount),
                notes: form.notes,
                status: 'confirmed',
            },
        ])

        setAddBookingProgress(false)

        if (error) {
            console.error(error)
              showToast({
                type: 'error',
                message:
                'Failed to save booking.',
            })
            
            return
        }

        await refreshBookings()
        resetForm()
        onSuccess?.()
        onClose()
    }

    const handleClose = () => {
        resetForm()
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
                            <p className="text-sm text-gray-500 capitalize">
                                {selectedResort.name}
                            </p>
                        )}
                    </div>

                    <button className='cursor-pointer' onClick={handleClose}>
                        <X height={16} />
                    </button>
                </div>

                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                    <div className="mt-8 flex grid-cols-3 gap-2">
                        <p className='w-88'>Check In</p>
                        <input
                            min={new Date().toISOString().split('T')[0]}
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                        />

                        <input
                            type="time"
                            name="start_time"
                            value={form.start_time}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                        />
                    </div>


                    <div className="flex grid-cols-3 gap-2">
                        <p className='w-88'>Check Out</p>
                        <input
                            min={(form.start_date ? new Date(form.start_date) : new Date()).toISOString().split('T')[0]}
                            type="date"
                            name="end_date"
                            value={form.end_date}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                        />

                        <input
                            type="time"
                            name="end_time"
                            value={form.end_time}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                        />
                    </div>

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        placeholder="Guest Name"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                     <input
                    name="contact"
                    value={form.contact}
                    onChange={(e) => {
                        // allow only numbers and +
                        const value = e.target.value.replace(/[^\d+]/g, '')
                        handleChange({ target: { name: 'contact', value } })
                    }}
                    placeholder="09XXXXXXXXX"
                    className="w-full border px-3 py-2.5 sm:p-3 rounded"
                    maxLength={13}
                />


                    <input
                        type="number"
                        name="guests"
                        value={form.guests}
                        placeholder="Number of guests"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                   <input
                        type="text"
                        name="agreed_amount"
                        value={formatAmountInput(form.agreed_amount)}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, '')

                            setForm((prev) => ({
                            ...prev,
                            agreed_amount: raw,
                            }))
                        }}
                        placeholder="Agreed Amount"
                        className="w-full border p-2 rounded"
                        />

                    <textarea
                        name="notes"
                        value={form.notes}
                        placeholder="Notes"
                        className="w-full border p-2 rounded"
                        onChange={handleChange}
                    />

                    <button
                        disabled={
                            form.name === ''
                            || form.contact === ''
                            || !form.start_date
                            || !form.end_date
                            || !form.guests
                            || !form.agreed_amount
                            || addBookingProgress
                            || !selectedResort
                        }
                        className="w-full bg-[#29b55a] text-white py-2 rounded disabled:bg-gray-400 cursor-pointer disabled:cursor-default"
                    >
                        {addBookingProgress ? 'Saving...' : 'Save Booking'}
                    </button>
                </form>
            </div>
        </div>
    )
}