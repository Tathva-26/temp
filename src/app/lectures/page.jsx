import SectionCard from "@/components/SectionCard";
import Link from "next/link";
import BackendStatus from "@/components/BackendStatus";
import { fetchEvents, formatPrice } from "@/lib/events";

const backendEnabled = process.env.NEXT_PUBLIC_BACKEND_ENABLED !== "false";

/*
 * Rendered per request. Which events are published changes whenever an admin
 * publishes one, so a build-time snapshot would go stale immediately — and
 * prerendering would also mean reaching for the backend during the build.
 */
export const dynamic = "force-dynamic";

/**
 * Published lectures. An empty list is a normal state — nothing is published
 * yet — so a fetch failure is swallowed rather than taking the page down.
 */
async function getLectures() {
  try {
    return await fetchEvents("lectures");
  } catch (err) {
    console.error("Failed to fetch lectures:", err);
    return [];
  }
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

  // Not filtered on `isFull`: it is local bookkeeping that is never refreshed
  // from TIQR, so a stale flag hid lectures that were still bookable.
  const lectures = await getLectures();

  return (
    <div className="bg-transparent min-h-screen pt-24 sm:pt-28 pb-4 sm:pb-10 px-4 sm:px-8 text-white">
      {/* Heading */}
      <div className="mb-12">
        <div className="mb-12 border-b border-gray-300 pb-4 mt-4">
          <h1 className="pp-fragment text-4xl sm:text-5xl md:text-6xl text-center md:text-left tracking-wide text-white uppercase md:mt-3">
            LECTURES
          </h1>
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="mx-auto">
        {lectures.length === 0 ? (
          <p className="text-center text-lg text-gray-300">
            No lectures announced yet. Check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {lectures.map((lecture) => (
              <Link href={`/lectures/${lecture.id}`} key={lecture.id}>
                <SectionCard
                  image={lecture.picture}
                  title={lecture.heading}
                  description={lecture.description}
                  price={formatPrice(lecture.price)}
                  extraInfo={lecture.venueName ?? ""}
                  closed={lecture.isClosed}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
