'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Camera, LogOut, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'

import api, { apiErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/events'
import { useUserContext } from '@/context/UserContext'

/**
 * The fields `PUT /api/user/` accepts. Anything else in the body is ignored,
 * and `role` is rejected outright with a 403 — role changes are an admin
 * endpoint.
 *
 * The backend validates each of these, so the rules are mirrored in the inputs
 * rather than left to come back as a 400: phone is 10–15 digits (a leading 91
 * or 0 is stripped server-side), semester is 1–10 and year 1–5.
 */
const EDITABLE_FIELDS = [
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '9876543210' },
  {
    key: 'college',
    label: 'College',
    type: 'text',
    placeholder: 'NIT Calicut',
  },
  { key: 'branch', label: 'Branch', type: 'text', placeholder: 'CSE' },
  { key: 'semester', label: 'Semester', type: 'number', min: 1, max: 10 },
  { key: 'year', label: 'Year of Study', type: 'number', min: 1, max: 5 },
  {
    key: 'district',
    label: 'District',
    type: 'text',
    placeholder: 'Kozhikode',
  },
  { key: 'state', label: 'State', type: 'text', placeholder: 'Kerala' },
]

const MAX_PHOTO_BYTES = 400 * 1024

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
}

/**
 * Bookings live on TIQR, not here, so `GET /api/booking/my` answers in TIQR's
 * shape: snake_case, and `ticket.event` is **TIQR's** event id. Our own events
 * carry that id as `tiqrEventId`, which is what this joins on — matching
 * against `Event.id` silently pairs each booking with the wrong event.
 */
function useMyBookings(enabled) {
  const [bookings, setBookings] = useState([])
  const [eventsByTiqrId, setEventsByTiqrId] = useState({})
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        api.get('/api/booking/my'),
        // Public, and cheap enough to fetch whole — the join needs the map.
        api.get('/api/events/all'),
      ])

      setBookings(bookingsRes.data?.bookings ?? [])

      const map = {}
      for (const event of eventsRes.data?.events ?? []) {
        if (event.tiqrEventId) map[event.tiqrEventId] = event
      }
      setEventsByTiqrId(map)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError(apiErrorMessage(err, 'Could not load your bookings.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    load()
  }, [enabled, load])

  return { bookings, eventsByTiqrId, loading, error, reload: load }
}

function BookingCard({ booking, event }) {
  const status = booking.status ?? 'UNKNOWN'
  const tone =
    status === 'CONFIRMED'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
      : status === 'PENDING'
        ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
        : 'bg-white/10 text-white/60 border-white/20'

  return (
    <div className='rounded-xl border border-white/10 bg-black/30 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-white'>
            {event?.heading ?? booking.ticket?.type ?? 'Booking'}
          </p>
          <p className='mt-0.5 text-xs text-white/50'>
            {formatDate(booking.created_at)}
            {booking.quantity > 1 ? ` · ${booking.quantity} tickets` : ''}
          </p>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}
        >
          {status}
        </span>
      </div>

      {event ? (
        <p className='mt-2 text-xs text-white/60'>
          {formatDate(event.datetime)}
          {event.venue?.name ? ` · ${event.venue.name}` : ''}
          {` · ${formatPrice(event.price)}`}
        </p>
      ) : (
        // A booking for an event we have no local row for — an older one, or
        // one created directly on TIQR.
        <p className='mt-2 text-xs text-white/40'>
          Details for this event are not available here.
        </p>
      )}
    </div>
  )
}

