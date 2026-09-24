'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SectionCard from '@/components/SectionCard'
import { formatPrice } from '@/lib/events'

export default function CompetitionTabs({ tathvaEvents, preTathvaEvents, passEvents = [] }) {
  const [activeTab, setActiveTab] = useState('tathva')

  // Styles for the tab buttons
  const tabButtonBaseStyle =
    'w-full py-3 text-center font-semibold tracking-wide uppercase text-sm sm:text-base transition-colors duration-300 focus:outline-none'
  const activeTabTextStyle = 'text-white'
  const inactiveTabTextStyle = 'text-gray-500 hover:text-gray-300'

  const tabs = [
    {
      key: 'tathva',
      label: "Tathva '26",
      events: tathvaEvents,
      empty: "No Tathva '26 competitions match your search.",
    },
    {
      key: 'pretathva',
      label: 'Pre-Tathva',
      events: preTathvaEvents,
      empty: 'No Pre-Tathva competitions match your search.',
    },
    {
      key: 'passes',
      label: 'Passes',
      events: passEvents,
      empty: 'No passes match your search.',
    },
  ]
  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab)
  const active = tabs[activeIndex]

  return (
    <div className='mx-auto'>
      {/* Tab Navigation Container */}
      <div className='relative w-full max-w-xl mx-auto mb-12 border-b-2 border-white/20'>
        <div className='flex'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${tabButtonBaseStyle} ${
                activeTab === tab.key ? activeTabTextStyle : inactiveTabTextStyle
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          className='absolute bottom-[-2px] h-0.5 bg-white transition-all duration-300 ease-in-out'
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>

      {/* Active tab content */}
      <div id={`${active.key}-content`}>
        {active.events.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {active.events.map((event) => (
              <Link href={`competitions/${event.id}`} key={event.id}>
                <SectionCard
                  image={event.picture || '/images/events.jpg'}
                  title={event.heading || 'Untitled Event'}
                  description={event.description || 'No description available.'}
                  price={formatPrice(event.price)}
                  extraInfo={event.venueName ?? ''}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className='text-center text-gray-400 py-8'>{active.empty}</p>
        )}
      </div>
    </div>
  )
}
