import { supabase } from '@/lib/supabaseClient'
import BookingForm from './BookingForm'

export async function generateMetadata({ params }) {
  return {
    title: `Book ${params.slug} | Resort`,
  }
}

export default async function PublicBookingPage(props) {
  const params = await props.params
  const slug = params?.slug

  console.log('PUBLIC BOOKING PARAMS:', params)
  console.log('PUBLIC BOOKING SLUG:', slug)

  if (!slug) {
    return <div className="p-6">No slug found in URL</div>
  }

  const { data: resort, error } = await supabase
    .from('resorts')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle()

  console.log('RESORT:', resort)
  console.log('SUPABASE ERROR:', error)

  if (error || !resort) {
    return (
      <div className="p-6 text-center">
        Resort not found for slug: {slug}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2 capitalize">
        {resort.name}
      </h1>



      {/* <p className="text-gray-500 mb-6">
        Booking slug: {slug}
      </p> */}

      <BookingForm resort={resort} />
    </div>
  )
}