import { ArrowRight } from "lucide-react";

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
}) {
  return (
    <div className="group cursor-pointer">
      <div className="overflow-hidden mb-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="w-full  object-cover h-[500px] transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          // `picture` is nullable on the API, and an <img> with src={null}
          // renders as a broken image.
          <div className="flex h-[500px] w-full items-center justify-center bg-white/5 text-center text-sm uppercase tracking-widest text-white/40">
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
            <ArrowRight size={24} className="-mt-2 transform transition-transform duration-300 rotate-45 group-hover:-rotate-45 text-white" />
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
