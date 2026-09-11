'use client'

import { forwardRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

const ContactPage = forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    email: '',
    phone: '',
    query: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validate = () => {
    if (
      !formData.topic.trim() ||
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.query.trim()
    ) {
      toast.error('All fields are required!')
      return false
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      toast.error('Please enter a valid email!')
      return false
    }

    if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number!')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (process.env.NEXT_PUBLIC_BACKEND_ENABLED === 'false') {
      toast.info('Contact submissions are coming soon.')
      return
    }
    if (!validate()) return

    try {
      setSubmitting(true)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/contact/create`,
        formData,
      )

      if (response.status === 201) {
        toast.success('Your query has been submitted successfully!')
        setFormData({ topic: '', name: '', email: '', phone: '', query: '' })
      } else {
        toast.error('Something went wrong. Please try again later.')
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      ref={ref}
      className='relative w-full bg-transparent px-4 py-24 text-white sm:px-6 lg:px-8 overflow-hidden'
    >
      <ToastContainer />
      
      <div className='mx-auto w-full max-w-4xl relative z-10'>
        <div className='mx-auto max-w-2xl text-center mb-12'>
          <p className='poppins text-xs uppercase tracking-[0.3em] text-cyan-400/80 mb-4 font-medium'>
            Get in touch
          </p>
          <h1 className='text-4xl md:text-5xl lg:text-6xl tracking-wider tathva-heading font-bold text-white drop-shadow-lg'>
            CONTACT US
          </h1>
          <p className='mx-auto mt-6 max-w-xl text-sm font-light leading-relaxed text-white/70 sm:text-base poppins'>
            For all Tathva-related enquiries, our team is just a message away. Drop us a line and we'll get back to you shortly.
          </p>
        </div>

        <div className='bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50'>
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2'
          >
            {/* Topic Input */}
            <div className='group'>
              <label
                htmlFor='topic'
                className='poppins block text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3 group-focus-within:text-cyan-400 transition-colors'
              >
                Topic
              </label>
              <input
                id='topic'
                type='text'
                name='topic'
                value={formData.topic}
                onChange={handleInputChange}
                placeholder='e.g. Workshops, Sponsorship'
                className='w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-white/20 poppins focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300'
              />
            </div>

            {/* Name Input */}
            <div className='group'>
              <label
                htmlFor='name'
                className='poppins block text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3 group-focus-within:text-cyan-400 transition-colors'
              >
                Name
              </label>
              <input
                id='name'
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Full Name'
                className='w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-white/20 poppins focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300'
              />
            </div>

            {/* Email Input */}
            <div className='group'>
              <label
                htmlFor='email'
                className='poppins block text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3 group-focus-within:text-cyan-400 transition-colors'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='yourname@example.com'
                className='w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-white/20 poppins focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300'
              />
            </div>

            {/* Phone Input */}
            <div className='group'>
              <label
                htmlFor='phone'
                className='poppins block text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3 group-focus-within:text-cyan-400 transition-colors'
              >
                Phone
              </label>
              <input
                id='phone'
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='+91 00000 00000'
                className='w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-white/20 poppins focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300'
              />
            </div>

            {/* Query Input */}
            <div className='group md:col-span-2'>
              <label
                htmlFor='query'
                className='poppins block text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3 group-focus-within:text-cyan-400 transition-colors'
              >
                Query Details
              </label>
              <textarea
                id='query'
                name='query'
                value={formData.query}
                onChange={handleInputChange}
                placeholder='How can we help you?'
                rows={5}
                className='w-full resize-none bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm sm:text-base leading-relaxed text-white placeholder-white/20 poppins focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300'
              />
            </div>

            {/* Submit Button */}
            <div className='flex justify-center pt-6 md:col-span-2'>
              <button
                type='submit'
                className='group relative flex items-center justify-center gap-3 w-full sm:w-auto overflow-hidden rounded-full bg-white/10 px-10 py-4 font-semibold text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50'
                disabled={submitting}
              >
                <span className='relative z-10 uppercase tracking-widest text-xs poppins'>
                  {submitting ? 'Submitting...' : 'Send Message'}
                </span>
                {!submitting && (
                  <svg
                    className='relative z-10 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M14 5l7 7m0 0l-7 7m7-7H3' />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
})

export default ContactPage
