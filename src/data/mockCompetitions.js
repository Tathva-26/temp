// Synthetic mock data for competitions page visualization.
// Used as a fallback when the backend API is unavailable or returns empty data.

const mockCompetitions = [
  // ─── Tathva '25 Competitions (committee !== "GPC") ────────────────────
  {
    id: "mock-robowars",
    heading: "RoboWars",
    description:
      "Build combat-ready robots and battle it out in the arena. Last bot standing wins!",
    committee: "Robotics",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹500",
    date: "Oct 24, 2025",
  },
  {
    id: "mock-codestorm",
    heading: "CodeStorm",
    description:
      "A high-intensity competitive programming contest — solve algorithmic challenges under pressure.",
    committee: "CSEA",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹200",
    date: "Oct 24, 2025",
  },
  {
    id: "mock-transporter",
    heading: "Transporter",
    description:
      "Design an autonomous bot that navigates a complex terrain and transports objects to the finish zone.",
    committee: "Robotics",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹400",
    date: "Oct 25, 2025",
  },
  {
    id: "mock-aeroglide",
    heading: "AeroGlide",
    description:
      "Design and fly fixed-wing RC aircraft through an obstacle course with maximum precision.",
    committee: "AeroClub",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹600",
    date: "Oct 25, 2025",
  },
  {
    id: "mock-bridge-it",
    heading: "Bridge It",
    description:
      "Construct a bridge from popsicle sticks that can bear the maximum load. Engineering at its finest.",
    committee: "CED",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹150",
    date: "Oct 25, 2025",
  },
  {
    id: "mock-circuitrix",
    heading: "Circuitrix",
    description:
      "Test your electronics and circuit-design skills by debugging and building circuits within time limits.",
    committee: "ECEA",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹200",
    date: "Oct 26, 2025",
  },
  {
    id: "mock-cad-clash",
    heading: "CAD Clash",
    description:
      "A timed CAD modelling competition — replicate complex 3D assemblies with precision in SolidWorks.",
    committee: "MED",
    isFull: false,
    picture: "/images/events.jpg",
    price: "₹250",
    date: "Oct 26, 2025",
  },
  {
    id: "mock-hackathon",
    heading: "Hackathon 2025",
    description:
      "A 24-hour hackathon to build innovative solutions for real-world problem statements.",
    committee: "CSEA",
    isFull: false,
    picture: "/images/events.jpg",
    price: "Free",
    date: "Oct 24-25, 2025",
  },

  // ─── Pre-Tathva Competitions (committee === "GPC") ────────────────────
  {
    id: "mock-quizzotica",
    heading: "Quizzotica",
    description:
      "A prelim science & tech quiz to warm up for Tathva. Open to all college students nationwide.",
    committee: "GPC",
    isFull: false,
    picture: "/images/events.jpg",
    price: "Free",
    date: "Oct 10, 2025",
  },
  {
    id: "mock-debugit",
    heading: "Debug It",
    description:
      "Find and fix hidden bugs in code snippets across multiple languages. Speed and accuracy matter.",
    committee: "GPC",
    isFull: false,
    picture: "/images/events.jpg",
    price: "Free",
    date: "Oct 12, 2025",
  },
  {
    id: "mock-ideathon",
    heading: "Ideathon",
    description:
      "Pitch your most creative tech idea in front of a panel. Top ideas get fast-tracked to the hackathon.",
    committee: "GPC",
    isFull: false,
    picture: "/images/events.jpg",
    price: "Free",
    date: "Oct 14, 2025",
  },
  {
    id: "mock-mathmania",
    heading: "MathMania",
    description:
      "An online math competition testing problem-solving, logic, and mathematical reasoning.",
    committee: "GPC",
    isFull: false,
    picture: "/images/events.jpg",
    price: "Free",
    date: "Oct 15, 2025",
  },
];

export default mockCompetitions;
