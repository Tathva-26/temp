import jwtRequired from "@/axios/jwtRequired";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

export const regHandler = async (eventId ,ticketId) => {
    const url = `${process.env.NEXT_PUBLIC_API}/api/booking/create`;
    console.log(eventId);
    
    let bookingRes = undefined;
    
    try{
        bookingRes = await jwtRequired.post(url, { eventId, ticketId });
    }
    catch(error) {
        //console.error("Error during booking:", error.response.data.error);
        toast.error(error.response.data.error)
        return false;
    }

    console.log(bookingRes)

    const redirectUrl = bookingRes.data.redir_url;

    if (redirectUrl) {
        redirect(redirectUrl);
    } else {
        console.error("No redirect URL found in response");
    }
}