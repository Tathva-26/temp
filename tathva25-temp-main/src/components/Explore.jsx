import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MinimalSections() {
  const sections = [
    {
      image: "/images/workshops.jpg",
      title: "Workshops",
      description:
        "Hands-on sessions covering topics like robotics, AI, and sustainable tech. These workshops provide students with the opportunity to gain practical knowledge, work on real-world problems, and interact with industry professionals.",
    },
    {
      image: "/images/events.jpg",
      title: "Competitions",
      description:
        "Over 65 events including coding competitions, gaming, and cultural showcases. From technical battles of skill to fun informal events, Tathva’s events are designed to inspire innovation, teamwork, and creativity.",
    },
    {
      image: "/images/lecture.jpg",
      title: "Lectures",
      description:
        "Industry experts and academicians share insights on emerging technologies. The lecture series bridges the gap between academia and industry, inspiring students to think beyond classrooms and pursue cutting-edge innovations.",
    },
  ];

  return (
    <div className="bg-white py-16 px-4 sm:px-8">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section, index) => {
            const route = `/${section.title.toLowerCase()}`; // -> "/workshops" | "/events" | "/lectures"

            return (
              <Link href={route} key={index} className="group cursor-pointer block">
                <div>
                  <div className="overflow-hidden mb-4">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="md:w-110 h-120 object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                  </div>

                  <div className="w-full h-px bg-gray-200 mb-4"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl sm:text-4xl font-medium text-black mb-1 pp-fragment uppercase">
                          {section.title}
                        </h3>
                        <ArrowRight
                          size={16}
                          color="black"
                          className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                        />
                      </div>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
