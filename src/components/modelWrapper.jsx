"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "./model";


export default function ModalWrapper({ workshopData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    // Check login status on mount
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        setIsLoggedIn(!!token);
    }, []);

    const handleClick = () => {
        if (!isLoggedIn) {
            router.push("/");
            return;
        }
        setIsModalOpen(true);
    };

    return (
        // FIX: Removed 'my-4' margin from the ModalWrapper's main div
        <div className="flex">
            <button
                onClick={handleClick}
                className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
                {isLoggedIn ? "Register" : "Login to Register"}
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workshopData={workshopData}
            />
        </div>
    );
}
