'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isSameDay } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

function toDateTimeLocal(date, time = '14:00') {
    if (!date) return ''
    return `${format(date, 'yyyy-MM-dd')}T${time}`
}

export default function PublicBookingForm({ resort, bookings }) {
    const { showToast } = useApp()

    const [range, setRange] = useState()
    const [loading, setLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)

    const defaultForm = {
        name: '',
        contact: '',
        start_date: '',
        start_time: '07:00',
        end_date: '',
        end_time: '17:00',
        guests: '',
        notes: '',
    }
    const [form, setForm] = useState(defaultForm)


    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const handleDayClick = (day) => {
        setSelectedDate(day)

        // const bookingsForDay = bookings.filter((booking) => {
        //     const start = new Date(booking.start_datetime)
        //     const end = new Date(booking.end_datetime)

        //     start.setHours(0, 0, 0, 0)
        //     end.setHours(23, 59, 59, 999)

        //     return day >= start && day <= end
        // })

        // if (bookingsForDay.length > 0) {
        //     setSelectedBookings(bookingsForDay)
        //     setOpenModal(true)
        // } else {
        //     onAddBooking(day)
        // }
    }



    function getBookingsForDay(day, bookings) {
        return bookings.filter((booking) => {
            const start = new Date(booking.start_datetime)
            const end = new Date(booking.end_datetime)

            const dayStart = new Date(day)
            dayStart.setHours(0, 0, 0, 0)

            const dayEnd = new Date(day)
            dayEnd.setHours(23, 59, 59, 999)

            return start <= dayEnd && end >= dayStart
        })
    }

    function getSlotForDay(day, booking) {
        const start = new Date(booking.start_datetime)
        const end = new Date(booking.end_datetime)

        const isStartDay = isSameDay(day, start)
        const isEndDay = isSameDay(day, end)

        const startHour = start.getHours()
        const endHour = end.getHours()

        // Overnight booking:
        // May 17 7PM → May 18 6AM
        if (isStartDay && startHour >= 6) return 'pm'
        if (isEndDay && endHour <= 18) return 'am'

        // Same-day booking
        if (isStartDay && isEndDay) {
            if (startHour < 18 && endHour <= 6) return 'am'
            if (startHour >= 6 && endHour > 18) return 'pm'
        }

        return 'full'
    }

    const handleChange = (e) => {
        setForm((prev) => ({
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const newStart = new Date(form.start_datetime)
        const newEnd = new Date(form.end_datetime)

        if (newEnd <= newStart) {
            showToast({
                type: 'error',
                message: 'End date/time must be later than start date/time.',
            })
            setLoading(false)
            return
        }

        const hasConflict = bookings.some((booking) => {
            const existingStart = new Date(booking.start_datetime)
            const existingEnd = new Date(booking.end_datetime)

            return newStart < existingEnd && newEnd > existingStart
        })

        if (hasConflict) {
            showToast({
                type: 'error',
                message: 'Selected date/time is not available.',
            })
            setLoading(false)
            return
        }

        const { error } = await supabase.from('bookings').insert([
            {
                resort_id: resort.id,
                name: form.name,
                contact: form.contact,
                start_datetime: form.start_datetime,
                end_datetime: form.end_datetime,
                guests: Number(form.guests || 0),
                notes: form.notes,
                status: 'pending',
            },
        ])

        setLoading(false)

        if (error) {
            showToast({
                type: 'error',
                message: 'Failed to submit booking.',
            })
            return
        }

        showToast({
            type: 'success',
            message: 'Booking request sent successfully.',
        })

        setForm({
            name: '',
            contact: '',
            start_datetime: '',
            end_datetime: '',
            guests: '',
            notes: '',
        })

        setRange(undefined)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 items-start">
            {/* LEFT: Calendar */}
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6 overflow-hidden">
                <h2 className="text-xl font-bold mb-2">
                    Availability Calendar
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                    Unavailable dates are disabled.
                </p>

                <div className='[text-align:-webkit-center]'>
                    <DayPicker
                        weekStartsOn={1}
                        mode="single"
                        selected={selectedDate}
                        onDayClick={handleDayClick}
                        disabled={{ before: today }}
                        components={{
                            DayButton: (props) => {
                                const day = props.day.date
                                const isToday = new Date().toDateString() === day.toDateString()

                                const dayBookings = getBookingsForDay(day, bookings)

                                const amBooking = dayBookings.find((b) => getSlotForDay(day, b) === 'am')
                                const pmBooking = dayBookings.find((b) => getSlotForDay(day, b) === 'pm')
                                const fullBooking = dayBookings.find((b) => getSlotForDay(day, b) === 'full')

                                return (
                                    <button
                                        {...props}
                                        type="button"
                                        className={
                                            `relative w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center transition
                      ${isToday ? 'ring-2 ring-blue-500 font-bold' : 'border-gray-200'}
                      hover:scale-105 disabled:opacity-90 hover:enabled:bg-gray-200 enabled:cursor-pointer cursor-default`}
                                    >
                                        {/* Full day */}
                                        {fullBooking && (
                                            <span
                                                className="absolute inset-0 shadow-inner bg-red-300"
                                            />
                                        )}

                                        {/* AM */}
                                        {amBooking && (
                                            <span
                                                className="absolute top-0 left-0 w-full h-1/2 bg-red-300"
                                            />
                                        )}

                                        {/* PM */}
                                        {pmBooking && (
                                            <span
                                                className="absolute bottom-0 left-0 w-full h-1/2 bg-red-300"
                                            />
                                        )}

                                        {/* Today highlight overlay (subtle) */}
                                        {isToday && (
                                            <span className="absolute inset-0 rounded-full" />
                                        )}

                                        {/* Day number */}
                                        <span className="relative z-10 text-sm font-semibold text-gray-800">
                                            {format(day, 'd')}
                                        </span>
                                    </button>
                                )
                            },
                        }}
                        classNames={{
                            months: 'w-full',
                            month: 'w-full',
                            table: 'w-full',
                            head_row: 'grid grid-cols-7',
                            row: 'grid grid-cols-7',
                            cell: 'flex justify-center p-0.5 sm:p-1',

                            day: `
    w-9 h-9
    sm:w-10 sm:h-10
    md:w-11 md:h-11
    lg:w-12 lg:h-12
    rounded-full
    text-sm
    hover:bg-green-100
  `,

                            day_selected: 'bg-green-600 text-white',
                            day_disabled: 'opacity-40 cursor-not-allowed',
                            day_today: 'ring-2 ring-green-500',
                        }}
                    />
                </div>

                <div className="flex gap-4 mt-5 text-sm content-center">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-green-600" />
                        Selected
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-red-300 border" />
                        Not vacant
                    </div>
                </div>
            </div>

            {/* RIGHT: Form */}
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6 w-full overflow-hidden">
                <h2 className="text-xl font-bold mb-4">
                    Reservation Form
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="mt-8 flex grid-cols-3 gap-2">
                        <p className='w-88'>Check Out</p>
                        <input
                            min={new Date().toISOString().split('T')[0]}
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="time"
                            name="start_time"
                            value={form.start_time}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div className="flex grid-cols-3 gap-2">
                        <p className='w-88'>Check Out</p>
                        <input
                            min={new Date().toISOString().split('T')[0]}
                            type="date"
                            name="end_date"
                            value={form.end_date}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="time"
                            name="end_time"
                            value={form.end_time}
                            className="flex-1 border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        placeholder="Guest Name"
                        className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="contact"
                        value={form.contact}
                        placeholder="Contact Number"
                        className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                        onChange={handleChange}
                    />


                    <input
                        type="number"
                        name="guests"
                        value={form.guests}
                        placeholder="Number of guests"
                        className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                        onChange={handleChange}
                    />

                    <textarea
                        name="notes"
                        value={form.notes}
                        placeholder="Notes"
                        className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                        onChange={handleChange}
                    />

                    <button
                        disabled={
                            loading
                            || form.name === ''
                            || form.contact === ''
                            || !form.start_date
                            || !form.start_time
                            || !form.end_date
                            || !form.end_time
                            || !form.guests
                            || form.notes === ''
                        }
                        className="cursor-default enabled:cursor-pointer w-full bg-[#29b55a] text-white p-2 rounded disabled:bg-gray-700"
                    >
                        {loading ? 'Submitting...' : 'Submit Booking'}
                    </button>

                    {/* <button
  disabled={loading}
  className="w-full bg-green-600 text-white py-3 rounded text-sm sm:text-base font-semibold disabled:bg-gray-400"
>
  {loading ? 'Submitting...' : 'Submit Reservation'}
</button> */}
                </form>
            </div>
        </div>
    )
}