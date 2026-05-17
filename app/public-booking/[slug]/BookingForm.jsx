'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

export default function BookingForm({ resort }) {
  const { showToast } = useApp()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetForm = () => {
    setForm(defaultForm)
  }

  const handleNewBooking = () => {
    resetForm()
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setErrorMessage('')

    const newStart = new Date(`${form.start_date}T${form.start_time}`)
    const newEnd = new Date(`${form.end_date}T${form.end_time}`)

    if (newEnd <= newStart) {
      showToast({
        type: 'error',
        message: 'Check-out must be later than check-in.',
      })
      setLoading(false)
      return
    }

    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('start_datetime', 'end_datetime')
      .eq('resort_id', resort.id)
      .in('status', ['confirmed', 'pending'])

    if (checkError) {
      console.error(checkError)
      showToast({
        type: 'error',
        message: 'Failed to check availability.',
      })
      setLoading(false)
      return
    }

    const hasConflict = (existingBookings || []).some((booking) => {
      const existingStart = new Date(booking.start_datetime)
      const existingEnd = new Date(booking.end_datetime)

      return newStart < existingEnd && newEnd > existingStart
    })

    if (hasConflict) {
      showToast({
        type: 'error',
        message: 'Selected date and time are already booked.',
      })
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
      showToast({
        type: 'error',
        message: 'Failed to submit booking.',
      })
      return
    }

    resetForm()
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-green-100 text-green-700 p-4 rounded">
        Booking request sent! The resort owner will contact you shortly.

        <button
          onClick={handleNewBooking}
          className="cursor-pointer  mt-4 w-full bg-[#29b55a] text-white p-2 rounded"
        >
          Create New Booking
        </button>
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


      <input
        type="number"
        name="guests"
        value={form.guests}
        placeholder="Number of guests"
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
        className="cursor-default enabled:cursor-pointer w-full bg-[#29b55a] text-white p-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Submitting...' : 'Submit Booking'}
      </button>
    </form>
  )
}