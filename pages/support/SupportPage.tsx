
import React, { useState, FormEvent } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { db, ref, push, set, serverTimestamp } from '../../firebase';

// Interface for a single form field
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder: string;
  required: boolean;
}

// Interface for a support topic
interface SupportTopic {
  title: string;
  icon: string;
  description: string;
  fields: FormField[];
}

// Configuration for all support topics
const supportTopics: SupportTopic[] = [
  {
    title: "Account/Login Problem",
    icon: "fas fa-user-lock",
    description: "Can't log in, or experiencing other account-related issues.",
    fields: [
      { name: "email", label: "Your Account Email", type: "email", placeholder: "Enter the email associated with your account", required: true },
      { name: "subject", label: "Subject", type: "text", placeholder: "e.g., 'Unable to login'", required: true },
      { name: "description", label: "Detailed Description", type: "textarea", placeholder: "Please describe the issue in detail, including any error messages you see.", required: true },
    ],
  },
  {
    title: "Account Ban Appeal",
    icon: "fas fa-gavel",
    description: "If you believe your account was banned by mistake, submit an appeal.",
    fields: [
      { name: "emailOrId", label: "Your Account Email or User ID", type: "text", placeholder: "Enter the identifier for the banned account", required: true },
      { name: "appealReason", label: "Reason for Appeal", type: "textarea", placeholder: "Please explain why you believe the ban should be lifted. Be as detailed as possible.", required: true },
    ],
  },
  {
    title: "Security Issue",
    icon: "fas fa-shield-alt",
    description: "Report a security vulnerability or unauthorized account activity.",
    fields: [
       { name: "email", label: "Your Contact Email", type: "email", placeholder: "Enter an email we can reach you at", required: true },
       { name: "subject", label: "Security Concern", type: "text", placeholder: "e.g., 'Suspicious activity on my account'", required: true },
       { name: "details", label: "Detailed Report", type: "textarea", placeholder: "Provide all relevant details, including dates, times, and a description of the security issue.", required: true },
    ],
  },
  {
    title: "Others",
    icon: "fas fa-question-circle",
    description: "For any other questions or issues not listed above.",
    fields: [
      { name: "email", label: "Your Contact Email", type: "email", placeholder: "Enter your email address", required: true },
      { name: "subject", label: "Subject", type: "text", placeholder: "What is your question about?", required: true },
      { name: "question", label: "Your Question/Issue", type: "textarea", placeholder: "Please describe your inquiry in detail.", required: true },
    ],
  },
];


const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const toggleTopic = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
      setFormData({}); // Reset form when opening a new topic
      setSubmissionStatus('idle'); // Reset status
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent, topic: SupportTopic) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      const ticketsRef = ref(db, 'Kinbo_SupportCenter/tickets');
      const newTicketRef = push(ticketsRef);
      await set(newTicketRef, {
        topic: topic.title,
        formData,
        status: 'open',
        createdAt: serverTimestamp(),
        userId: user ? user.uid : 'guest',
        userEmail: user ? user.email : formData.email || 'N/A',
      });
      
      setSubmissionStatus('success');
      setFormData({});
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <AnimatedPage>
      <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Support & Services</h1>
            <p className="text-lg text-slate-400">
              Get help or services from Build By Prohor. See the options below.
            </p>
          </motion.section>

          {/* Accordion Section */}
          <div className="space-y-4">
            {supportTopics.map((topic, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleTopic(index)}
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none transition-colors hover:bg-slate-700/50"
                  aria-expanded={openIndex === index}
                >
                  <div className="flex items-center gap-4">
                    <i className={`${topic.icon} text-primary text-2xl w-8 text-center`}></i>
                    <div>
                        <span className="text-lg font-semibold text-slate-200">{topic.title}</span>
                        <p className="text-sm text-slate-400">{topic.description}</p>
                    </div>
                  </div>
                  <i className={`fas fa-chevron-down text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}></i>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 border-t border-slate-700">
                        {submissionStatus === 'success' ? (
                            <div className="text-center p-4 bg-green-500/10 border border-green-500 rounded-md">
                                <i className="fas fa-check-circle text-green-400 text-3xl mb-2"></i>
                                <h3 className="font-bold text-green-300">Ticket Submitted Successfully!</h3>
                                <p className="text-sm text-green-400">Our team will review your request and get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={(e) => handleSubmit(e, topic)} className="space-y-4">
                                {topic.fields.map(field => (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-medium text-slate-300 mb-1">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                id={field.name}
                                                name={field.name}
                                                value={formData[field.name] || ''}
                                                onChange={handleInputChange}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                rows={4}
                                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        ) : (
                                            <input
                                                id={field.name}
                                                name={field.name}
                                                type={field.type}
                                                value={formData[field.name] || ''}
                                                onChange={handleInputChange}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        )}
                                    </div>
                                ))}
                                {submissionStatus === 'error' && (
                                    <p className="text-red-500 text-sm text-center">Failed to submit ticket. Please try again.</p>
                                )}
                                <div className="text-right">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            'Submit Ticket'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default SupportPage;
