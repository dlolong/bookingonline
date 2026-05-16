'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function BookingForm({ resort }) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    contact: '',
    start_date: '',
    start_time: '14:00',
    end_date: '',
    end_time: '12:00',
    guests: '',
    notes: '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setErrorMessage('')

    const newStart = new Date(`${form.start_date}T${form.start_time}`)
    const newEnd = new Date(`${form.end_date}T${form.end_time}`)

    if (newEnd <= newStart) {
      setErrorMessage('Check-out must be later than check-in.')
      setLoading(false)
      return
    }

    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('*')
      .eq('resort_id', resort.id)
      .in('status', ['confirmed', 'pending'])

    if (checkError) {
      console.error(checkError)
      setErrorMessage('Failed to check availability.')
      setLoading(false)
      return
    }

    const hasConflict = (existingBookings || []).some((booking) => {
      const existingStart = new Date(
        `${booking.start_date}T${booking.start_time}`
      )

      const existingEnd = new Date(
        `${booking.end_date}T${booking.end_time}`
      )

      return newStart <= existingEnd && newEnd >= existingStart
    })

    if (hasConflict) {
      setErrorMessage('Selected date and time are already booked.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('bookings').insert([
      {
        resort_id: resort.id,
        name: form.name,
        contact: form.contact,
        start_datetime: new Date(`${form.start_date}T${form.start_time}`),
        end_datetime: new Date(`${form.end_date}T${form.end_time}`),
        guests: Number(form.guests || 0),
        notes: form.notes,
        status: 'pending',
      },
    ])

    setLoading(false)

    if (error) {
      console.error(error)
      setErrorMessage('Failed to submit booking.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-green-100 text-green-700 p-4 rounded">
        Booking request sent! The resort owner will contact you shortly.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {errorMessage}
        </div>
      )}

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full border p-2 rounded"
        required
      />

      <input
        name="contact"
        value={form.contact}
        onChange={handleChange}
        placeholder="Contact number"
        className="w-full border p-2 rounded"
        required
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="time"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="time"
          name="end_time"
          value={form.end_time}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
      </div>

      <input
        type="number"
        name="guests"
        value={form.guests}
        onChange={handleChange}
        placeholder="Guests"
        className="w-full border p-2 rounded"
      />

      <textarea
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Notes"
        className="w-full border p-2 rounded"
      />

      <button
        disabled={loading}
        className="w-full bg-green-600 text-white p-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Submitting...' : 'Submit Booking'}
      </button>
    </form>
  )
}