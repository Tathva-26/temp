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

function TicketMobile({ day, date, ticketId, eventId, price }) {
  return (
    <div className="relative w-20 h-56 sm:w-20 sm:h-56 ">
      {/* Oversized Image */}
      <Image
        src="/newbg.png"
        alt="ticket"
        width={800}
        height={800}
        className="scale-500 absolute rotate-90 right-0.5 top-25"
      />

      {/* Inner content box */}
      <div className="scale-130 w-20 h-56 sm:w-20 sm:h-56 z-10 relative flex flex-col gap-2 sm:gap-2 items-center justify-center">
        <div className="flex flex-col flex-1 p-2 items-center w-full">
          <p
            className={`${mi.className} pt-1 sm:pt-1 font-bold text-[#252527] text-[0.7rem] sm:text-[0.7rem] `}
          >
            TATHVA
          </p>
          <p
            className={`${mi.className} text-center pb-1 sm:pb-1 font-bold text-[#252527] text-[0.7rem] sm:text-[0.7rem] border-b-1 w-full border-[#C8AD73]`}
          >
            2025
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
          className={`${fontspring.className} text-lg sm:text-lg font-bold text-[#3E3E3B] -mt-3`}
        >
          {`DAY ${day}`}
        </p>
        <p
          className={`${mi.className} text-xs sm:text-xs text-center font-bold text-[#3E3E3B]`}
        >
          {`OCT ${date} 2025`}
        </p>
        <p
          className={`${mi.className} text-[0.2rem] scale-140 sm:text-[0.3rem] text-center text-[#3E3E3B]`}
        >
            {day === 1 ? `Robowars | Wheels | Informals` : `Prowshow | Events | Informals`}
        </p>
        <div className="flex flex-col items-center justify-around gap-1">
          {day != 4 ? (
            <ModalWrapper eventId={eventId} ticketId={ticketId} price={price} />
          ) : null}
          <button
            className={`${mi.className} flex justify-center items-center rounded-sm px-2 py-1 bg-[#3E3E3B] text-[0.3rem] w-14 h-4 text-white`}
          >
            {day != 4 ? `Rs ${price}/-` : `FREE`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketMobile;
