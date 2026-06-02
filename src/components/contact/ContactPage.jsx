import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ContactPage.scss';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="contact-page-wrapper">
      <div className="bg-grid"></div>
      <div className="glow-orb top-left"></div>
      <div className="glow-orb bottom-right"></div>

      <div className="nav-bar">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} className="icon" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="contact-container max-w-6xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="contact-header text-center mb-20"
        >
          <div className="inline-block relative">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-['Inter'] relative z-10">
              Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Touch</span>
            </h1>
          </div>
          <p className="subtitle text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Ready to build something extraordinary? I'm currently available for freelance projects and exciting full-time opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 flex flex-col justify-center"
          >
            <div className="space-y-8">
              <motion.div whileHover={{ scale: 1.05, x: 10 }} transition={{ type: 'spring', stiffness: 300 }} className="info-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="icon-wrapper relative z-10"><Mail size={24} className="text-blue-400 group-hover:text-white transition-colors" /></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-1">Email</h3>
                  <p className="text-white font-semibold text-lg tracking-wide group-hover:text-blue-300 transition-colors">harshithacse973@gmail.com</p>
                </div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, x: 10 }} transition={{ type: 'spring', stiffness: 300 }} className="info-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="icon-wrapper relative z-10"><Phone size={24} className="text-purple-400 group-hover:text-white transition-colors" /></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-1">Phone</h3>
                  <p className="text-white font-semibold text-lg tracking-wide group-hover:text-purple-300 transition-colors">+91 7010156378</p>
                </div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, x: 10 }} transition={{ type: 'spring', stiffness: 300 }} className="info-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="icon-wrapper relative z-10"><MapPin size={24} className="text-pink-400 group-hover:text-white transition-colors" /></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400 mb-1">Location</h3>
                  <p className="text-white font-semibold text-lg tracking-wide group-hover:text-pink-300 transition-colors">Salem</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className="text-gray-400 font-bold mb-6 text-xs tracking-[0.2em] uppercase">Connect on social</h3>
              <div className="flex gap-6">
                <motion.a whileHover={{ y: -5, scale: 1.1 }} whileTap={{ scale: 0.95 }} href="https://linkedin.com/" target="_blank" rel="noreferrer" className="social-icon group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-blue-400 transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </motion.a>
                <motion.a whileHover={{ y: -5, scale: 1.1 }} whileTap={{ scale: 0.95 }} href="https://www.instagram.com/achu_queen_123/" target="_blank" rel="noreferrer" className="social-icon group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-pink-500 transition-colors"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7"
          >
            <div className="glass-panel p-8 md:p-12 rounded-[2rem] relative overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="contact-form relative z-10">
                <div className="input-group">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="name">Your Name</label>
                  <div className="input-highlight"></div>
                </div>

                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="email">Email Address</label>
                  <div className="input-highlight"></div>
                </div>

                <div className="input-group">
                  <textarea
                    id="message"
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder=" "
                  ></textarea>
                  <label htmlFor="message">Project Details / Message</label>
                  <div className="input-highlight"></div>
                </div>

                <button type="submit" className={`submit-btn group ${isSubmitting ? 'submitting' : ''}`} disabled={isSubmitting}>
                  <span className="btn-text font-bold uppercase tracking-widest text-sm relative z-10">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  {!isSubmitting && <Send size={18} className="btn-icon group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300 relative z-10" />}
                  <div className="btn-glow"></div>
                </button>

                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="success-message text-emerald-400 mt-6 flex items-center gap-2 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Your message has been sent successfully! I'll get back to you soon.
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
