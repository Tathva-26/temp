import SectionCard from "@/components/SectionCard";
import Link from "next/link";
import BackendStatus from "@/components/BackendStatus";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

// Function to fetch all lectures from Strapi
async function getLectures() {
  const url = `${process.env.NEXT_PUBLIC_API}/api/events/all?type=lectures`;

  const res = await fetch(url);

  if (!res.ok) {
    console.log("Failed to fetch events:", res);
    return [];
  }
  const data = await res.json();

  // console.log(url)
  // console.log(data.events);

  return data.events; // Strapi nests the array in a 'data' object
}

// The page component
export default async function LecturesPage() {
  if (!backendEnabled) {
    return (
      <BackendStatus
        title="Lectures coming soon"
        message="Lecture details will be available soon."
      />
    );
  }

  const wlectures = await getLectures();
  const lectures = wlectures.filter((w) => !w.isFull);

  return (
    <div className="bg-black min-h-screen py-4 sm:py-10 px-4 sm:px-8 text-white">
      {/* Heading */}
      <div className="mb-12">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
        >
          ← Home
        </Link>
        <div className="mb-12 border-b border-gray-300 pb-4 mt-4">
          <h1 className="pp-fragment text-4xl sm:text-5xl md:text-6xl text-center md:text-left tracking-wide text-white uppercase md:mt-3">
            LECTURES
          </h1>
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {lectures.map((lecture) => (
            <Link href={`/lectures/${lecture.id}`} key={lecture.id}>
              <SectionCard
                // Your API doesn't have an image field, so we use a fallback
                image={lecture.picture}
                // Map API 'name' field to the 'title' prop
                title={lecture.heading}
                // The 'description' prop is populated by lecture.description
                description={lecture.description}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
