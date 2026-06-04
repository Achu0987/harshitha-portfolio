import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Code2 } from 'lucide-react';
import './ProjectsPage.scss';

const ProjectsPage = () => {
  return (
    <div className="projects-page-wrapper min-h-screen bg-[#E8ECEF] relative overflow-hidden font-['Inter'] flex flex-col items-center justify-center">
      <div className="bg-grid"></div>

      {/* Top Left Navigation */}
      <div className="absolute top-0 left-0 w-full p-8 md:p-12 z-50">
        <Link to="/" className="inline-flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-all uppercase tracking-[0.2em] text-xs font-bold group">
          <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-4xl px-6 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center w-full"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white backdrop-blur-md shadow-sm mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Work in Progress</span>
          </motion.div>

          {/* Floating Icon Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            className="relative mb-10"
          >
            <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-10 rounded-full"></div>
            <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-white/50 relative z-10">
              <Code2 className="text-gray-800 w-10 h-10" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Sleek Headline Reveal */}
          <div className="overflow-hidden mb-6">
            <motion.h1 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 pb-2"
            >
              COMING <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">SOON</span>
            </motion.h1>
          </div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <p className="text-xl md:text-2xl text-gray-500 font-light tracking-wide">
              Brewing something <span className="font-semibold text-gray-900">masterpieces ...</span>
            </p>
          </motion.div>

          {/* Refined Description Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-gray-500 max-w-md mx-auto text-base leading-relaxed mb-12"
          >
            I'm currently crafting my latest projects with attention to every pixel. 
            Great things take time. Check back soon to see the magic unfold.
          </motion.p>

          {/* Premium Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Link 
              to="/" 
              className="group relative inline-flex items-center gap-4 px-8 py-4 bg-gray-900 text-white rounded-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(17,24,39,0.4)] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 tracking-[0.2em] text-xs font-bold uppercase">Return to Home</span>
              <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
