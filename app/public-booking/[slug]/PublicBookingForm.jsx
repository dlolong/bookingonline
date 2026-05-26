'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isSameDay, isValid } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import { formatAmountInput, parseAmount, formatAmount } from '@/utils/amount'
import { getPHDate, getPHTime } from '@/utils/dateTime'


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


function getBookingColor(booking, bookings) {
    const index = bookings.findIndex((b) => b.id === booking.id)
    return bookingColors[index % bookingColors.length]
}

function getDayDate(day) {
    return format(day, 'yyyy-MM-dd')
}


function getBookingSession(day, booking) {
  const dayDate = getDayDate(day)

  const startDate = getPHDate(booking.start_datetime)
  const startTime = getPHTime(booking.start_datetime)

  const endDate = getPHDate(booking.end_datetime)
  const endTime = getPHTime(booking.end_datetime)

  // 7AM start, ends next day = full start date
  if (
    dayDate === startDate &&
    startDate !== endDate &&
    startTime >= '07:00' &&
    startTime < '17:00'
  ) {
    return 'full'
  }

   // Same-day morning = left
  if (
    dayDate === startDate &&
    dayDate === endDate &&
    startTime >= '07:00' &&
    startTime < '17:00' &&
    endTime <= '17:00'
  ) {
    return 'morning'
  }

 // Overnight start = right
  if (
    dayDate === startDate &&
    startTime >= '19:00'
  ) {
    return 'overnight'
  }

    // Booking ends next day and reaches morning session
  if (
    dayDate === endDate &&
    startDate !== endDate &&
    endTime > '06:00'
  ) {
    return 'morning'
  }

  return null
}

function getDaySessions(day, bookings) {
  let morningBooking = null
  let overnightBooking = null

  bookings.forEach((booking) => {
    const session = getBookingSession(day, booking)

    if (session === 'full') {
      morningBooking = booking
      overnightBooking = booking
    }

    if (session === 'morning') {
      morningBooking = booking
    }

    if (session === 'overnight') {
      overnightBooking = booking
    }
  })

  return {
    morningBooking,
    overnightBooking,
    isFull: Boolean(morningBooking && overnightBooking),
  }
}

