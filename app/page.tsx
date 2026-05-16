'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold">
        Stop Double Booking Your Resort
      </h1>

      <button
        onClick={() => router.push('/signup')}
        className="mt-6 bg-green-600 text-white px-6 py-3 rounded"
      >
        Try Free
      </button>
    </div>
  )
}