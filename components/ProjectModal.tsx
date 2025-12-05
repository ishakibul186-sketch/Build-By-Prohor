import React, { useState } from 'react';
// FIX: Import Variants from framer-motion to correctly type the modal variants.
import { motion, Variants } from 'framer-motion';
import { Project } from '../pages/AboutPage';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

// FIX: Explicitly type `modal` with `Variants` to enforce correct transition types. The `type` property in a transition must be a specific literal type (e.g., 'spring'), not a generic `string`.
const modal: Variants = {
  hidden: {
    y: "-100vh",
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: { delay: 0.2, type: "spring", stiffness: 120 },
  },
};

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeScreenshot, setActiveScreenshot] = useState(project.screenshots[0]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-light-bg rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        variants={modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-light-text hover:text-dark-text transition-colors text-2xl z-10"
            aria-label="Close project details"
          >
            <i className="fas fa-times-circle"></i>
          </button>
          <h2 className="text-3xl font-extrabold text-primary mb-4 pr-8">{project.title}</h2>
          
          {/* Screenshot Gallery */}
          <div className="mb-6">
            <div className="w-full aspect-video rounded-lg overflow-hidden mb-2 bg-gray-200">
                <img src={activeScreenshot} alt={`${project.title} screenshot`} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
                {project.screenshots.map((ss, index) => (
                    <div 
                        key={index} 
                        className={`w-20 h-12 rounded-md overflow-hidden cursor-pointer ring-2 transition-all ${activeScreenshot === ss ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'}`}
                        onClick={() => setActiveScreenshot(ss)}
                    >
                        <img src={ss} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
          </div>
          
          {/* Long Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-dark-text mb-2">About this project</h3>
            <p className="text-light-text whitespace-pre-wrap">{project.longDescription}</p>
          </div>
          
          {/* Links */}
          {(project.liveLink || project.repoLink) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {project.liveLink && (
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-transform transform hover:scale-105 duration-300"
                >
                  <i className="fas fa-external-link-alt"></i>
                  <span>Live Demo</span>
                </a>
              )}
              {project.repoLink && (
                <a
                  href={project.repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-dark-text text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-transform transform hover:scale-105 duration-300"
                >
                  <i className="fab fa-github"></i>
                  <span>View Code</span>
                </a>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectModal;