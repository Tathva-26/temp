/**
 * Fake backend data, for developing without the API running.
 *
 * Turn it on with NEXT_PUBLIC_USE_MOCK_DATA=true (and
 * NEXT_PUBLIC_BACKEND_ENABLED=true so the pages do not show "coming soon").
 * Shapes mirror the real API: prices in paise, `venue` as an object, bookings
 * in TIQR's snake_case shape joined to events by `tiqrEventId`.
 */

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

const day = (offset, hour = 10, minute = 0) => {
  const d = new Date('2026-10-02T00:00:00+05:30')
  d.setDate(d.getDate() + offset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const venues = {
  arc: { id: 1, name: 'Architecture Auditorium', location: 'NITC Main Campus' },
  sac: { id: 2, name: 'Student Activity Centre', location: 'NITC Main Campus' },
  cs: { id: 3, name: 'CS Seminar Hall', location: 'Dept. of CSE' },
  ground: { id: 4, name: 'Open Air Theatre', location: 'NITC Main Campus' },
  ee: { id: 5, name: 'EE Lab Complex', location: 'Dept. of EEE' },
}

let nextId = 1
const event = (fields) => {
  const id = nextId++
  return {
    id,
    tiqrEventId: 9000 + id,
    ticketId: 5000 + id,
    published: true,
    picture: null,
    catchyPara: null,
    committee: null,
    isTeamEvent: false,
    teamSize: null,
    startTime: null,
    endTime: null,
    ...fields,
  }
}

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Registrations are open',
    content:
      'Workshop and competition registrations are now live. Grab your pass before the early-bird price ends.',
    published: true,
    createdAt: day(-5, 9),
  },
  {
    id: 2,
    title: 'Hackathon problem statements',
    content:
      'Problem statements will be shared at kickoff. Teams of up to four, at least one member on campus.',
    published: true,
    createdAt: day(-3, 18),
  },
  {
    id: 3,
    title: 'Venue change: Battle of Bands',
    content:
      'Battle of Bands moves to the Open Air Theatre. Timings are unchanged.',
    published: true,
    createdAt: day(-1, 12),
  },
  {
    id: 4,
    title: 'Draft announcement',
    content: 'Should not be visible.',
    published: false,
    createdAt: day(-1, 13),
  },
]

/** What GET /api/user/ returns. `role: "CA"` also lights up the referral card. */
export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'dev@tathva.test',
  name: 'Dev Tester',
  phone: '9876543210',
  referralCode: '',
  college: 'NIT Calicut',
  district: 'Kozhikode',
  state: 'Kerala',
  role: 'USER',
  branch: 'Computer Science',
  semester: 5,
  year: 3,
  picture: null,
}

export const MOCK_REFERRALS = {
  registered: true,
  referralCode: 'TATHVA-DEV26',
  successfulTicketCount: 12,
  successfulSalesAmount: 359800,
}

const tiqrBooking = (id, eventIndex, status, quantity, created) => ({
  id,
  status,
  quantity,
  created_at: created,
  ticket: {
    id: MOCK_EVENTS[eventIndex].ticketId,
    event: MOCK_EVENTS[eventIndex].tiqrEventId,
    type: MOCK_EVENTS[eventIndex].heading,
  },
})

export const MOCK_BOOKINGS = [
  tiqrBooking(101, 0, 'CONFIRMED', 1, day(-2, 12)),
  tiqrBooking(102, 5, 'PENDING', 2, day(-1, 20)),
  tiqrBooking(103, 6, 'FAILED', 1, day(-4, 8)),
]

/** TIQR's own event list, as GET /api/tiqr-events/ returns it. */
export const MOCK_TIQR_EVENTS = MOCK_EVENTS.slice(0, 8).map((e) => ({
  id: e.tiqrEventId,
  name: e.heading,
  genre: e.type,
  short_description: e.description,
  start_date: e.datetime,
  cover: e.picture ? { image: e.picture } : null,
  // Brochure, read by the competition and lecture detail pages.
  gallery: [],
}))
