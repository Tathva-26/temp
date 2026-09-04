import { ArrowRight } from "lucide-react";

export default function SectionCard({ image, title, description,date }) {
  return (
    <div className="group cursor-pointer">
      <div className="overflow-hidden mb-4">
        <img
          src={image}
          alt={title}
          className="w-full  object-cover h-[500px] transition-transform duration-300 group-hover:scale-102"
        />
      </div>

      <div className="w-full h-px bg-gray-200 mb-4"></div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-black mb-1 pp-fragment line-clamp-1 uppercase group">
              {title}
            </h3>
            <ArrowRight size={24} className="-mt-2 transform transition-transform duration-300 rotate-45 group-hover:-rotate-45 text-black" />
          </div>
          <p className="text-sm text-gray-600  border-x border-t mt-2 px-2 p-2">{description}</p>
          <p className="text-sm text-black  italic border p-1 px-2 font-semibold">{date}</p>
        </div>
      </div>
    </div>
  );
}