export default function ProfileSummary({ user }) {
  const { logout, refreshProfile } = useUserContext()

  const { bookings, eventsByTiqrId, loading, error, reload } =
    useMyBookings(!!user)

  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [photo, setPhoto] = useState(null)

  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  )

  useEffect(() => {
    if (!photoPreview) return
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  // Referral figures are aggregates from TIQR and only exist for a CA.
  const [referral, setReferral] = useState(null)

  useEffect(() => {
    if (user?.role !== 'CA') return

    api
      .get('/api/referrals')
      .then(({ data }) => setReferral(data))
      .catch((err) => {
        // Non-fatal: the rest of the profile is still worth showing.
        console.error('Failed to load referral stats:', err)
      })
  }, [user?.role])

  if (!user) return null

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Image must be under 400 KB.')
      return
    }
    setPhoto(file)
  }

  async function handleSave() {
    // Only send what was actually touched and is non-empty: the backend 400s
    // on an empty string for any field, and rejects a body with no known keys.
    const payload = {}
    for (const { key } of EDITABLE_FIELDS) {
      const value = form[key]
      if (value === undefined) continue

      const trimmed = String(value).trim()
      if (trimmed === '' || trimmed === String(user[key] ?? '')) continue

      payload[key] = ['semester', 'year'].includes(key)
        ? Number(trimmed)
        : trimmed
    }

    if (Object.keys(payload).length === 0 && !photo) {
      toast('Nothing to save.')
      return
    }

    // Multipart, so the optional photo travels with the fields in one request.
    const body = new FormData()
    for (const [key, value] of Object.entries(payload)) body.append(key, value)
    if (photo) body.append('image', photo)

    setSaving(true)
    try {
      // The instance defaults to JSON, which makes axios flatten FormData and
      // drop the file. Overriding it sends real multipart.
      await api.put('/api/user/', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await refreshProfile()
      setForm({})
      setPhoto(null)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update your profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-24'>
      {/* Identity */}
      <div className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md'>
        <div className='mb-8 flex flex-col items-center text-center'>
          <label className='group relative mb-4 cursor-pointer'>
            {photoPreview || user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview || user.picture}
                alt=''
                className='h-24 w-24 rounded-full border-2 border-white/20 object-cover'
              />
            ) : (
              <div className='flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/20 bg-white/10'>
                <User size={40} className='text-white/70' />
              </div>
            )}
            <span className='absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
              <Camera size={22} className='text-white' />
            </span>
            <input
              type='file'
              accept='image/*'
              hidden
              disabled={saving}
              onChange={handlePhotoChange}
            />
          </label>
          <h1 className='text-2xl font-bold text-white'>
            {user.name || 'Your profile'}
          </h1>
          <p className='mt-1 text-sm text-white/60'>Signed in with Google</p>
        </div>

        <div className='flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3'>
          <Mail size={18} className='shrink-0 text-cyan-400' />
          <div className='min-w-0'>
            <p className='text-xs font-semibold uppercase tracking-wide text-white/50'>
              Email
            </p>
            <p className='truncate text-sm font-medium text-white'>
              {user.email}
            </p>
          </div>
        </div>

        {/*
          Booking is refused outright without a phone number, and that refusal
          arrives at the worst possible moment — after the user has picked an
          event. Saying so here is the whole point of this banner.
        */}
        {!user.hasPhone ? (
          <p className='mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200'>
            Add a phone number below before you book anything — registrations
            are rejected without one.
          </p>
        ) : null}
      </div>

      {/* Editable details */}
      <div className='rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md'>
        <h2 className='mb-4 text-lg font-bold text-white'>Your details</h2>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {EDITABLE_FIELDS.map((field) => (
            <label key={field.key} className='block'>
              <span className='text-xs font-semibold uppercase tracking-wide text-white/50'>
                {field.label}
              </span>
              <input
                type={field.type}
                min={field.min}
                max={field.max}
                placeholder={field.placeholder}
                value={form[field.key] ?? user[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                disabled={saving}
                className='mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none disabled:opacity-60'
              />
            </label>
          ))}
        </div>

        <button
          type='button'
          onClick={handleSave}
          disabled={saving}
          className='mt-6 rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60'
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Referrals — CA only */}
      {user.role === 'CA' ? (
        <div className='rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md'>
          <h2 className='mb-4 text-lg font-bold text-white'>Your referrals</h2>

          {referral?.registered === false ? (
            <p className='text-sm text-white/60'>
              You are not registered as a referrer with our ticketing provider
              yet. Complete your profile above and it will be set up for you.
            </p>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div>
                <p className='text-xs uppercase tracking-wide text-white/50'>
                  Code
                </p>
                <p className='font-mono text-lg font-bold text-white'>
                  {referral?.referralCode || user.referralCode || '—'}
                </p>
              </div>
              <div>
                <p className='text-xs uppercase tracking-wide text-white/50'>
                  Tickets sold
                </p>
                <p className='text-lg font-bold text-white'>
                  {referral?.successfulTicketCount ?? '—'}
                </p>
              </div>
              <div>
                <p className='text-xs uppercase tracking-wide text-white/50'>
                  Sales
                </p>
                <p className='text-lg font-bold text-white'>
                  {referral?.successfulSalesAmount !== undefined
                    ? formatPrice(referral.successfulSalesAmount)
                    : '—'}
                </p>
              </div>
            </div>
          )}

          {/*
            Only the totals, deliberately. Our ticketing provider exposes no
            endpoint listing the individual bookings a code generated, so a
            per-referral table is not something we can build today.
          */}
          <p className='mt-4 text-xs text-white/40'>
            Totals only — a per-booking breakdown is not available.
          </p>
        </div>
      ) : null}

      {/* Bookings */}
      <div className='rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-bold text-white'>Your bookings</h2>
          <button
            type='button'
            onClick={reload}
            className='text-xs font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300'
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className='text-sm text-white/50'>Loading…</p>
        ) : error ? (
          <p className='text-sm text-red-300'>{error}</p>
        ) : bookings.length === 0 ? (
          <p className='text-sm text-white/50'>
            Nothing booked yet. A new booking can take a moment to appear here
            after payment — hit refresh if you have just paid.
          </p>
        ) : (
          <div className='space-y-3'>
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                event={eventsByTiqrId[booking.ticket?.event]}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type='button'
        onClick={logout}
        className='flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20'
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )
}
