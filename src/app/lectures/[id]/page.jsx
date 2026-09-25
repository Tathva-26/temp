import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ModalWrapper from '@/components/modelWrapper'
import ClosedBanner from '@/components/ClosedBanner'
import Linkify from '@/components/Linkify'
import BrochureButton from '@/components/BrochureButton'
import BackendStatus from '@/components/BackendStatus'
import { getBackendURL, backendFetch } from '@/lib/api'
import { fetchEvent, formatPrice } from '@/lib/events'

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== 'false'

/**
 * The brochure lives on TIQR, so it is keyed by **TIQR's** event id, not ours.
 * An event that has not been synced has no TIQR id and therefore no brochure.
 *
 * Routed through our own passthrough rather than calling TIQR directly: it is
 * the documented endpoint for this, and it keeps TIQR's host out of the
 * browser's network path.
 */
async function getBrochure(tiqrEventId) {
  if (!tiqrEventId) return []

  try {
    const res = await backendFetch(
      `${getBackendURL()}/api/tiqr-events/${tiqrEventId}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []

    const data = await res.json()
    return data.event?.gallery ?? []
  } catch (err) {
    // A missing brochure must not take the whole event page down with it.
    console.error('Failed to fetch brochure:', err)
    return []
  }
}

// MAIN PAGE COMPONENT
export default async function EventPage({ params }) {
  const { id } = await params

  if (!backendEnabled) {
    return (
      <BackendStatus
        title='Lecture details coming soon'
        message='Lecture registration will be available soon.'
      />
    )
  }

  const event = await fetchEvent(id)
  if (!event) notFound()

  const brochures = await getBrochure(event.tiqrEventId)

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Kolkata',
        })
      : 'TBA'

  const formatTime = (timeString) => {
    if (!timeString) return 'TBA'
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    })
  }

  // Format date range based on startTime and endTime
  const getDateDisplay = () => {
    if (!event.startTime && !event.endTime) {
      // Single day event - show only the date from datetime
      return formatDate(event.datetime)
    } else {
      // Multi-day event - show range
      const startDate = event.startTime
        ? formatDate(event.startTime)
        : formatDate(event.datetime)
      const endDate = event.endTime
        ? formatDate(event.endTime)
        : formatDate(event.datetime)
      return `${startDate} - ${endDate}`
    }
  }

  // Prepare event data
  const eventData = {
    id: event.id,
    name: event.heading,
    date: getDateDisplay(),
    time: formatTime(event.datetime),
    // Bookability is decided server-side from our event id; the button only
    // needs to know whether to offer itself.
    isBookable: event.isBookable,
    isClosed: event.isClosed,
    passcodeRequired: event.passcodeRequired,
    venue: event.venue || null,
    // Paise, as the API sends it; the checkout modal converts and computes
    // the platform fee off it.
    price: event.price,
    priceLabel: formatPrice(event.price),
    description: event.description || 'No description available',
    catchyPara: event.catchyPara || null,
    image: event.picture,
    committee: event.committee || null,
    isTeamEvent: event.isTeamEvent,
    teamSize: event.teamSize,
  }

  // Create the list of details to display
  const infoItems = [['Date', eventData.date]]

  // Add venue only if it exists
  if (eventData.venue) {
    infoItems.push(['Venue', eventData.venue.name || eventData.venue])
  }

  infoItems.push(['Price', eventData.priceLabel])

  // Add team information if it's a team event
  if (eventData.isTeamEvent) {
    const teamInfo = eventData.teamSize
      ? `Team Event (${eventData.teamSize} members)`
      : 'Team Event'
    infoItems.push(['Event Type', teamInfo])
  }

  return (
    <div className='bg-transparent min-h-screen pt-24 sm:pt-28 pb-4 sm:pb-10 px-4 sm:px-8 text-white'>
      <div className='max-w-6xl mx-auto'>
        {/* Header Section */}
        <div className='mb-12'>
          <Link
            href='/lectures'
            className='text-sm font-medium text-gray-500 hover:text-white transition-colors'
          >
            ← Back to Lectures
          </Link>
          <h1 className='text-4xl sm:text-5xl md:text-6xl pp-fragment font-medium tracking-wide mt-3 text-white uppercase'>
            {eventData.name}
          </h1>
        </div>

        {/* Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Left — Image Section */}
          <div className='lg:col-span-4'>
            <div className={`relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg ${eventData.isClosed ? '' : 'hover:scale-[1.02] transition-transform duration-300'}`}>
              {/* `picture` is nullable on the API, and next/image throws on a
                  null src rather than rendering nothing. */}
              {eventData.isClosed ? <ClosedBanner /> : null}
              {eventData.image ? (
                <Image
                  src={eventData.image}
                  alt={eventData.name}
                  fill
                  className={`object-contain ${eventData.isClosed ? 'grayscale opacity-50' : ''}`}
                  priority
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center border border-dashed border-white/15 px-4 text-center text-sm uppercase tracking-widest text-white/40'>
                  {eventData.name}
                </div>
              )}
            </div>
          </div>

          {/* Right — Info Section */}
          <div className='lg:col-span-8 bg-black/30 backdrop-blur-lg border border-white/20 shadow-md rounded-2xl p-6 sm:p-8 transition-transform hover:-translate-y-1 hover:shadow-lg'>
            {/* Info Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6'>
              {infoItems.map(([label, value]) => (
                <div key={label}>
                  <p className='text-xs uppercase text-gray-400 tracking-widest'>
                    {label}
                  </p>
                  <p className='font-medium text-white'>{value}</p>
                </div>
              ))}
            </div>

            {/* Short Description with View Details Button */}
            <div className='border-t border-white/20 pt-4 sm:pt-6'>
              <p className='text-base  leading-relaxed text-gray-300 whitespace-pre-line break-words'>
                {eventData.description}
              </p>
              {eventData.catchyPara && (
                <a
                  href='#full-description'
                  className='inline-block mt-3 text-sm font-medium text-gray-300 hover:text-white transition-colors underline'
                >
                  View Full Description ↓
                </a>
              )}

              {/* Button Container - New Implementation */}
              <div className='flex items-center space-x-4 mt-4 mb-5'>
                {/* Modal Wrapper (Register Button) */}
                <ModalWrapper workshopData={eventData} eventType='Lecture' />

                {/* Display Brochure Button */}
                {brochures.length !== 0 && (
                  <BrochureButton brochureUrl={brochures[0].gallery} />
                )}
              </div>

              <p className='mt-1 inter text-sm text-gray-400'>
                Ticket details are automatically taken from your profile. You
                can update them on the{' '}
                <Link
                  href='/profile'
                  className='font-medium text-white hover:underline'
                >
                  profile page
                </Link>
                .
              </p>
              <p className='mt-2 inter text-sm text-gray-500'>
                Refund Policy - All tickets are non-refundable and
                non-transferable except in the case of event cancellation or
                technical issues.
              </p>
            </div>
          </div>
        </div>

        {/* Full Description Section (Catchy Para) */}
        {eventData.catchyPara && (
          <div
            id='full-description'
            className='mt-8 bg-black/30 backdrop-blur-lg border border-white/20 shadow-md rounded-2xl p-6 sm:p-8 scroll-mt-20'
          >
            <h2 className='text-2xl font-medium pp-fragment text-white mb-4 pb-3 border-b border-white/20'>
              About This Event
            </h2>
            <div className='prose prose-invert max-w-none'>
              <p className='text-base pp-fragment leading-relaxed text-gray-300 whitespace-pre-line break-words'>
                <Linkify text={eventData.catchyPara} />
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='text-center mt-12 sm:mt-16 text-gray-500 text-sm'>
          <p>Part of Tathva 26 | National Institute of Technology Calicut</p>
        </div>
      </div>
    </div>
  )
}