export default function PublicBookingForm({ resort, bookings, showCalendar }) {
    const { showToast } = useApp()

    const [loading, setLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [activeTab, setActiveTab] = useState('availability')
    const [submittedBooking, setSubmittedBooking] = useState(null)

    const defaultForm = {
        name: '',
        contact: '',
        start_date: '',
        start_time: '07:00',
        end_date: '',
        end_time: '17:00',
        proposed_amount: '',
        guests: '',
        notes: '',
    }

    const [formStartDate, setFormStartDate] = useState(defaultForm.start_date)
    const [formStartTime, setFormStartTime] = useState(defaultForm.start_time)
    const [formEndDate, setFormEndDate] = useState(defaultForm.end_date)
    const [formEndTime, setFormEndTime] = useState(defaultForm.end_time)
    const [formName, setFormName] = useState(defaultForm.name)
    const [formContact, setFormContact] = useState(defaultForm.contact)
    const [formGuests, setFormGuests] = useState(defaultForm.guests)
    const [formProposedAmount, setFormProposedAmount] = useState(defaultForm.agreed_amount)
    const [formNotes, setFormNotes] = useState(defaultForm.notes)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const resetForm = () => {
        setFormStartDate(defaultForm.start_date)
        setFormStartTime(defaultForm.start_time)
        setFormEndDate(defaultForm.end_date)
        setFormEndTime(defaultForm.end_time)
        setFormName(defaultForm.name)
        setFormContact(defaultForm.contact)
        setFormGuests(defaultForm.guests)
        setFormProposedAmount(defaultForm.agreed_amount)
        setFormNotes(defaultForm.notes)
    }


    const handleDayClick = (day) => {
        setSelectedDate(day)
        setActiveTab('reservation')
        setFormStartDate(format(new Date(day), 'yyyy-MM-dd'))
    }

    function checkAvailability(startValue, endValue, bookings) {
        if (!startValue || !endValue) return null

        const newStart = new Date(startValue)
        const newEnd = new Date(endValue)

        if (newEnd <= newStart) {
            return {
                available: false,
                message: 'End date/time must be later than start date/time.',
            }
        }

        const hasConflict = bookings.some((booking) => {
            const existingStart = new Date(booking.start_datetime)
            const existingEnd = new Date(booking.end_datetime)

            return newStart < existingEnd && newEnd > existingStart
        })

        if (hasConflict) {
            return {
                available: false,
                message: 'This schedule is currently unavailable. Please choose another date or adjust your time.',
            }
        }

        return {
            available: true,
            message: 'Available',
        }
    }
    const startDate = new Date(`${formStartDate}T${formStartTime}`)
    const endDate = new Date(`${formEndDate}T${formEndTime}`)

    const availability = isValid(startDate) && isValid(endDate) && checkAvailability(
        startDate,
        endDate,
        bookings
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const newStart = new Date(`${formStartDate}T${formStartTime}`)
        const newEnd = new Date(`${formEndDate}T${formEndTime}`)

        if (!isValidMobileNumber(formContact)) {
            showToast({
                type: 'error',
                message:
                    'Please enter a valid mobile number (e.g. 09171234567 or +639171234567)',
            })
            setLoading(false)
            return
        }

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
            setFormStartDate("")
            setFormEndDate("")
            setLoading(false)
            return
        }

        const { error } = await supabase.from('bookings').insert([
            {
                resort_id: resort.id,
                name: formName,
                contact: normalizeMobile(formContact),
                start_datetime: new Date(`${formStartDate}T${formStartTime}`),
                end_datetime: new Date(`${formEndDate}T${formEndTime}`),
                guests: Number(formGuests || 0),
                proposed_amount: parseAmount(formProposedAmount),
                agreed_amount: 0,
                notes: formNotes,
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
        // TODO: CHANGE TO PAGE
        showToast({
            type: 'success',
            message: 'Booking request sent successfully.',
        })

        setSubmittedBooking({
            resortName: resort.name,
            name: formName,
            contact: formContact,
            start_datetime: new Date(`${formStartDate}T${formStartTime}`),
            end_datetime: new Date(`${formEndDate}T${formEndTime}`),
            proposed_amount: parseAmount(formProposedAmount),
            guests: formGuests,
            notes: formNotes,
        })

        resetForm()
    }

    const leftBox = (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-2 sr-only md:not-sr-only">
                Availability Calendar
            </h2>

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

                            const {
                                morningBooking,
                                overnightBooking,
                                isFull,
                            } = getDaySessions(day, bookings)

                            return (
                                <button
                                    disabled={isFull}
                                    {...props}
                                    type="button"
                                    className={`
                               relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center
                               transition
                      ${isToday ? 'ring-2 ring-blue-500 font-bold' : 'border-gray-200'}
                      hover:scale-105
                      disabled:opacity-90
                      hover:enabled:bg-gray-200
                      enabled:cursor-pointer
                      cursor-default
                               `}
                                >
                                    {isFull && (
                                        <>
                                            <span
                                                className="absolute left-0 top-0 h-full w-1/2"
                                                style={{
                                                    backgroundColor: "#ff9b9b",
                                                }}
                                            />
                                            <span
                                                className="absolute right-0 top-0 h-full w-1/2"
                                                style={{
                                                    backgroundColor: "#ff9b9b",
                                                }}
                                            />
                                        </>
                                    )}

                                    {!isFull && morningBooking && (
                                        <span
                                            className="absolute left-0 top-0 h-full w-1/2"
                                            style={{
                                                backgroundColor: "#ff9b9b",
                                            }}
                                        />
                                    )}

                                    {!isFull && overnightBooking && (
                                        <span
                                            className="absolute right-0 top-0 h-full w-1/2"
                                            style={{
                                                backgroundColor: "#ff9b9b",
                                            }}
                                        />
                                    )}

                                    {/* {(morningBooking || overnightBooking) && (
                                        <span className="absolute top-0 bottom-0 left-1/2 w-px bg-white/80" />
                                    )} */}

                                    <span className="relative z-10 text-sm font-semibold text-gray-800">
                                        {day.getDate()}
                                    </span>
                                </button>
                            )
                        }
                    }}
                />
            </div>

            <div className="flex gap-4 mt-5 text-sm content-center">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#ff9b9b] border" />
                    Not vacant
                </div>
            </div>
        </div>
    )

    const rightBox = (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 w-full max-w-md overflow-hidden " >
            <h2 className="text-left text-xl font-bold mb-4">
                Reservation Form
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

                <div className="mt-8 grid grid-cols-1 gap-2">
                    <p className='w-88'>Check In</p>
                    <div className='grid grid-cols-2 gap-2'>
                        <input
                            min={new Date().toISOString().split('T')[0]}
                            type="date"
                            name="start_date"
                            value={formStartDate}
                            className="flex-1 border p-2 rounded text-gray-600"
                            onChange={(e) => setFormStartDate(e.target.value)}
                        />
                        <input
                            type="time"
                            name="start_time"
                            value={formStartTime}
                            className="flex-1 border p-2 rounded"
                            onChange={(e) => setFormStartTime(e.target.value)}
                        />
                    </div>
                </div>


                <div className="grid grid-cols-1 gap-2">
                    <p className='w-88'>Check Out</p>
                    <div className='grid grid-cols-2 gap-2'>
                        <input
                            min={(formStartDate ? new Date(formStartDate) : new Date()).toISOString().split('T')[0]}
                            type="date"
                            name="end_date"
                            value={formEndDate}
                            className="flex-1 border p-2 rounded text-gray-600"
                            onChange={(e) => setFormEndDate(e.target.value)}
                        />

                        <input
                            type="time"
                            name="end_time"
                            value={formEndTime}
                            className="flex-1 border p-2 rounded"
                            onChange={(e) => setFormEndTime(e.target.value)}
                        />
                    </div>
                </div>

                {availability && (
                    <div
                        className={`p-3 rounded text-sm ${availability.available
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                            }`}
                    >
                        {availability.available
                            ? 'Good news! This date and time is available.'
                            : availability.message}
                    </div>
                )}

                <input
                    name="name"
                    value={formName}
                    placeholder="Guest Name"
                    className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                    onChange={(e) => setFormName(e.target.value)}
                />

                <input
                    name="contact"
                    value={formContact}
                    onChange={(e) => {
                        // allow only numbers and +
                        const value = e.target.value.replace(/[^\d+]/g, '')
                        setFormContact(value)
                    }}
                    placeholder="09XXXXXXXXX"
                    className="w-full border px-3 py-2.5 sm:p-3 rounded"
                    maxLength={13}
                />


                <input
                    type="number"
                    name="guests"
                    value={formGuests}
                    placeholder="Number of guests"
                    className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                    onChange={(e) => setFormGuests(e.target.value)}
                />

                <input
                    type="text"
                    name="proposed_amount"
                    value={formatAmountInput(formProposedAmount)}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '')
                        setFormProposedAmount(raw)
                    }}
                    placeholder="Your Proposed Price"
                    className="w-full border p-3 rounded"
                />

                <p className="text-xs text-gray-500 -mt-2">
                    Enter your proposed price. The resort owner may contact you to negotiate.
                </p>

                <textarea
                    name="notes"
                    value={formNotes}
                    placeholder="Notes"
                    className="w-full border px-3 py-2.5 sm:p-3 rounded text-sm sm:text-base"
                    onChange={(e) => setFormNotes(e.target.value)}
                />

                <button
                    disabled={
                        loading
                        || formName === ''
                        || formContact === ''
                        || !formStartDate
                        || !formEndDate
                        || !formGuests
                        || !availability.available
                    }
                    className="cursor-default enabled:cursor-pointer w-full bg-[#29b55a] text-white p-2 rounded disabled:bg-gray-400"
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
    )

    if (submittedBooking) {
        return (
            <div className="bg-white rounded-2xl shadow p-6 max-w-xl mx-auto text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    ✓
                </div>

                <h2 className="text-2xl font-bold mb-2">
                    Booking Request Sent!
                </h2>

                <p className="text-gray-600 mb-6">
                    Thank you, {submittedBooking.name}. Your booking request has been submitted.
                    The resort owner will contact you shortly to confirm your reservation.
                </p>

                <div className="text-left bg-gray-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg mb-2">
                        Booking Details
                    </h3>

                    <p>
                        <span className="text-gray-500">Resort:</span>{' '}
                        <strong>{submittedBooking.resortName}</strong>
                    </p>

                    <p>
                        <span className="text-gray-500">Guest:</span>{' '}
                        <strong>{submittedBooking.name}</strong>
                    </p>

                    <p>
                        <span className="text-gray-500">Contact:</span>{' '}
                        <strong>{submittedBooking.contact}</strong>
                    </p>

                    <p>
                        <span className="text-gray-500">Check-in:</span>{' '}
                        <strong>
                            {format(new Date(submittedBooking.start_datetime), 'EEE, MMMM d, yyyy hh:mm a')}
                        </strong>
                    </p>

                    <p>
                        <span className="text-gray-500">Check-out:</span>{' '}
                        <strong>
                            {format(new Date(submittedBooking.end_datetime), 'EEE, MMMM d, yyyy hh:mm a')}
                        </strong>
                    </p>

                    <p>
                        <span className="text-gray-500">Guests:</span>{' '}
                        <strong>{submittedBooking.guests || 0}</strong>
                    </p>

                    <p>
                        <span className="text-gray-500">Proposed Amount/Price:</span>{' '}
                        <strong>{formatAmount(submittedBooking.proposed_amount)}</strong>
                    </p>

                    {submittedBooking.notes && (
                        <p>
                            <span className="text-gray-500">Notes:</span>{' '}
                            <strong>{submittedBooking.notes}</strong>
                        </p>
                    )}

                    <p>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                            Pending confirmation
                        </span>
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSubmittedBooking(null)
                        resetForm()
                    }}
                    className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
                >
                    Submit Another Booking
                </button>
            </div>
        )
    }

    return (
        <>
            <div className="text-center mb-8 mt-2">
                <h1 className="text-3xl font-bold capitalize">
                    {resort.name}
                </h1>

                <p className="text-gray-500">
                    Select available dates and send your reservation request
                </p>
            </div>

            {showCalendar ? (
                <>
                    {/* Mobile tabs only */}
                    <div className="flex gap-2 border-b border-[#cacecf] mb-6 md:hidden">
                        <button
                            onClick={() => setActiveTab('availability')}
                            className={`cursor-pointer  px-4 py-2 ${activeTab === 'availability'
                                ? 'border-b-2 border-[#29b55a] text-[#29b55a] font-semibold'
                                : 'text-gray-500'
                                }`}
                        >
                            Availability Calendar
                        </button>
                        <button
                            onClick={() => setActiveTab('reservation')}
                            className={`cursor-pointer px-4 py-2 ${activeTab === 'reservation'
                                ? 'border-b-2 border-[#29b55a] text-[#29b55a] font-semibold'
                                : 'text-gray-500'
                                }`}
                        >
                            Reservation Form
                        </button>
                    </div>

                    {/* Mobile view */}
                    <div className="md:hidden pb-32">
                        {activeTab === 'availability' && leftBox}
                        {activeTab === 'reservation' && rightBox}
                    </div>

                    {/* Desktop / tablet view: side by side */}
                    <div className="hidden pb-32 md:grid md:grid-cols-2 gap-6 items-start">
                        {leftBox}
                        <div className='md:pl-4'>
                            {rightBox}
                        </div>
                    </div>
                </>
            ) : (
                <div className='flex items-center justify-center'>
                    {rightBox}
                </div>
            )}

        </>
    )
}