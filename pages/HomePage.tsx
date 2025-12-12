
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  return (
    <AnimatedPage>
      <div className="relative h-screen">
        <div className="w-full h-full flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop"
              alt="Modern developer workspace"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 p-8 max-w-3xl">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Crafting Digital Experiences That Inspire
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              I build modern, responsive, and user-friendly web applications.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                to="/about"
                className="bg-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300 shadow-lg"
              >
                Learn More About My Services
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default HomePage;