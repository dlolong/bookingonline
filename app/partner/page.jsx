'use client'

import { useRouter } from 'next/navigation'

export default function PartnerPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-10">
      <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-green-700 font-semibold mb-3">
            Partner Agent Program
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Earn monthly commission by referring resort owners
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Help private resort owners use an online booking system.
            Share your referral link and earn commission when they become active subscribers.
          </p>

          <button
            onClick={() => router.push('/partner/register')}
            className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700"
          >
            Become an Agent
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            How you earn
          </h2>

          <div className="space-y-4">
            <div className="border rounded-2xl p-4">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-bold">Register as a partner</h3>
              <p className="text-sm text-gray-600">
                Submit your details and wait for approval.
              </p>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-bold">Get your referral link</h3>
              <p className="text-sm text-gray-600">
                Share your personal link with resort owners.
              </p>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-bold">They request access</h3>
              <p className="text-sm text-gray-600">
                When a resort owner signs up through your link, we track it under your name.
              </p>
            </div>

            <div className="border rounded-2xl p-4 bg-green-50">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-bold">Earn monthly commission</h3>
              <p className="text-sm text-gray-600">
                Once the resort becomes an active paying customer, you receive commission every month.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-3xl mb-3">🔗</div>
          <h3 className="text-xl font-bold mb-2">
            Personal Referral Link
          </h3>
          <p className="text-gray-600">
            Every agent gets a unique link to track referred resort owners.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-3xl mb-3">📣</div>
          <h3 className="text-xl font-bold mb-2">
            Easy to Promote
          </h3>
          <p className="text-gray-600">
            Share your link on Facebook pages, groups, Messenger, or Instagram.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-xl font-bold mb-2">
            Tracked Referrals
          </h3>
          <p className="text-gray-600">
            We record which resorts came from your link for commission tracking.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto text-center mt-16">
        <h2 className="text-3xl font-bold mb-4">
          Start earning from your resort network
        </h2>

        <p className="text-gray-600 mb-6">
          Perfect for resort agents, Facebook page admins, and people who already promote private resorts.
        </p>

        <button
          onClick={() => router.push('/partner/register')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
        >
          Become an Agent
        </button>
      </section>
    </main>
  )
}