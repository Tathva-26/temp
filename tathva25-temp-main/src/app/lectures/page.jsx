import SectionCard from "@/components/SectionCard";
import Link from "next/link";

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
  const wlectures = await getLectures();
  const lectures = wlectures.filter(
    (w) => !(w.isFull)
  );

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-8">
      {/* Heading */}
      <div className=" mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl border-b pb-3 border-gray-300 text-center md:text-left tracking-wide pp-fragment text-gray-900 uppercase">
          LECTURES
        </h1>
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