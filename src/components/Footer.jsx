
import React from 'react'
import Link from 'next/link' 

export default function Footer({refs}) {
  const handleScroll = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/tathva',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/tathva',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/tathva_nitcalicut/',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    }
  ];
  
  return (
    <>
      {/* Desktop/Tablet Footer */}
      <footer className="text-black hidden sm:block min-h-[240px] bg-gray-100">
        <div className="flex h-full w-full relative py-16">
          {/* Logo/Image - Left Side */}
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
            <img
              src="/images/TATHVA25_LOGO_BLACK.png"
              alt="Tathva Logo"
              className="h-20 w-auto brightness-0"
            />
          </div>
          {/* Navigation Links - Center */}
          <div className="footer-info w-full h-full flex justify-center items-center">
            <ul className="flex gap-16 max-md:gap-10 justify-center items-center">
              <li className="font-['pp-fragment'] text-black">
                <Link
                  href="/competitions"
                  className="inter text-xl leading-7 transition-colors"
                >
                  Events
                </Link>
              </li>
              <li className="font-['pp-fragment'] text-black">
                <Link
                  href="/workshops"
                  className="inter text-xl leading-7 transition-colors"
                >
                  Workshops
                </Link>
              </li>
              <li className="font-['pp-fragment'] text-black">
                <Link
                  href="/lectures"
                  className="inter text-xl leading-7 transition-colors"
                >
                  Lectures
                </Link>
              </li>
			  <li className="font-['pp-fragment'] text-black">
                <button onClick={() => handleScroll(refs.gallery)} 
                  className="inter text-xl leading-7 transition-colors"

                >
                  Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Right Side Content */}
        </div>

        {/* Bottom Section */}
        <div className="mx-9 max-md:mx-4 flex justify-between items-center py-8 gap-2 border-t border-black/20 text-black relative">
          <div className="flex gap-6">
            <button className="text-black hover:text-gray-500 transition-colors cursor-pointer">
              Terms & Conditions
            </button>
            <button className="text-black hover:text-gray-500 transition-colors cursor-pointer">
              Privacy Policy
            </button>
          </div>

          {/* Social Media Icons - Above the border line */}
          <div className="absolute bottom-35 -right-1 social-media-icons">
             <div className="flex items-center gap-4 mt-10">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.name}
          className="group flex items-center justify-center w-10 h-10 rounded-full border-2 border-black/10 hover:border-black/30 transition-all duration-200 hover:scale-110"
        >
          <span className="text-black/70 group-hover:text-black transition-colors duration-200">
            {link.icon}
          </span>
        </a>
      ))}
    </div>
          </div>

          <span className="text-sm text-black">&copy; TATHVA 2025</span>
        </div>
      </footer>

      {/* Mobile Footer */}
      <footer className="block sm:hidden mt-12 bg-gray-100 text-black">
        <div className="flex justify-between mx-auto max-w-[480px] mb-12 px-6 pt-8">
          {/* Navigation Links */}
          <div className="relative -bottom-9 h-[200px]">
            <ul className="flex flex-col items-start gap-6 ml-4">
              <li className="text-lg leading-6 font-['pp-fragment'] ">
                <Link
                  href="/events"
                  className="hover:text-gray-500 transition-colors pp-fragment tracking-wider text-black"
                >
                  Events
                </Link>
              </li>
              <li className="text-lg leading-6 ">
                <Link
                  href="/workshops"
                  className="hover:text-gray-500 transition-colors pp-fragment tracking-wider text-black"
                >
                  Workshops
                </Link>
              </li>
              <li className="text-lg leading-6 font-['pp-fragment'] ">
                <Link
                  href="/lectures"
                  className="hover:text-gray-500 transition-colors pp-fragment tracking-wider text-black"
                >
                  Lectures
                </Link>
              </li>
              <li className="text-lg leading-6 font-['pp-fragment'] ">
                <button onClick={() => handleScroll(refs.gallery)}
                  className="hover:text-gray-500 transition-colors pp-fragment tracking-wider text-black"
                >
                  Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Logo and Social Media */}
          <div className="flex flex-col items-start mt-8">
            <div className="h-15 w-40">
              <img
                src="/images/TATHVA25_LOGO_BLACK.png"
                alt="Tathva Logo"
                className="brightness-0"
              />
            </div>

            {/* Social Media Icons */}
 <div className="flex items-center gap-4 mt-10">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.name}
          className="group flex items-center justify-center w-10 h-10 rounded-full border-2 border-black/10 hover:border-black/30 transition-all duration-200 hover:scale-110"
        >
          <span className="text-black/70 group-hover:text-black transition-colors duration-200">
            {link.icon}
          </span>
        </a>
      ))}
    </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col p-0 m-0">
          <div className="hidden w-full justify-center gap-6 py-4 text-black font-['Sweet_Sans_Pro'] font-normal text-sm leading-4">
            <button className="hover:text-gray-500 transition-colors cursor-pointer">
              Terms & Conditions
            </button>
            <button className="hover:text-gray-500 transition-colors cursor-pointer">
              Privacy Policy
            </button>
          </div>
          <div className=" border-black/15 flex justify-center items-center py-4 w-full font-['Sweet_Sans_Pro'] font-normal text-sm">
            <span className="text-black inter">&copy; TATHVA 2025</span>
          </div>
        </div>
      </footer>
    </>
  );
}
