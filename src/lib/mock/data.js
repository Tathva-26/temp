/**
 * Fake backend data, for developing without the API running.
 *
 * Turn it on with NEXT_PUBLIC_USE_MOCK_DATA=true (and
 * NEXT_PUBLIC_BACKEND_ENABLED=true so the pages do not show "coming soon").
 * Shapes mirror the real API: prices in paise, `venue` as an object, bookings
 * in TIQR's snake_case shape joined to events by `tiqrEventId`.
 */

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const day = (offset, hour = 10, minute = 0) => {
  const d = new Date("2026-10-02T00:00:00+05:30");
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const venues = {
  arc: { id: 1, name: "Architecture Auditorium", location: "NITC Main Campus" },
  sac: { id: 2, name: "Student Activity Centre", location: "NITC Main Campus" },
  cs: { id: 3, name: "CS Seminar Hall", location: "Dept. of CSE" },
  ground: { id: 4, name: "Open Air Theatre", location: "NITC Main Campus" },
  ee: { id: 5, name: "EE Lab Complex", location: "Dept. of EEE" },
};

let nextId = 1;
const event = (fields) => {
  const id = nextId++;
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
  };
};

export const MOCK_EVENTS = [
  // --- Workshops ---------------------------------------------------------
  event({
    type: "workshops",
    heading: "Intro to Generative AI",
    description:
      "A hands-on session on prompt design, retrieval and building a small assistant from scratch. Bring a laptop.",
    catchyPara: "Build your first AI assistant in one afternoon.",
    datetime: day(0, 10),
    time: "10:00 AM",
    price: 25000,
    venue: venues.cs,
    picture: "/images/workshops.jpg",
    committee: "TECH",
  }),
  event({
    type: "workshops",
    heading: "Embedded Systems with ESP32",
    description:
      "Wire up sensors, read data over I2C and push it to a live dashboard using an ESP32 board.",
    datetime: day(0, 14),
    time: "2:00 PM",
    price: 40000,
    venue: venues.ee,
    picture: "/images/workshops.jpg",
    committee: "TECH",
  }),
  event({
    type: "workshops",
    heading: "Drone Building 101",
    description: "Assemble, tune and fly a quadcopter. Kits are provided.",
    datetime: day(1, 9, 30),
    time: "9:30 AM",
    price: 60000,
    venue: venues.sac,
    picture: null,
    committee: "TECH",
  }),
  event({
    type: "workshops",
    heading: "Poster Design Sprint",
    description: "Two hours, one brief, and a critique at the end.",
    datetime: day(1, 15),
    time: "3:00 PM",
    price: 0,
    venue: venues.arc,
    picture: "/images/events.jpg",
    committee: "ARTS",
  }),
  event({
    type: "workshops",
    heading: "Quantum Computing Primer",
    description: "Qubits, gates and a first circuit on a real simulator.",
    datetime: day(2, 11),
    time: "11:00 AM",
    price: 15000,
    venue: venues.cs,
    picture: "/images/lecture.jpg",
    committee: "TECH",
    // Published but the TIQR push failed: shows the "not bookable" state.
    ticketId: 0,
  }),

  // --- Competitions ------------------------------------------------------
  event({
    type: "competitions",
    heading: "Hackathon: 24 Hours",
    description:
      "Build something that works, demo it, and defend it. Problem statements drop at kickoff.",
    catchyPara: "Sleep is optional. Shipping is not.",
    datetime: day(1, 18),
    startTime: day(1, 18),
    endTime: day(2, 18),
    price: 30000,
    venue: venues.cs,
    picture: "/images/events.jpg",
    committee: "TECH",
    isTeamEvent: true,
    teamSize: 4,
  }),
  event({
    type: "competitions",
    heading: "RoboWars",
    description: "Heavyweight bot combat in a purpose-built arena.",
    catchyPara: "Only one bot leaves the arena.",
    datetime: day(2, 13),
    price: 50000,
    venue: venues.ground,
    picture: "/images/events.jpg",
    committee: "TECH",
    isTeamEvent: true,
    teamSize: 5,
  }),
  event({
    type: "competitions",
    heading: "Battle of Bands",
    description: "Original music, 20 minutes on stage, judged live.",
    datetime: day(1, 19),
    price: 20000,
    venue: venues.ground,
    picture: "/images/proshow1.jpeg",
    committee: "GPC",
    isTeamEvent: true,
    teamSize: 6,
  }),
  event({
    type: "competitions",
    heading: "Dance Off",
    description: "Solo and group categories, all styles welcome.",
    datetime: day(2, 17),
    price: 10000,
    venue: venues.arc,
    picture: "/images/proshow1.jpeg",
    committee: "GPC",
  }),
  event({
    type: "competitions",
    heading: "Treasure Hunt",
    description: "Clues across campus. Free to enter, tough to win.",
    datetime: day(0, 16),
    price: 0,
    venue: venues.sac,
    picture: null,
    committee: "GPC",
    isTeamEvent: true,
    teamSize: 3,
  }),

  // --- Lectures ----------------------------------------------------------
  event({
    type: "lectures",
    heading: "The Future of Space Exploration",
    description: "A talk from a mission scientist on what comes after Artemis.",
    datetime: day(0, 17),
    price: 0,
    venue: venues.arc,
    picture: "/images/lecture.jpg",
  }),
  event({
    type: "lectures",
    heading: "Scaling Systems to a Billion Users",
    description: "Lessons from a decade of running production infrastructure.",
    datetime: day(1, 11),
    price: 0,
    venue: venues.arc,
    picture: "/images/lecture.jpg",
  }),
  event({
    type: "lectures",
    heading: "Ethics of Autonomous Machines",
    description: "Panel discussion with researchers and policy makers.",
    datetime: day(2, 10),
    price: 10000,
    venue: venues.sac,
    picture: null,
  }),

  // --- Passes ------------------------------------------------------------
  event({
    type: process.env.NEXT_PUBLIC_PASS_EVENT_TYPE || "pass",
    heading: "General Pass",
    description: "Entry to all lectures and competitions on all three days.",
    datetime: day(0, 8),
    price: 39900,
    venue: venues.arc,
  }),
  event({
    type: process.env.NEXT_PUBLIC_PASS_EVENT_TYPE || "pass",
    heading: "Workshop Pass",
    description: "Everything in General, plus any two workshops.",
    datetime: day(0, 8),
    price: 79900,
    venue: venues.arc,
  }),
  event({
    type: process.env.NEXT_PUBLIC_PASS_EVENT_TYPE || "pass",
    heading: "Pro Show Pass",
    description: "Front-row access to the closing pro show.",
    datetime: day(2, 19),
    price: 129900,
    venue: venues.ground,
  }),
  event({
    type: process.env.NEXT_PUBLIC_PASS_EVENT_TYPE || "pass",
    heading: "All Access Pass",
    description: "Every event, every workshop, every show.",
    datetime: day(0, 8),
    price: 199900,
    venue: venues.arc,
  }),

  // --- Unpublished: shown as "Booking full" ------------------------------
  event({
    type: "competitions",
    heading: "Code Golf",
    description: "Unpublished competition: Booking full.",
    datetime: day(1, 12),
    price: 5000,
    venue: venues.cs,
    picture: "/images/events.jpg",
    committee: "TECH",
    published: false,
    ticketId: 0,
  }),
  event({
    type: "lectures",
    heading: "Deep Sea Robotics",
    description: "Unpublished lecture: Booking full.",
    datetime: day(2, 12),
    price: 0,
    venue: venues.arc,
    picture: "/images/lecture.jpg",
    published: false,
    ticketId: 0,
  }),
  event({
    type: process.env.NEXT_PUBLIC_PASS_EVENT_TYPE || "pass",
    heading: "VIP Pass",
    description: "Unpublished pass: Booking full.",
    datetime: day(1, 8),
    price: 299900,
    venue: venues.arc,
    published: false,
    ticketId: 0,
  }),
  event({
    type: "workshops",
    heading: "Robotics Bootcamp",
    description: "Unpublished by an admin, so it renders as Booking full.",
    datetime: day(2, 9),
    price: 100,
    venue: venues.sac,
    published: false,
    ticketId: 0,
  }),
];

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Registrations are open",
    content:
      "Workshop and competition registrations are now live. Grab your pass before the early-bird price ends.",
    published: true,
    createdAt: day(-5, 9),
  },
  {
    id: 2,
    title: "Hackathon problem statements",
    content:
      "Problem statements will be shared at kickoff. Teams of up to four, at least one member on campus.",
    published: true,
    createdAt: day(-3, 18),
  },
  {
    id: 3,
    title: "Venue change: Battle of Bands",
    content: "Battle of Bands moves to the Open Air Theatre. Timings are unchanged.",
    published: true,
    createdAt: day(-1, 12),
  },
  {
    id: 4,
    title: "Draft announcement",
    content: "Should not be visible.",
    published: false,
    createdAt: day(-1, 13),
  },
];

/** What GET /api/user/ returns. `role: "CA"` also lights up the referral card. */
export const MOCK_USER = {
  id: "mock-user-1",
  email: "dev@tathva.test",
  name: "Dev Tester",
  phone: "9876543210",
  referralCode: "",
  college: "NIT Calicut",
  district: "Kozhikode",
  state: "Kerala",
  role: "USER",
  branch: "Computer Science",
  semester: 5,
  year: 3,
  picture: null,
};

export const MOCK_REFERRALS = {
  registered: true,
  referralCode: "TATHVA-DEV26",
  successfulTicketCount: 12,
  successfulSalesAmount: 359800,
};

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
});

export const MOCK_BOOKINGS = [
  tiqrBooking(101, 0, "CONFIRMED", 1, day(-2, 12)),
  tiqrBooking(102, 5, "PENDING", 2, day(-1, 20)),
  tiqrBooking(103, 6, "FAILED", 1, day(-4, 8)),
];

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
}));
