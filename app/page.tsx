'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="max-w-6xl mx-auto px-6 py-14 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
          Manage Resort Bookings Without the Stress
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A simple booking calendar for private resorts. Avoid double bookings,
          track reservations, and manage guest requests in one place.
        </p>

        {/* <button
          onClick={() => router.push('/signup')}
          className="cursor-pointer bg-[#29b55a] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700"
        >
          Try Free
        </button> */}
        <button
  onClick={() => router.push('/contact')}
  className="cursor-pointer bg-[#29b55a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
>
  Request Access for FREE
</button>

        {/* <p className="text-sm text-gray-500 mt-3">
          It is FREE!
        </p> */}
      </section>

      <section className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-xl font-bold mb-2">
            Booking Calendar
          </h3>
          <p className="text-gray-600">
            See confirmed and pending bookings clearly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="text-xl font-bold mb-2">
            Avoid Double Bookings
          </h3>
          <p className="text-gray-600">
            Automatically check date and time conflicts before saving bookings.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="text-xl font-bold mb-2">
            Public Booking Link
          </h3>
          <p className="text-gray-600">
            Share a booking page with guests so they can send requests easily.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Built for Resort Owners
        </h2>

        <p className="text-gray-600 mb-8">
          Replace messy Messenger threads and spreadsheets with a clean,
          mobile-friendly booking system.
        </p>

        <button
          onClick={() => router.push('/signup')}
          className="cursor-pointer bg-[#29b55a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
        >
          Start Free Today
        </button>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-4 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Partner Agent Program
        </h2>

        <p className="text-gray-600 mb-8">
         Earn monthly commission by referring resort owners
        </p>

        <button
          onClick={() => router.push('/partner')}
          className="cursor-pointer bg-[#434343] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#000000]"
        >
           Become an Agent
        </button>
      </section>
    </main>
  )
}