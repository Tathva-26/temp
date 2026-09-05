import jwtRequired from "@/axios/jwtRequired";
import toast from "react-hot-toast";

export const regHandler = async (eventId, ticketId) => {
  if (process.env.NEXT_PUBLIC_BACKEND_ENABLED === "false") {
    toast.info("Event registration is coming soon.");
    return false;
  }

  const url = `${process.env.NEXT_PUBLIC_API}/api/booking/create`;
  console.log(eventId);

  let bookingRes = undefined;

  try {
    bookingRes = await jwtRequired.post(url, { eventId, ticketId });
  } catch (error) {
    //console.error("Error during booking:", error.response.data.message);
    toast.error(
      error.response?.data?.message || "Booking failed. Please try again.",
    );
    return false;
  }

  console.log(bookingRes);

  const redirectUrl = bookingRes.data.redir_url;

  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    console.error("No redirect URL found in response");
  }
};
