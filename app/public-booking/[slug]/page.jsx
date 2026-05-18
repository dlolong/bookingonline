import { supabase } from '@/lib/supabaseClient'
import PublicBookingForm from './PublicBookingForm'

export async function generateMetadata({ params }) {
  // const params = await params
  // const slug = params?.slug
  return {
    title: `Resort Booking`,
  }
}

export default async function PublicBookingPage({ params }) {
  const { slug } = await params

  const { data: resort } = await supabase
    .from('resorts')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!resort) {
    return (
      <div className="p-6 text-center">
        Resort not found
      </div>
    )
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, start_datetime, end_datetime, status')
    .eq('resort_id', resort.id)
    .in('status', ['confirmed'])

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold capitalize">
            {resort.name}
          </h1>

          <p className="text-gray-500">
            Select available dates and send your reservation request
          </p>
        </div>

        <PublicBookingForm
          resort={resort}
          bookings={bookings || []}
        />
      </div>
    </div>
  )
}