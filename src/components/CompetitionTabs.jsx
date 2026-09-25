'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SectionCard from '@/components/SectionCard'
import { formatPrice } from '@/lib/events'
import { CDN_BASE_URL } from '@/lib/cdn'

function EventGrid({ events }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
      {events.map((event) => (
        <Link href={`competitions/${event.id}`} key={event.id}>
          <SectionCard
            image={event.picture || `${CDN_BASE_URL}/images/events.jpg`}
            title={event.heading || 'Untitled Event'}
            description={event.description || 'No description available.'}
            price={formatPrice(event.price)}
            extraInfo={event.venueName ?? ''}
            closed={event.isClosed}
          />
        </Link>
      ))}
    </div>
  )
}

export default function CompetitionTabs({
  tathvaEvents,
  preTathvaEvents,
  robowarsEvents = [],
  passEvents = [],
}) {
  const [activeTab, setActiveTab] = useState('tathva')

  // Styles for the tab buttons
  const tabButtonBaseStyle =
    'w-full py-3 text-center font-semibold tracking-wide uppercase text-sm sm:text-base transition-colors duration-300 focus:outline-none'
  const activeTabTextStyle = 'text-white'
  const inactiveTabTextStyle = 'text-gray-500 hover:text-gray-300'

  return (
    <div className='mx-auto'>
      {/* Tab Navigation Container */}
      <div className='relative w-full max-w-md mx-auto mb-12 border-b-2 border-white/20'>
        <div className='flex'>
          <button
            onClick={() => setActiveTab('tathva')}
            className={`${tabButtonBaseStyle} ${
              activeTab === 'tathva' ? activeTabTextStyle : inactiveTabTextStyle
            }`}
          >
            Tathva '26
          </button>
          <button
            onClick={() => setActiveTab('pretathva')}
            className={`${tabButtonBaseStyle} ${
              activeTab === 'pretathva'
                ? activeTabTextStyle
                : inactiveTabTextStyle
            }`}
          >
            Pre-Tathva
          </button>
        </div>
        <div
          className='absolute bottom-[-2px] h-0.5 bg-white transition-all duration-300 ease-in-out'
          style={{
            width: '50%',
            transform:
              activeTab === 'tathva' ? 'translateX(0%)' : 'translateX(100%)',
          }}
        />
      </div>

      {/* Conditional Content Display */}
      <div>
        {/* Renders when 'Tathva '25' tab is active */}
        {activeTab === 'tathva' && (
          <div id='tathva-content'>
            {robowarsEvents.length + passEvents.length + tathvaEvents.length >
            0 ? (
              [
                ['Robowars', robowarsEvents],
                ['Passes', passEvents],
                ['Other Competitions', tathvaEvents],
              ]
                .filter(([, events]) => events.length > 0)
                .map(([title, events]) => (
                  <section key={title} className='mb-12'>
                    <h2 className='text-2xl sm:text-3xl font-semibold tracking-wide uppercase mb-6'>
                      {title}
                    </h2>
                    <EventGrid events={events} />
                  </section>
                ))
            ) : (
              <p className='text-center text-gray-400 py-8'>
                No Tathva '26 competitions match your search.
              </p>
            )}
          </div>
        )}

        {/* Renders when 'Pre-Tathva' tab is active */}
        {activeTab === 'pretathva' && (
          <div id='pretathva-content'>
            {preTathvaEvents.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
                {preTathvaEvents.map((event) => (
                  <Link href={`competitions/${event.id}`} key={event.id}>
                    <SectionCard
                      image={event.picture || `${CDN_BASE_URL}/images/events.jpg`}
                      title={event.heading || 'Untitled Event'}
                      description={
                        event.description || 'No description available.'
                      }
                      price={formatPrice(event.price)}
                      extraInfo={event.venueName ?? ''}
                      closed={event.isClosed}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className='text-center text-gray-400 py-8'>
                No Pre-Tathva competitions match your search.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
