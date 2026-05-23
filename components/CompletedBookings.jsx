'use client'

import { useMemo, useState } from 'react'
import { format, isSameMonth, isSameWeek } from 'date-fns'
import { formatAmount } from '@/utils/amount'
import { useApp } from '@/context/AppContext'

export default function CompletedBookings({
  title = 'Completed Bookings',
}) {
     const { completedBookings } = useApp()
  const [filter, setFilter] = useState('weekly')

  const filteredBookings = useMemo(() => {
    const now = new Date()

    return completedBookings.filter((booking) => {
      const date = new Date(booking.end_datetime)

      if (filter === 'weekly') {
        return isSameWeek(date, now, { weekStartsOn: 1 })
      }

      return isSameMonth(date, now)
    })
  }, [completedBookings, filter])

  const totalAmount = useMemo(() => {
    return filteredBookings.reduce(
      (sum, booking) => sum + Number(booking.agreed_amount || 0),
      0
    )
  }, [filteredBookings])

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">
            Completed revenue summary
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 bg-white text-sm"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      <div className="bg-green-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-500">
          Total Agreed Amount
        </p>

        <h3 className="text-2xl font-bold text-green-700">
          {formatAmount(totalAmount)}
        </h3>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-sm text-gray-500">
          No completed bookings for this period.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-xl p-4"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-bold">{booking.name}</h3>

                  <p className="text-sm text-gray-600">
                    {format(
                      new Date(booking.start_datetime),
                      'MMM d, yyyy h:mm a'
                    )}
                    {' '}→{' '}
                    {format(
                      new Date(booking.end_datetime),
                      'MMM d, yyyy h:mm a'
                    )}
                  </p>

                  <p className="text-sm text-gray-600">
                    {booking.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.contact}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-green-700">
                    {formatAmount(booking.agreed_amount)}
                  </p>

                  {/* <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    completed
                  </span> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}