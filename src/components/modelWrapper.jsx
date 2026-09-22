"use client";

import { useState } from "react";
import Modal from "./model";
import { useUserContext } from "@/context/UserContext";


export default function ModalWrapper({ workshopData, eventType }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoggedIn, authLoading, loginWithGoogle } = useUserContext();

    // Signed out, this button *is* the sign-in entry point: start Google OAuth
    // rather than dumping the user on the homepage with nothing to click.
    const handleClick = () => {
        if (!isLoggedIn) {
            loginWithGoogle();
            return;
        }
        setIsModalOpen(true);
    };

    return (
        // FIX: Removed 'my-4' margin from the ModalWrapper's main div
        <div className="flex">
            <button
                onClick={handleClick}
                disabled={authLoading}
                className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
                {isLoggedIn ? "Register" : "Login to Register"}
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workshopData={workshopData}
                eventType={eventType}
            />
        </div>
    );
}
