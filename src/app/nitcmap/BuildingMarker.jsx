'use client';
import React from 'react';

export default function BuildingMarker({ isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-transform duration-300 ${
        isActive ? 'scale-125' : 'hover:scale-110'
      }`}
    >
      {/* Solid Pin */}
      <div
        className={`
          w-6 h-6 bg-black
          rotate-[-45deg] rounded-[50%_50%_50%_0] 
          transition-all duration-300
        `}
      >
        {/* Inner Dot */}
        <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

 
    </div>
  );
}
