'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BellDot, Menu, X } from 'lucide-react'
import Particles from '@/components/Particles'
import HeroTitle from '@/components/HeroTitle'

const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: { enable: true, value_area: 800 },
      limit: 100,
    },
    color: { value: '#ffffff' },
    shape: {
      type: 'circle',
      stroke: { width: 0, color: '#000000' },
      polygon: { nb_sides: 5 },
      image: { src: 'img/github.svg', width: 100, height: 100 },
    },
    opacity: {
      value: 0.5,
      random: false,
      anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#ffffff',
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 3.2,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: {
        enable: false,
        rotateX: 3866.8234439981356,
        rotateY: 5918.607312242045,
      },
    },
  },
  interactivity: {
    detect_on: 'window',
    events: {
      onhover: { enable: true, mode: 'repulse' },
      onclick: { enable: true, mode: 'push' },
      resize: true,
    },
    modes: {
      grab: { distance: 400, line_linked: { opacity: 0.534278844986279 } },
      bubble: {
        distance: 194.89853095232286,
        size: 381.6762897816322,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: { distance: 111.8881118881119, duration: 0.4 },
      push: { particles_nb: 4 },
      remove: { particles_nb: 2 },
    },
  },
  retina_detect: false,
}

export default function Hero({ refs }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const router = useRouter()

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

  const handleVisitDashboard = () => {
    router.push('/profile')
  }

  const CountdownBox = ({ value, label }) => (
    <div className='flex flex-col items-center'>
      <div>
        <p className='text-2xl sm:text-3xl md:text-6xl font-bold text-white monocraft'>
          {String(value).padStart(2, '0')}
        </p>
      </div>
      <p className='text-xs sm:text-sm md:text-base font-semibold mt-1 text-white'>
        {label}
      </p>
    </div>
  )

  return (
    <header
      className='relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-transparent py-24 text-white sm:py-16'
      style={{ fontFamily: 'PPFragment, sans-serif' }}
    >
      {/* 2. REPLACE GALAXY WITH PARTICLES HERE */}
      <div className='absolute inset-0 z-0 mix-blend-screen'>
        <Particles options={particlesOptions} />
      </div>

      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-black sm:h-56' />

      <Image
        src='/images/TATHVA25_LOGO_BLACK.png'
        alt='Tathva Logo'
        width={150}
        height={150}
        className='absolute top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-10 invert'
      />

      <div className='absolute top-20 right-10 max-[639px]:top-4 max-[639px]:right-3 z-50 flex items-center gap-2'>
        <Link className='p-2' href='/announcements'>
          <BellDot size={24} className='text-white hover:text-cyan-400 transition-colors' />
        </Link>
      </div>

      {/* Countdown Timer */}
      <div className='z-10 flex flex-col items-center'>
        <p className='mb-3 text-center text-sm font-black uppercase tracking-wide text-white sm:text-base md:mb-4 md:text-xl'>
          Website Launching IN
        </p>
        <div className='flex items-center justify-center gap-1 px-2 sm:gap-3 md:gap-6'>
          <CountdownBox value={countdown.days} label='DAYS' />
          <div className='flex items-center text-lg md:text-5xl font-bold text-white'>
            :
          </div>
          <CountdownBox value={countdown.hours} label='HOURS' />
          <div className='flex items-center text-lg md:text-5xl font-bold text-white'>
            :
          </div>
          <CountdownBox value={countdown.minutes} label='MINS' />
          <div className='flex items-center text-lg md:text-5xl font-bold text-white'>
            :
          </div>
          <CountdownBox value={countdown.seconds} label='SECS' />
        </div>
      </div>

      <div className='z-10 mt-8 flex flex-col items-center px-4 text-center md:mt-16'>
        <p className='text-lg md:text-2xl xl:text-3xl'>2026</p>
        <HeroTitle />
        <p className='mt-2 text-lg md:text-2xl xl:text-3xl'>OCT 9, 10, 11</p>
      </div>

      <div className='z-10 mt-8 flex w-full flex-col items-center gap-6 px-4 md:mt-12'>
        {/* Desktop Nav */}
        <div className='hidden md:flex w-full max-w-4xl items-center justify-center flex-wrap gap-4 md:text-xl xl:gap-8 xl:text-2xl text-center'>
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
          <Link href='/announcements' className='px-5 py-2 bg-black/3 backdrop-blur-xl border border-white/40 rounded-md transition-all duration-300 hover:bg-black/25 hover:scale-110'>
            ANNOUNCEMENTS
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className='flex md:hidden w-full max-w-4xl items-center justify-center flex-wrap gap-3 text-center poppins'>
          {["Workshops", "Competitions", "Passes", "Lectures", "Accomodation", "Announcements"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className='px-6 py-2.5 sm:px-8 sm:py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105'
            >
              {item}
            </Link>
          ))}
        </div>

        <button
          onClick={handleVisitDashboard}
          className='z-10 flex items-center gap-3 bg-black/[0.08] backdrop-blur-xl border border-white/40 text-white font-semibold py-3 px-6 rounded-md transition-all duration-300 hover:bg-black/[0.20] hover:scale-105 group mt-4 md:mt-6'
        >
          <svg
            className='w-5 h-5'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
            <polyline points='9 22 9 12 15 12 15 22' />
          </svg>
          <span className='monocraft'>Visit Dashboard</span>
        </button>
      </div>
    </header>
  )
}
