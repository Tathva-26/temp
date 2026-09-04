"use client"
import { useState,forwardRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Thumbs, FreeMode, Controller } from "swiper/modules"

import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/thumbs"

import styles from "./gallery.module.css"

const GalleryImages = [
  {
    id: 1,
    src: "/Hero_images/Hero.jpg",
    alt: "A musician playing a bass guitar on a brightly lit stage.",
  },
  {
    id: 2,
    src: "/images/events.jpg",
    alt: "A silhouette of a person in a crowd at a concert.",
  },
  {
    id: 3,
    src: "/images/lecture.jpg",
    alt: "A large, artistic sculpture of a blue and orange octopus.",
  },
  {
    id: 4,
    src: "/images/workshops.jpg",
    alt: "Students participating in a workshop event.",
  },
  {
    id: 5,
    src: "/images/proshow1.jpeg",
    alt: "Event activities and performances.",
  },
  
];

const Gallery = forwardRef((props, ref) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [mainSwiper, setMainSwiper] = useState(null)

  const slideNext = () => {
    mainSwiper?.slideNext()
    thumbsSwiper?.slideNext()
  }
  const slidePrev = () => {
    mainSwiper?.slidePrev()
    thumbsSwiper?.slidePrev()
  }

  return (
    <div ref={ref}  className=" my-auto mb-14" id="galleryx" >
      <div className={styles.container}>
<div className="flex justify-center items-center px-4 sm:px-8 lg:px-16 sm:py-12">
  <p className="text-center max-w-3xl text-gray-700  plus-jakarta leading-relaxed tracking-wide font-light ">
    <span className="bg-gradient-to-r pp-fragment from-gray-900 via-black to-gray-900 bg-clip-text text-transparent  text-3xl sm:text-5xl block mb-6 sm:mb-10">
      Tathva  Gallery 
    </span>
<span className="inline-block text-gray-600 font-light mb-5">
  Step into the vibrant spirit of{" "}
  <span className="font-medium text-gray-800">Tathva</span> — where every frame
  captures the energy of{" "}
  <span className="font-medium text-gray-800">innovation</span>,{" "}
  <span className="font-medium text-gray-800">creativity</span>, and{" "}
  <span className="font-medium text-gray-800">unforgettable moments</span> that
  define one of South India’s largest tech fests.
</span>
  </p>
</div>


        <div className={styles["gallery-container"]}>
          <Swiper
            modules={[Thumbs, Controller, FreeMode]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            onSwiper={setMainSwiper}
            direction="horizontal"
            slidesPerView="auto"
            loop={true}
            centeredSlides={true}
            spaceBetween={10}
            breakpoints={{ 514: { spaceBetween: 32 } }}
            className={styles["horizontal-swiper"]}
          >
            {GalleryImages.map((img) => (
              <SwiperSlide key={img.id} className={styles["swiper-slide"]}>
                <img src={img.src} alt={img.alt} />
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper
            modules={[FreeMode, Thumbs, Controller]}
            onSwiper={setThumbsSwiper}
            direction="vertical"
            slidesPerView={4}
            watchSlidesProgress={true}
            loop={true}
            centeredSlides={true}
            spaceBetween={6}
            freeMode={true}
            className={styles["vertical-swiper"]}
            breakpoints={{ 514: { slidesPerView: 5 } }}
            grabCursor={true}
          >
            {GalleryImages.map((img) => (
              <SwiperSlide key={img.id} className={styles["vertical-swiper-slide"]}>
                <img src={img.src} alt={img.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex mx-auto gap-5 mt-10">
          <button className="rounded-full p-2 transition-all duration-300 border border-gray-400 " onClick={slidePrev}>
           <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6   text-gray-700" />
          </button>
          <button className="rounded-full p-2 transition-all duration-300 border border-gray-400"onClick={slideNext}>
            <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6  text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  )
});
export default Gallery;
