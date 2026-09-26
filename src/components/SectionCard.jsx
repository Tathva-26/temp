import { ArrowRight } from "lucide-react";
import ClosedBanner from "@/components/ClosedBanner";

/**
 * `price` and `extraInfo` arrive pre-formatted — `formatPrice` in lib/events
 * and the venue name respectively. They were being passed in and dropped on
 * the floor here, so a card showed no price at all.
 */
export default function SectionCard({
  image,
  title,
  description,
  date,
  price,
  extraInfo,
  closed = false,
}) {
  return (
    <div className={closed ? "cursor-pointer" : "group cursor-pointer"}>
      <div className="relative overflow-hidden mb-4">
        {closed ? <ClosedBanner /> : null}
        {image ? (
          // Uniform 2:3 poster slot with the picture contained inside it and
          // nothing drawn behind it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className={`aspect-[2/3] w-full object-contain ${
              closed
                ? "grayscale opacity-50"
                : "transition-transform duration-300 group-hover:scale-102"
            }`}
          />
        ) : (
          // `picture` is nullable on the API, and an <img> with src={null}
          // renders as a broken image.
          <div className="flex aspect-[2/3] w-full items-center justify-center border border-dashed border-white/15 text-center text-sm uppercase tracking-widest text-white/40">
            {title}
          </div>
        )}
      </div>

      <div className="w-full h-px bg-white/20 mb-4"></div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-white mb-1 pp-fragment line-clamp-1 uppercase group">
              {title}
            </h3>
            <ArrowRight size={24} className={`-mt-2 text-white ${
                closed
                  ? "rotate-45 opacity-40"
                  : "transform transition-transform duration-300 rotate-45 group-hover:-rotate-45"
              }`} />
          </div>
          <p className="text-sm text-gray-300  border-x border-t mt-2 px-2 p-2">{description}</p>
          <p className="text-sm text-gray-300  italic border p-1 px-2 font-semibold">{date}</p>
          {price || extraInfo ? (
            <p className="mt-2 text-sm font-semibold text-white">
              {price}
              {price && extraInfo ? " · " : ""}
              {extraInfo}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
