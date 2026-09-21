import { ArrowRight } from "lucide-react";

export default function SectionCard({ image, title, description, date, price }) {
  return (
    <div className="group cursor-pointer">
      {/* Image container with aspect ratio and hover zoom */}
      <div className="relative overflow-hidden rounded-xl aspect-square">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Dark gradient overlay — deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90 pointer-events-none" />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/15 mt-4 mb-3" />

      {/* Title + arrow */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-white pp-fragment uppercase line-clamp-1 leading-tight">
          {title}
        </h3>
        <ArrowRight
          size={20}
          className="flex-shrink-0 -mt-0.5 text-white/70 transition-all duration-300 rotate-[-45deg] group-hover:rotate-0 group-hover:text-white"
        />
      </div>

      {/* Description — 2-line clamp */}
      <p className="text-sm text-gray-400 inter mt-1.5 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Metadata row — date + fee pills */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {date && (
          <span className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1 inter">
            {date}
          </span>
        )}
        {price != null && (
          <span className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1 inter">
            {typeof price === "number" ? `₹${price}` : price}
          </span>
        )}
      </div>
    </div>
  );
}
