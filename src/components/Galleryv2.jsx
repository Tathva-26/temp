'use client'

import { forwardRef } from 'react'
import InfiniteSpiral from './InfiniteSpiral'
import MobileGallery from './MobileGallery'
import { CDN_BASE_URL } from '@/lib/cdn'

const baseGalleryImages = [
  {
    src: `${CDN_BASE_URL}/images/carousel/1.jpeg`,
    alt: '',
  },
  {
    src: `${CDN_BASE_URL}/images/carousel/2.jpeg`,
    alt: '',
  },
  {
    src: `${CDN_BASE_URL}/images/carousel/3.jpeg`,
    alt: '',
  },
  {
    src: `${CDN_BASE_URL}/images/carousel/7.jpeg`,
    alt: '',
  },
  { src: `${CDN_BASE_URL}/images/carousel/5.jpeg`, alt: '' },
  { src: `${CDN_BASE_URL}/images/carousel/6.jpeg`, alt: '' },
]

const Gallery = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      id='galleryx'
      className='my-auto mb-14 bg-transparent relative z-10'
    >
      <div className='flex justify-center items-center px-4 sm:px-8 lg:px-16 sm:py-12 relative'>
        {/* Creative "Dark Nebula" Fade for Gallery Text */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.85)_0%,_rgba(0,0,0,0.5)_40%,_transparent_70%)] pointer-events-none -z-10' />

        <p className='text-center max-w-3xl text-gray-200 plus-jakarta leading-relaxed tracking-wide font-light drop-shadow-md'>
          <span className='bg-gradient-to-r pp-fragment from-white via-gray-200 to-white bg-clip-text text-transparent text-4xl tracking-wide sm:text-5xl block mb-6 sm:mb-10 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]'>
            Tathva Gallery
          </span>
          <span className='inline-block text-white/90 font-light mb-5'>
            Scroll through the moments that define Tathva — step into the
            vibrant spirit of{' '}
            <span className='font-medium text-white'>creativity</span> and{' '}
            <span className='font-medium text-white'>unforgettable</span>{' '}
            memories.
          </span>
        </p>
      </div>

      <div className='relative h-auto sm:h-[800px] w-full sm:overflow-hidden'>
        {/* Desktop: Infinite Spiral */}
        <div className='hidden sm:block h-full w-full'>
          <InfiniteSpiral
            items={baseGalleryImages}
            imageFit='contain'
            animationMode='all'
            speed={0.5}
            cardWidth={400}
            cardHeight={520}
            radius={350}
            cardsPerTurn={3.5}
            verticalSpacing={200}
          />
        </div>

        {/* Mobile: Original Snap Gallery */}
        <div className='block sm:hidden h-full w-full'>
          <MobileGallery />
        </div>
      </div>
    </div>
  )
})

export default Gallery
