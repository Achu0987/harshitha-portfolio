import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket, Sparkles } from 'lucide-react';
import './ProjectsPage.scss';

const FloatingParticle = ({ delay, duration, x, y, size, color }) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        filter: 'blur(2px)',
        boxShadow: `0 0 ${size * 2}px ${color}`
      }}
      initial={{ x: x, y: y, opacity: 0, scale: 0 }}
      animate={{
        y: [y, y - 150, y - 300],
        x: [x, x + Math.random() * 100 - 50, x + Math.random() * 100 - 50],
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    />
  );
};

const ProjectsPage = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 500,
      y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
      color: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="projects-page-wrapper">
      <div className="bg-grid"></div>
      <div className="glow-orb top-left"></div>
      <div className="glow-orb bottom-right"></div>
      <div className="glow-orb center-ambient"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map(p => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      <div className="nav-bar relative z-50">
        <Link to="/" className="back-link group">
          <ArrowLeft size={20} className="icon group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="projects-container min-h-screen flex items-center justify-center relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-4xl"
        >
          {/* Glass Card Container */}
          <div className="coming-soon-card relative p-12 md:p-20 rounded-[3rem] overflow-hidden">
            {/* Inner animated borders / glows */}
            <div className="absolute inset-0 border-[2px] border-white/5 rounded-[3rem]"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(168,85,247,0.3)_360deg)] opacity-50"
            ></motion.div>

            <div className="relative z-10 flex flex-col items-center">

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              >
                <Rocket className="text-purple-400 w-10 h-10 animate-bounce" />
              </motion.div>

              <div className="glitch-wrapper mb-6">
                <h1 className="glitch-text text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-200 to-gray-500 uppercase" data-text="COMING SOON">
                  COMING SOON
                </h1>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex items-center justify-center gap-3 mt-6"
              >
                <Sparkles className="text-pink-400 w-6 h-6" />
                <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
                  Brewing something <span className="font-semibold text-white">masterpiecs ...</span>
                </p>
                <Sparkles className="text-blue-400 w-6 h-6" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="mt-8 text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed"
              >
                I'm currently crafting my latest projects to showcase here.
                Great things take time. Check back soon to see the magic unfold.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-12"
              >
                <Link to="/" className="return-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <span className="relative z-10 tracking-widest text-sm">RETURN TO HOME</span>
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
