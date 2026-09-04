import Image from "next/image";
import { Michroma } from "next/font/google";
import localFont from "next/font/local";
import ModalWrapper from "./modelWrapperProShow";

const mi = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const fontspring = localFont({
  src: "../../public/fonts/fontspring.otf",
});

function Ticket({ day, date, ticketId, eventId, price }) {
  // Dynamic event text based on day
  const eventText =
    day === 1 ? "Wheels | Robowars | Conclave" : "Proshow | Events | Conclave";

  return (
    <div className="relative bottom-10 w-56 h-20 sm:w-96 sm:h-24 md:w-110 md:h-36 lg:w-130 lg:h-36">
      {/* Oversized Image */}
      <Image
        src="/newbg.png"
        alt="ticket"
        width={800}
        height={800}
        className="scale-120 absolute"
      />

      {/* Inner content box */}
      <div className="w-56 h-20 sm:w-96 sm:h-34 md:w-110 md:h-40 lg:w-130 lg:h-45 z-10 relative flex gap-2 sm:gap-2 md:gap-3 lg:gap-10 items-center justify-center">
        <div className="flex flex-col flex-1 scale-120 p-2">
          <p
            className={`${mi.className} pl-2 sm:pl-5 md:pl-6 lg:pl-8 pt-1 sm:pt-0 md:pt-1 lg:pt-2 text-[#252527] text-xs sm:text-[0.8rem] md:text-[1rem] lg:text-lg underline underline-offset-2 sm:underline-offset-2 md:underline-offset-2 lg:underline-offset-4 decoration-[#C8AD73]`}
          >
            TATHVA 2025
          </p>
          <p
            className={`${mi.className} text-[#D2B078] text-[0.5rem] sm:text-[0.6rem] md:text-[0.8rem] lg:text-[0.7rem] pl-2 sm:pl-5 md:pl-6 lg:pl-8`}
          >
            ADMIT ONE
          </p>
          <div className="flex ml-auto mb-1 sm:mt-2 sm:scale-120 md:mt-4 md:scale-140 lg:scale-120 lg:mb-2 mr-1 sm:mr-12 md:mr-16 lg:mr-10">
            <Image
              src="/qr.png"
              alt="qr"
              width={50}
              height={50}
              className="size-6 sm:size-10 md:size-10 lg:size-16"
            />
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-1 items-start scale-120">
          <p
            className={`${fontspring.className} text-base sm:text-4xl md:text-4xl lg:text-5xl md:pl-3 font-bold text-[#3E3E3B]`}
          >
            {`DAY ${day}`}
          </p>
          <p
            className={`${mi.className} text-xs sm:text-md md:text-lg lg:text-xl font-bold md:pl-3 text-[#3E3E3B]`}
          >
            {`OCT ${date} 2025`}
          </p>
          <p
            className={`${mi.className} text-[0.5rem] sm:text-[0.52rem] md:text-[0.6rem] md:pl-3 lg:text-[0.65rem] text-[#3E3E3B]`}
          >
            {eventText}
          </p>
          <div className="flex items-center justify-between gap-2 md:pl-3">
            {/* ModalWrapper receives ticketId, eventId, price */}
            {day != 4 ? (
              <ModalWrapper
                eventId={eventId}
                ticketId={ticketId}
                price={price}
              />
            ) : null}
            <button
              className={`${mi.className} bg-[#3E3E3B] cursor-pointer rounded-xs text-[0.5rem] sm:text-[0.4rem] md:text-[0.5rem] lg:text-[0.65rem] w-12 h-3 sm:w-16 sm:h-4 md:w-18 md:h-4 lg:w-23 lg:h-5 text-white`}
            >
              {day != 4 ? `Rs ${price}/-` : `FREE`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticket;
