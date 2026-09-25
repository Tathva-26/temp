'use client'
import { useState } from 'react'
import RegisterButton from './RegisterButton'
import useReferralCodeField from './useReferralCodeField'
import { toRupees } from '@/lib/events'

export default function Modal({
  isOpen,
  onClose,
  workshopData,
  // What this event is called in the checkout copy. Every caller passes its
  // own ("Workshop", "Competition", "Lecture") — hardcoding "Workshop" here
  // told competition and lecture registrants they were buying a workshop.
  eventType = 'Event',
  title = 'Checkout Summary',
}) {
  // A hook, so it has to run before the early return below.
  const [referralCode, referralCodeField] = useReferralCodeField(isOpen)
  const [passcode, setPasscode] = useState('')

  if (!isOpen) return null

  // `price` is paise straight from the API — see lib/events.
  const basePrice = toRupees(workshopData.price) ?? 0

  const platformFeePercent = 2.5
  const gstPercent = 18

  const platformFee = (platformFeePercent / 100) * basePrice
  const gst = (gstPercent / 100) * platformFee
  const total = basePrice + platformFee + gst

  // Proper INR formatter
  const formatINR = (num) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2, // Rounding won't affect us because every thing is over 100 for sure
    }).format(num)

  return (
    <div className='fixed inset-0 rounded-3xl bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white text-black rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-black text-lg'
        >
          ✕
        </button>

        {/* Title */}
        <h2 className='text-xl font-semibold mb-4 text-black'>{title}</h2>

        {/* Billing Breakdown */}
        <div className='space-y-4'>
          <div className='flex justify-between'>
            <span>{eventType} </span>
            <span>{workshopData.name}</span>
          </div>

          <div className='border-b pb-2 text-sm text-gray-700'>
            <div className='flex justify-between'>
              <span>{eventType} Price</span>
              <span>{formatINR(basePrice)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Platform Fee ({platformFeePercent}%)</span>
              <span>{formatINR(platformFee)}</span>
            </div>
            <div className='flex justify-between'>
              <span>GST on PlatForm Fee ({gstPercent}%)</span>
              <span>{formatINR(gst)}</span>
            </div>
          </div>

          <div className='flex justify-between text-lg font-semibold text-gray-900'>
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>

          {/*referralCodeField*/}

          {/* Shortlist-only events: the backend refuses payment without it. */}
          {workshopData.passcodeRequired && (
            <div>
              <label
                htmlFor='event-passcode'
                className='block text-sm text-gray-700 mb-1'
              >
                Passcode
              </label>
              <input
                id='event-passcode'
                type='text'
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoComplete='off'
                maxLength={64}
                placeholder='Enter your passcode'
                className='w-full px-3 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-gray-900'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Only shortlisted participants can register for this event.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className='flex justify-end gap-3 mt-6'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded-lg border text-black border-gray-300 hover:bg-gray-100 transition'
            >
              Cancel
            </button>
            {/* `id` is ours; TIQR's ticket is resolved server-side from it. */}
            <RegisterButton
              id={workshopData.id}
              referralCode={referralCode}
              passcode={workshopData.passcodeRequired ? passcode : undefined}
              disabled={
                !workshopData.isBookable ||
                (workshopData.passcodeRequired && !passcode.trim())
              }
              closed={workshopData.isClosed}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
