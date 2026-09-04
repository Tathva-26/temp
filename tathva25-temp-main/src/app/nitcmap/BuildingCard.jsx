'use client';
import React from 'react';

export default function BuildingCard({ buildingName, visible, onAction }) {
  return (
    <div
      className={`
        absolute bottom-10 left-1/2 -translate-x-1/2 
        w-64 rounded-2xl overflow-hidden
        bg-black/95 backdrop-blur-3xl
        border border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        transition-all duration-300 ease-out
        hover:bg-black/[0.98] hover:border-white/20
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-300" />
      
      <div className="relative p-5 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-white text-center truncate">
          {buildingName}
        </h3>
        
        <button
          onClick={onAction}
          className="
            w-full py-2.5 px-4 rounded-xl
            bg-blue-500/20 border border-blue-500/30
            text-sm font-medium text-blue-300
            transition-all duration-200
            hover:bg-blue-500/30 hover:border-blue-500/50 hover:text-blue-200
          "
        >
          What's Happening
        </button>
      </div>
    </div>
  );
}