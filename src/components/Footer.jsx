import React from 'react'
import Link from 'next/link'

export default function Footer({ refs }) {
  const handleScroll = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/tathva',
      icon: (
        <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
          <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/tathva',
      icon: (
        <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/tathva_nitcalicut/',
      icon: (
        <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
          <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
        </svg>
      ),
    },
  ]

  return (
    <footer className='relative w-full bg-black/40 backdrop-blur-2xl border-t border-white/10 text-white overflow-hidden mt-12'>
      <div className='max-w-7xl mx-auto px-6 sm:px-8 '>
        {/* =========================
            MAIN FOOTER
        ========================== */}

        <div className='relative flex flex-wrap flex-col items-center justify-center min-h-48 sm:min-h-32 py-10'>
          {/* Logo - absolutely centered */}
          <div className='mb-8 md:mb-0'>
            <img
              src='/images/TATHVA25_LOGO_BLACK.png'
              alt='Tathva Logo'
              className='h-14 sm:h-20 w-auto invert opacity-90 hover:opacity-100 transition-opacity duration-300'
            />
          </div>

          {/* Navigation */}
          <ul className='grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-6 sm:gap-10 md:gap-16 justify-items-center sm:justify-center items-center md:mt-10'>
            <li>
              <Link
                href='/competitions'
                className='text-lg sm:text-xl font-medium tracking-wider uppercase text-white/80 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] pp-fragment'
              >
                Events
              </Link>
            </li>

            <li>
              <Link
                href='/workshops'
                className='text-lg sm:text-xl font-medium tracking-wider uppercase text-white/80 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] pp-fragment'
              >
                Workshops
              </Link>
            </li>

            <li>
              <Link
                href='/lectures'
                className='text-lg sm:text-xl font-medium tracking-wider uppercase text-white/80 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] pp-fragment'
              >
                Lectures
              </Link>
            </li>

            <li>
              <button
                onClick={() => handleScroll(refs.gallery)}
                className='text-lg sm:text-xl font-medium tracking-wider uppercase text-white/80 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] pp-fragment cursor-pointer'
              >
                Gallery
              </button>
            </li>
          </ul>
        </div>

        {/* =========================
            BOTTOM SECTION
        ========================== */}

        <div className='relative flex flex-col sm:flex-row justify-between items-center gap-6 py-8 border-t border-white/10'>
          {/* Terms & Privacy */}
          <div className='flex gap-6 order-2 sm:order-1'>
            <button className='text-xs sm:text-sm text-white/50 hover:text-cyan-400 transition-colors duration-300 cursor-pointer poppins uppercase tracking-widest'>
              Terms & Conditions
            </button>

            <button className='text-xs sm:text-sm text-white/50 hover:text-cyan-400 transition-colors duration-300 cursor-pointer poppins uppercase tracking-widest'>
              Privacy Policy
            </button>
          </div>

          {/* Social Media */}
          <div className='flex items-center gap-5 order-1 sm:order-2'>
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target='_blank'
                rel='noreferrer noopener'
                aria-label={link.name}
                className='group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/20 transition-all duration-300 hover:scale-110 hover:border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              >
                <span className='text-white/70 group-hover:text-cyan-400 transition-colors duration-300'>
                  {link.icon}
                </span>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <span className='text-xs text-white/50 order-3 poppins uppercase tracking-widest'>
            &copy; TATHVA 2026
          </span>
        </div>
      </div>
    </footer>
  )
}
