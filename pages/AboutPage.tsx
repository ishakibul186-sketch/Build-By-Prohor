import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import ProjectModal from '../components/ProjectModal';
import NotificationBanner from '../components/NotificationBanner';
import { useAuth } from '../hooks/useAuth';
// FIX: Import Variants type from framer-motion to correctly type animation variants.
import { motion, Variants, AnimatePresence } from 'framer-motion';

interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface Project {
  image: string;
  title: string;
  description: string;
  longDescription: string;
  screenshots: string[];
  liveLink?: string;
  repoLink?: string;
}


interface SocialLink {
    icon: string;
    text: string;
    href: string;
    label: string;
}

const services: Service[] = [
  { icon: 'fas fa-code', title: 'Frontend Development', description: 'Building beautiful and responsive user interfaces with modern frameworks like React.' },
  { icon: 'fas fa-server', title: 'Backend Development', description: 'Creating robust and scalable server-side applications and APIs.' },
  { icon: 'fas fa-palette', title: 'UI/UX Design', description: 'Designing intuitive and engaging user experiences from wireframes to final mockups.' },
  { icon: 'fas fa-cogs', title: 'Full-Stack Solutions', description: 'Handling both client and server side to deliver complete web applications.' },
];

const projects: Project[] = [
    { 
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop', 
        title: 'Government School Portal', 
        description: 'A comprehensive management system for a local government school to manage students, faculty, and records.',
        longDescription: 'This project was developed to modernize the administrative processes of a local government school. It features role-based access for students, teachers, and administrators. Key features include an online attendance system, grade management, a notice board, and a parent communication portal. The system significantly reduced paperwork and improved data accuracy.',
        screenshots: ['https://images.unsplash.com/photo-1634733358822-a511393c3b4a?w=800&auto=format&fit=crop', 'https://plus.unsplash.com/premium_photo-1685283594242-780b2a884482?w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1601933973783-43cf14a1c546?w=800&auto=format&fit=crop'],
        repoLink: 'https://github.com'
    },
    { 
        image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=400&auto=format&fit=crop', 
        title: 'E-commerce Platform', 
        description: 'A feature-rich online store for a local business, enabling them to sell products nationwide.',
        longDescription: 'Built from the ground up, this e-commerce platform provides a seamless shopping experience. It includes product catalog management, a secure payment gateway integration (Stripe), user account management with order history, and a responsive design that works flawlessly on desktops and mobile devices. The admin dashboard provides insights into sales and inventory.',
        screenshots: ['https://images.unsplash.com/photo-1585250472445-53883a9161a8?w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551523419-8e27c768c2a8?w=800&auto=format&fit=crop'],
        liveLink: 'https://google.com'
    },
    { 
        image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=400&auto=format&fit=crop', 
        title: 'Personal Portfolio Network', 
        description: 'A platform for creators to build and showcase their personal portfolios and connect with peers.',
        longDescription: 'This is a social platform for creative professionals to showcase their work. Users can create customizable portfolio pages, upload projects, and follow other creators. It features a discovery feed to find inspiring work and a messaging system for networking and collaboration. The goal was to create a community-focused space for artists and developers.',
        screenshots: ['https://images.unsplash.com/photo-1621361251918-4770f3f65f02?w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586953208448-b95a898d9237?w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop'],
        liveLink: 'https://google.com',
        repoLink: 'https://github.com'
    },
];

const socialLinks: SocialLink[] = [
    { icon: 'fab fa-whatsapp', text: '01852975203', href: 'https://wa.me/8801852975203', label: 'Contact me on WhatsApp' },
    { icon: 'fab fa-facebook', text: '', href: 'https://www.facebook.com/prohor245', label: 'Visit my Facebook profile' },
];


// FIX: Explicitly type containerVariants with Variants to prevent type inference issues.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// FIX: Explicitly type itemVariants with Variants. This resolves the error where 'spring' was inferred as `string` instead of the literal type `'spring'`, which is required by framer-motion's `Transition` type.
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
        type: 'spring',
        stiffness: 100
    }
  }
};


const AboutPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { user, loading } = useAuth();
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    // Show banner only if not loading, user is not logged in, and it hasn't been dismissed
    if (!loading && !user) {
      const isDismissed = sessionStorage.getItem('notificationDismissed');
      if (!isDismissed) {
        setIsBannerVisible(true);
      }
    } else {
        // Hide banner if user is logged in
        setIsBannerVisible(false);
    }
  }, [user, loading]);

  const handleBannerClose = () => {
    sessionStorage.setItem('notificationDismissed', 'true');
    setIsBannerVisible(false);
  };

  return (
    <AnimatedPage>
      <AnimatePresence>
        {isBannerVisible && (
            <NotificationBanner onClose={handleBannerClose} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-dark-text">
        
        {/* Profile Card */}
        <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden md:flex mb-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
          <div className="md:w-1/3">
            <img className="h-48 w-full object-cover md:h-full" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop" alt="Shakibul Islam Prohor" />
          </div>
          <div className="p-8 md:w-2/3">
            <div className="uppercase tracking-wide text-sm text-primary font-semibold">Web Developer</div>
            <h1 className="block mt-1 text-3xl leading-tight font-extrabold text-dark-text">Shakibul Islam Prohor</h1>
            <p className="mt-4 text-light-text">
              Passionate web developer with a knack for creating dynamic and user-friendly web applications. With a strong foundation in modern web technologies, I specialize in bringing ideas to life, from concept to deployment. I am dedicated to writing clean, efficient, and maintainable code to build high-quality software.
            </p>
          </div>
        </motion.div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">My Services</h2>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl hover:-translate-y-2 transition-transform duration-300"
                variants={itemVariants}
                >
                <i className={`${service.icon} text-primary text-4xl mb-4`}></i>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-light-text">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Projects Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Projects</h2>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileInView="visible"
            viewport={{ once: true }}
           >
            {projects.map((project, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer"
                variants={itemVariants}
                onClick={() => setSelectedProject(project)}
                >
                <div className="overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-light-text">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Contact Section */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Get In Touch</h2>
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className={`flex items-center bg-white py-3 rounded-full shadow-md hover:bg-primary/10 hover:shadow-lg transition-all duration-300 group ${link.text ? 'gap-3 px-6' : 'px-3'}`}
                variants={itemVariants}
              >
                <i className={`${link.icon} text-primary text-2xl group-hover:scale-110 transition-transform`}></i>
                {link.text && <span className="font-semibold text-dark-text">{link.text}</span>}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {selectedProject && (
            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default AboutPage;