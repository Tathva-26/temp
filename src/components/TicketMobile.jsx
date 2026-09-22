import Image from "next/image";
import { Michroma } from "next/font/google";
import localFont from "next/font/local";
import ModalWrapper from "./modelWrapperProShow";
import { toRupees } from "@/lib/events";

const mi = Michroma({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const fontspring = localFont({
  src: "../../public/fonts/fontspring.otf",
});

function TicketMobile({ day, date, eventId, price, isBookable = true }) {
  return (
    <div className="relative w-20 h-56 sm:w-20 sm:h-56 ">
      {/* Oversized Image */}
      <Image
        src="/newbg.png"
        alt="ticket"
        width={800}
        height={800}
        className="scale-x-[5] scale-y-[6] absolute rotate-90 right-0.5 top-25"
      />

      {/* Inner content box */}
      <div className="scale-130 w-20 h-56 sm:w-20 sm:h-56 z-10 relative flex flex-col gap-2 sm:gap-2 items-center justify-center">
        <div className="flex flex-col flex-1 p-2 items-center w-full">
          <p
            className={`${mi.className} font-bold text-white/90 tracking-widest text-center border-b-[0.5px] w-5/6 border-[#C8AD73] mt-3 mb-1 pb-[1px] text-[0.55rem] sm:text-[0.6rem]`}
          >
            TATHVA 2026
          </p>
          <p
            className={`${mi.className} text-[#D2B078] text-center text-[0.45rem] sm:text-[0.45rem] mt-2`}
          >
            ADMIT ONE
          </p>
          <div className="w-full flex justify-center mt-2">
            <Image
              src="/qr.png"
              alt="qr"
              width={50}
              height={50}
              className="w-10 h-10 sm:w-10 sm:h-10 mx-auto"
            />
          </div>
        </div>
        {/* <Image src="/verticalline.svg" alt="line" width={2} height={2} /> */}
        <p
          className={`${fontspring.className} text-base sm:text-lg font-bold text-[#e0b65a] -mt-3`}
        >
          {`DAY ${day}`}
        </p>
        <p
          className={`${mi.className} text-xs sm:text-xs text-center font-bold text-[#e0b65a]`}
        >
          {`OCT ${date} 2026`}
        </p>
        <p
          className={`${mi.className} text-[0.2rem] scale-140 sm:text-[0.3rem] text-center text-[#d1c7b0]`}
        >
          {day === 1 ? `Robowars | Wheels | Informals` : `Prowshow | Events | Informals`}
        </p>
        <div className="flex flex-col items-center justify-around gap-1">
          {day != 4 ? (
            <ModalWrapper
              eventId={eventId}
              price={price}
              isBookable={isBookable}
            />
          ) : null}
          <button
            className={`${mi.className} flex justify-center items-center rounded-sm px-2 py-1 bg-[#3E3E3B] text-[0.3rem] w-14 h-4 text-white`}
          >
            {day != 4 ? `Rs ${toRupees(price) ?? 0}/-` : `FREE`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketMobile;
