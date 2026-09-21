'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeroTitle from '@/components/HeroTitle'
import AuthButton from '@/components/AuthButton'

export default function Hero({ refs }) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const handleScroll = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date('2026-10-01T18:00:00').getTime()
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        )
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  const CountdownBox = ({ value, label }) => (
    <div className='flex flex-col items-center'>
      <div className='flex items-center justify-center'>
        <p className='text-2xl sm:text-3xl md:text-6xl font-bold text-white monocraft leading-none'>
          {String(value).padStart(2, '0')}
        </p>
      </div>
      <p className='text-xs sm:text-sm md:text-base font-semibold mt-1 text-white'>
        {label}
      </p>
    </div>
  )

  const Colon = () => (
    <div className='flex flex-col items-center'>
      <div className='flex items-center justify-center'>
        <span className='text-2xl sm:text-3xl md:text-6xl font-bold text-white monocraft leading-none -translate-y-[0.1em]'>
          :
        </span>
      </div>
      <span
        className='text-xs sm:text-sm md:text-base font-semibold mt-1 invisible select-none pointer-events-none'
        aria-hidden='true'
      >
        &nbsp;
      </span>
    </div>
  )

  return (
    <header
      className='relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-transparent py-10 text-white sm:py-16 pointer-events-none'
      style={{ fontFamily: 'PPFragment, sans-serif' }}
    >



      <Image
        src='/images/TATHVA25_LOGO_BLACK.png'
        alt='Tathva Logo'
        width={150}
        height={150}
        className='absolute top-6 left-6 sm:top-8 sm:left-12 z-10 invert pointer-events-none'
      />

      <div className='absolute top-6 right-6 sm:top-8 sm:right-12 z-50 pointer-events-auto'>
        <AuthButton />
      </div>

      {/* Countdown Timer */}
      <div className='z-10 flex flex-col items-center pointer-events-auto'>
        <p className='mb-3 text-center text-sm font-black uppercase tracking-wide text-white sm:text-base md:mb-4 md:text-xl'>
          Website Launching IN
        </p>
        <div className='flex items-start justify-center gap-1 px-2 sm:gap-3 md:gap-6'>
          <CountdownBox value={countdown.days} label='DAYS' />
          <Colon />
          <CountdownBox value={countdown.hours} label='HOURS' />
          <Colon />
          <CountdownBox value={countdown.minutes} label='MINS' />
          <Colon />
          <CountdownBox value={countdown.seconds} label='SECS' />
        </div>
      </div>

      <div className='z-10 mt-8 flex flex-col items-center px-4 text-center md:mt-16 pointer-events-none'>
        <p className='text-lg md:text-2xl xl:text-3xl'>2026</p>
        <HeroTitle />
        <p className='mt-2 text-lg md:text-2xl xl:text-3xl'>OCT 9, 10, 11</p>
      </div>

      <div className='z-10 mt-8 flex w-full flex-col items-center gap-6 px-4 md:mt-12 pointer-events-none'>
        {/* Desktop Nav */}
        <div className='hidden md:flex w-full max-w-4xl items-center justify-center flex-wrap gap-4 md:text-xl xl:gap-8 xl:text-2xl text-center pointer-events-auto'>
          <Link href='/workshops' className='px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110'>
            WORKSHOPS
          </Link>
          <Link href='/competitions' className='px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110'>
            COMPETITIONS
          </Link>
          <Link href='/passes' className='px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110'>
            PASSES
          </Link>
          <Link href='/lectures' className='px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110'>
            LECTURES
          </Link>
          <Link href='/accomodation' className='px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110'>
            ACCOMODATION
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className='flex md:hidden w-full max-w-4xl items-center justify-center flex-wrap gap-3 text-center poppins pointer-events-auto'>
          {["Workshops", "Competitions", "Passes", "Lectures", "Accomodation"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className='px-6 py-2.5 sm:px-8 sm:py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105'
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
