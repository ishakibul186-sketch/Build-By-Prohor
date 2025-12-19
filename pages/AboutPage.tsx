import React, { useState } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const whatsappNumber = '01852975203';
  const facebookProfile = 'https://www.facebook.com/prohor245';

  // State for FAQ accordion
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <AnimatedPage>
      <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">

          {/* 1. Profile Card Section (UI Design 1) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700"
          >
            {/* Content Section */}
            <div className="w-full p-8 md:p-12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h3 className="text-primary font-bold tracking-widest text-sm uppercase mb-2">Web Developer</h3>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Shakibul Islam Prohor</h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Passionate web developer with a knack for creating dynamic and user-friendly web applications. 
                  With a strong foundation in modern web technologies, I specialize in bringing ideas to life, from 
                  concept to deployment. I am dedicated to writing clean, efficient, and maintainable code to build 
                  high-quality software.
                </p>
                
                <div className="flex gap-4">
                    <a 
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg flex items-center gap-2"
                    >
                        <i className="fab fa-whatsapp"></i>
                        <span>Contact Me</span>
                    </a>
                    <a 
                        href={facebookProfile}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                    >
                        <i className="fab fa-facebook-f text-xl"></i>
                    </a>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* 2. My Services Section (UI Design 2) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">My Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { 
                    icon: 'fa-palette', 
                    title: 'UI/UX Design', 
                    desc: 'Designing intuitive and engaging user experiences from wireframes to final mockups.' 
                  },
                  { 
                    icon: 'fa-pen-ruler', 
                    title: 'Web Design', 
                    desc: 'Crafting visually stunning website layouts that prioritize user experience and brand identity.' 
                  },
                  { 
                    icon: 'fa-code', 
                    title: 'Frontend Development', 
                    desc: 'Building beautiful and responsive user interfaces with modern frameworks like React.' 
                  },
                  { 
                    icon: 'fa-server', 
                    title: 'Backend Development', 
                    desc: 'Creating robust and scalable server-side applications, databases, and APIs.' 
                  },
                  {
                    icon: 'fa-laptop-code',
                    title: 'Web Development',
                    desc: 'Expert development services covering all aspects of web creation, from simple sites to complex applications.'
                  },
                  { 
                    icon: 'fa-layer-group', 
                    title: 'Full-Stack Solutions', 
                    desc: 'Handling both client and server side to deliver complete, end-to-end web applications.' 
                  }
                ].map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
                        className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <i className={`fas ${service.icon} text-3xl text-primary`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                    </motion.div>
                ))}
            </div>
          </motion.section>

          {/* Projects Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Government School Portal',
                  description: 'A comprehensive management system for a local government school to manage students, faculty, and records.',
                  image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1770&auto=format&fit=crop'
                },
                {
                  title: 'E-commerce Platform',
                  description: 'A feature-rich online store for a local business, enabling them to sell products nationwide.',
                  image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1770&auto=format&fit=crop'
                },
                {
                  title: 'Personal Portfolio Network',
                  description: 'A platform for creators to build and showcase their personal portfolios and connect with peers.',
                  image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1770&auto=format&fit=crop'
                },
              ].map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.5 }}
                  className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed flex-grow">{project.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Website Types Section (Renamed to clear confusion with Services) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
             <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">Types of Projects I Build</h2>
             <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6">
                 {[
                    { title: 'Business Websites', icon: 'fas fa-building' },
                    { title: 'E-commerce Stores', icon: 'fas fa-shopping-cart' },
                    { title: 'Portfolio Sites', icon: 'fas fa-briefcase' },
                    { title: 'Landing Pages', icon: 'fas fa-bullhorn' },
                    { title: 'Web Applications', icon: 'fas fa-rocket' },
                    { title: 'Education Portals', icon: 'fas fa-graduation-cap' },
                 ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors cursor-default">
                         <i className={`${item.icon} text-secondary text-xl`}></i>
                         <span className="font-semibold text-lg">{item.title}</span>
                     </div>
                 ))}
             </div>
          </motion.section>

          {/* Pricing Plans */}
           <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">Flexible Pricing Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Basic', price: '$499', features: [
                    '1-3 Page Website', 'Responsive Design', 'Basic SEO', 'Contact Form'
                  ], highlight: false
                },
                {
                  name: 'Standard', price: '$999', features: [
                    'Up to 7 Pages', 'Custom Design', 'Advanced SEO', 'Blog Integration', 'Social Media Integration'
                  ], highlight: true
                },
                {
                  name: 'Premium', price: '$1999', features: [
                    'Up to 15 Pages', 'Unique Branding', 'E-commerce Ready', 'Admin Panel', 'Payment Gateway'
                  ], highlight: false
                },
                {
                  name: 'Custom', price: 'Quote', features: [
                    'Tailored Solution', 'Scalable Architecture', 'Advanced Features', 'Ongoing Consultation'
                  ], highlight: false
                },
              ].map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md flex flex-col items-center text-center transition-all duration-300 ${plan.highlight ? 'ring-2 ring-primary relative scale-105 z-10' : 'hover:shadow-lg'}`}
                >
                  {plan.highlight && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</div>}
                  <h3 className="text-2xl font-bold text-primary mb-4">{plan.name}</h3>
                  <p className="text-4xl font-extrabold text-slate-100 mb-4">{plan.price}</p>
                  <ul className="text-slate-300 space-y-3 mb-8 text-left w-full text-sm">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-auto w-full py-3 rounded-lg font-bold transition-colors ${plan.highlight ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}>
                    Choose Plan
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'How long will it take to build my website?',
                  a: 'Project timelines vary depending on complexity and features. A basic website might take 2-4 weeks, while a complex e-commerce platform could take 8-12 weeks or more.'
                },
                {
                  q: 'How does payment work?',
                  a: 'Typically, we require an upfront deposit (e.g., 30-50%) to start the project. The remaining balance is paid in installments upon reaching key milestones.'
                },
                {
                  q: 'Do you offer revisions?',
                  a: 'Yes, revisions are included in our development process. The number of revision rounds depends on the chosen package, ensuring you are satisfied with the final product.'
                },
                 {
                  q: 'Is maintenance included?',
                  a: 'Initial post-launch support and bug fixes are included for a limited period. Ongoing maintenance plans are available separately.'
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                  >
                    <span className="text-lg font-semibold text-slate-200">{faq.q}</span>
                    <i className={`fas ${openFAQIndex === index ? 'fa-minus' : 'fa-plus'} text-primary transition-transform duration-300 ${openFAQIndex === index ? 'rotate-180' : ''}`}></i>
                  </button>
                  <AnimatePresence>
                    {openFAQIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                         <div className="p-5 pt-0 text-slate-400 border-t border-slate-700/50">
                            {faq.a}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.section>

          {/* New Call to Action Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-slate-100 mb-8">Ready to Start Your Project?</h2>
            <div className="max-w-2xl mx-auto">
              <Link
                to="/build-chat"
                className="block bg-slate-700 hover:bg-slate-600/70 p-8 rounded-xl shadow-lg hover:shadow-primary/20 border border-slate-600 transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-shrink-0">
                    <i className="fas fa-rocket text-5xl text-primary"></i>
                  </div>
                  <div className="text-left flex-grow">
                    <h3 className="text-2xl font-bold text-white mb-2">Chat &amp; Build Your Project</h3>
                    <p className="text-slate-400">
                      Click here to start a new conversation, submit your project requirements, and let's bring your vision to life.
                    </p>
                  </div>
                  <div className="text-slate-500 group-hover:text-primary transition-colors">
                    <i className="fas fa-arrow-right text-3xl transform group-hover:translate-x-2 transition-transform"></i>
                  </div>
                </div>
              </Link>
            </div>
          </motion.section>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default AboutPage;