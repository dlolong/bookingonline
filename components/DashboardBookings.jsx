'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format, isSameDay } from 'date-fns'
import { useApp } from '@/context/AppContext'
import Loader from '@/components/Loader'
import { Flag, MapPin, NotepadText, Phone, User, Users } from 'lucide-react'

export default function DashboardBookings() {
    const {
        selectedResort,
        pendingBookings,
        refreshBookings,
        initialLoading,
        refreshing,
        showToast,
    } = useApp()

    const [updateBookingProgress, setUpdateBookingProgress] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [loadingBookings, setLoadingBookings] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null)

    const updateBookingStatus = async () => {
        if (!confirmAction) return

        setUpdateBookingProgress(true)

        if (confirmAction.status === "confirmed") {
            const newStart = new Date(confirmAction?.booking?.start_datetime)
            const newEnd = new Date(confirmAction?.booking?.end_datetime)

            const hasConflict = (pendingBookings || []).some((booking) => {
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
                    message: 'Selected date and time are already booked.',
                })

                setUpdateBookingProgress(false)
                return
            }
        }

        await supabase.from('bookings').update({ status: confirmAction.status }).eq('id', confirmAction.booking.id)
        setConfirmAction(null)
        await refreshBookings()
        setUpdateBookingProgress(false)
    }

    if (initialLoading) {
        return <Loader text="Loading bookings..." />
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-4">
            {confirmAction && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-bold mb-2">
                            Are you sure?
                        </h3>

                        <p className="text-sm text-gray-600 mb-5">
                            You are about to{' '}
                            <strong>{confirmAction.status === "confirmed" ? "Confirm" : "Remove"}</strong>{' '}
                            booking for{' '}
                            <strong>{confirmAction.booking.name}</strong>.
                        </p>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setConfirmAction(null)}
                                disabled={updateBookingProgress}
                                className="cursor-pointer  px-4 py-2 rounded border w-32"
                            >
                                No
                            </button>

                            <button
                                onClick={updateBookingStatus}
                                disabled={updateBookingProgress}
                                className={`cursor-pointer px-4 py-2 rounded text-white ${confirmAction.status === 'confirmed'
                                    ? 'bg-[#29b55a]'
                                    : 'bg-red-600'
                                    }`}
                            >
                                {updateBookingProgress ? 'Processing...' : 'Yes, proceed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className='sr-only md:not-sr-only'>
                    <h2 className="text-xl font-bold">Pending</h2>
                </div>

                {(refreshing || loadingBookings) && (
                    <span className="text-xs text-gray-400">
                        Syncing...
                    </span>
                )}
            </div>

            {pendingBookings.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No pending bookings yet.
                </p>
            ) : (
                <div className="space-y-3">
                    {pendingBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="border-1 border-[#ffe8c8] bg-[#ffee7f1f] rounded-xl p-4"
                        >
                            <div className="items-center justify-between">
                                <h6 className='flex items-center'>
                                    <MapPin width={16} className='text-gray-400 mr-2' /> {`${format(new Date(booking.start_datetime), 'EEE, MMMM d, yyyy hh:mm a')}`}
                                </h6>
                                <h6 className='flex items-center'>
                                    <Flag width={16} className='text-gray-400 mr-2' /> {`${format(new Date(booking.end_datetime), 'EEE, MMMM d, yyyy hh:mm a')}`}
                                </h6>
                            </div>

                            <div className='grid grid-cols-2'>

                                <div className="mt-3 space-y-0 text-sm text-black-600">
                                    <p className='flex items-center'>
                                        <User width={16} className='text-gray-400 mr-2' /> {booking.name}
                                    </p>
                                    <p className='flex items-center'>
                                        <Users width={16} className='text-gray-400 mr-2' /> {booking.guests} pax
                                    </p>

                                    <p className='flex items-center'>
                                        <Phone width={16} className='text-gray-400 mr-2' /> {booking.contact}
                                    </p>

                                    {booking.notes && (
                                        <p className='flex items-center'>
                                            <NotepadText width={16} className='text-gray-400 mr-2' /> {booking.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-self-end">
                                    {updateBookingProgress && confirmAction?.booking?.id === booking.id ? (
                                        <Loader />
                                    ) : (
                                        <div className='grid grid-flow-col grid-rows-2 gap-4"'>
                                            <button
                                                onClick={() =>
                                                    setConfirmAction({
                                                        booking,
                                                        status: 'confirmed',
                                                    })
                                                }
                                                className="cursor-pointer bg-[#29b55a] text-white px-3 py-1 rounded mb-1"
                                            >
                                                Confirm
                                            </button>

                                            <button
                                                onClick={() => setConfirmAction({
                                                    booking,
                                                    status: 'removed',
                                                })}
                                                className="cursor-pointer bg-red-200 text-red-800 px-2 py-1 rounded mt-1"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}



                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}