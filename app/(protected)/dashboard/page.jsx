'use client'

import { useEffect, useState } from 'react'
import DashboardCalendar from '@/components/DashboardCalendar'
import DashboardBookings from '@/components/DashboardBookings'
import AddBookingModal from '@/components/AddBookingModal'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import Loader from '@/components/Loader'

export default function DashboardPage() {
  const { initialLoading, bookingsLoading, refreshBookings, getResortsProgress, resorts, user } = useApp()
  const [activeTab, setActiveTab] = useState('calendar')
  const [showModal, setShowAddBooking] = useState(false)
  const [bookingModalData, setBookingModalData] = useState(null)

  const router = useRouter()

  const handleOnAddBooking = (data) => {
    setBookingModalData(data)
    setShowAddBooking(true)
  }

  const handleRefresh = () => {
    refreshBookings()
  }

  useEffect(() => {
    if (!initialLoading && !getResortsProgress && (!user || (user && resorts?.length < 1))) {
      router.push('/onboarding')
    }
  }, [user, resorts])

  return (
    <div className="p-6 bg-[#e3eff2]">
      <AddBookingModal
        open={showModal}
        onClose={() => setShowAddBooking(false)}
        onSuccess={refreshBookings}
        bookingModalData={bookingModalData}
      />

      <div className="flex items-center justify-between mb-6 p-2">
        <div className='flex grid-cols-2 gap-2 item-start'>
          <h2 className="text-2xl font-bold">
            Bookings
          </h2>

          {(bookingsLoading) ? (
            <span className="">
              <Loader size={34}/>
            </span>
          ) : (
            <button onClick={handleRefresh} className='p-2 rounded-full cursor-pointer hover:bg-gray-200'>
              <RefreshCw width={18} height={18} />
            </button>
          )}


        </div>

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
          className={`cursor-pointer  px-4 py-2 ${activeTab === 'bookings'
              ? 'border-b-2 border-[#29b55a] text-[#29b55a] font-semibold'
              : 'text-gray-500'
            }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`cursor-pointer px-4 py-2 ${activeTab === 'calendar'
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
        {activeTab === 'calendar' && <DashboardCalendar onAddBooking={handleOnAddBooking} />}
      </div>

      {/* Desktop / tablet view: side by side */}
      <div className="hidden pb-32 md:grid md:grid-cols-2 gap-6 items-start">
        <DashboardBookings />
        <div className='md:pl-4'>
          <DashboardCalendar onAddBooking={handleOnAddBooking} />
        </div>
      </div>
    </div>
  )
}