'use client';

import React from 'react';

export default function BrochureButton({ brochureUrl }) {
    const handleBrochureClick = () => {
        if (brochureUrl) {
            window.open(brochureUrl, "_blank");
        } else {
            alert("Brochure is not currently available for this event.");
        }
    };

    if (!brochureUrl) {
        return null;
    }

    return (
        <button
            onClick={handleBrochureClick}
            className="px-5 py-2 border border-gray-400 text-gray-800 rounded-lg hover:bg-gray-100 transition"
        >
            Display Brochure
        </button>
    );
}