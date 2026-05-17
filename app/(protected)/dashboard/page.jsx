'use client'

import { useState, useCallback } from 'react'
import DashboardCalendar from '@/components/DashboardCalendar'
import DashboardBookings from '@/components/DashboardBookings'
import AddBookingModal from '@/components/AddBookingModal'
import { useApp } from '@/context/AppContext'

export default function DashboardPage() {
  const { refreshBookings } = useApp()
  const [activeTab, setActiveTab] = useState('calendar')
  const [showModal, setShowAddBooking] = useState(false)
  const [bookingModalData, setBookingModalData] = useState(null)

  const handleOnAddBooking = (data) => {
    setBookingModalData(data)
    setShowAddBooking(true)
  }

  return (
    <div className="p-6 bg-[#e3eff2]">
      <AddBookingModal
        open={showModal}
        onClose={() => setShowAddBooking(false)}
        onSuccess={refreshBookings}
        bookingModalData={bookingModalData}
      />

      <div className="flex items-center justify-between mb-6 p-2">
      <h1 className="text-2xl font-bold">
        Bookings
      </h1>

      <button
        onClick={() => setShowAddBooking(true)}
        className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded text-sm md:text-base cursor-pointer"
      >
        + Add Booking
      </button>
    </div>

      {/* Mobile tabs only */}
      <div className="flex gap-2 border-b border-[#cacecf] mb-6 md:hidden">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`cursor-pointer  px-4 py-2 ${
            activeTab === 'bookings'
              ? 'border-b-2 border-[#29b55a] text-[#29b55a] font-semibold'
              : 'text-gray-500'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`cursor-pointer px-4 py-2 ${
            activeTab === 'calendar'
              ? 'border-b-2 border-[#29b55a] text-[#29b55a] font-semibold'
              : 'text-gray-500'
          }`}
        >
          Reserved
        </button>
      </div>

      {/* Mobile view */}
      <div className="md:hidden pb-32">
        {activeTab === 'bookings' && <DashboardBookings />}
        {activeTab === 'calendar' && <DashboardCalendar onAddBooking={handleOnAddBooking}/>}
      </div>

      {/* Desktop / tablet view: side by side */}
      <div className="hidden pb-32 md:grid md:grid-cols-2 gap-6 items-start">
       <DashboardBookings />
        <div className='md:pl-4'>
           <DashboardCalendar onAddBooking={handleOnAddBooking}/>
        </div>
      </div>
    </div>
  )
}