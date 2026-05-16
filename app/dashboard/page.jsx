'use client'

import { useState } from 'react'
import DashboardCalendar from '@/components/DashboardCalendar'
import DashboardBookings from '@/components/DashboardBookings'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('calendar')

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1> */}

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 ${
            activeTab === 'calendar'
              ? 'border-b-2 border-green-600 text-green-600 font-semibold'
              : 'text-gray-500'
          }`}
        >
          Calendar
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 ${
            activeTab === 'bookings'
              ? 'border-b-2 border-green-600 text-green-600 font-semibold'
              : 'text-gray-500'
          }`}
        >
          Bookings
        </button>
      </div>

      {activeTab === 'calendar' && <DashboardCalendar />}

      {activeTab === 'bookings' && <DashboardBookings />}
    </div>
  )
}