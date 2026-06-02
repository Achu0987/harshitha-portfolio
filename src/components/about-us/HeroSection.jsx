'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <main className="bg-black text-white h-screen w-full flex flex-col justify-center items-center relative overflow-hidden font-outfit">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,20,1)_0%,_rgba(0,0,0,1)_100%)] -z-10"></div>
      <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(255,95,0,0.03)_0%,_transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 px-[60px] py-[40px] flex justify-between items-center z-10">
        <div className="text-[14px] font-medium tracking-[2px] text-white/70 uppercase">MAIN</div>
        <button className="px-[24px] py-[8px] border border-[#ff8c00]/40 rounded-[12px] bg-[#ff8c00]/5 text-[#ff8c00] text-[14px] cursor-pointer transition-all duration-300 backdrop-blur-[5px] hover:bg-[#ff8c00]/15 hover:border-[#ff8c00]/80 hover:shadow-[0_0_20px_rgba(255,140,0,0.2)]">
          Manifesto
        </button>
      </nav>

      {/* Sidebar Indicator */}
      <div className="absolute left-[60px] top-[100px] bottom-[100px] w-[1px] bg-white/10 flex flex-col justify-between items-center">
        <div className="w-[8px] h-[8px] bg-[#ff5f00] rounded-full absolute top-0 left-[-3.5px] shadow-[0_0_10px_#ff5f00] animate-pulse"></div>
        <div className="w-[6px] h-[1px] bg-white/20 my-[20px]"></div>
        <div className="w-[6px] h-[1px] bg-white/20 my-[20px]"></div>
        <div className="w-[6px] h-[1px] bg-white/20 my-[20px]"></div>
        <div className="w-[6px] h-[1px] bg-white/20 my-[20px]"></div>
        <div className="w-[6px] h-[1px] bg-white/20 my-[20px]"></div>
        <div className="w-[6px] h-[1px] bg-white/20 my-[20px]"></div>
      </div>

      {/* Hero Content */}
      <section className="text-center max-w-[800px] px-[20px] animate-fade-in">
        <h1 className="text-[64px] font-normal leading-[1.1] tracking-[-1px] text-white m-0">
          <span className="block">From Artificial Intelligence</span>
          <span className="block">to Personal Intelligence.</span>
        </h1>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-[40px] text-center">
        <div className="text-[14px] font-light text-white/50 tracking-[1px] animate-bounce">Scroll to Explore</div>
      </footer>
    </main>
  );
}
