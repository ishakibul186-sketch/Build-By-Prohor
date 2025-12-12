
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define the shape of the form data
export interface ProjectFormData {
  brandBusinessName: string;
  businessType: string;
  hasDomain: 'Yes' | 'No' | 'Want to buy';
  domainName?: string; // Optional if hasDomain is 'Yes'
  logoUpload: 'Yes' | 'No';
  preferredColorTheme: 'Light' | 'Dark' | 'Others';
  extraFunctionalities: string[]; // Array of selected checkboxes
}

interface ProjectRequestFormProps {
  onSubmit: (formData: ProjectFormData) => void;
}

const businessTypes = [
  'Ecommerce',
  'Service Business',
  'Personal Portfolio',
  'Blog',
  'Landing Page',
  'Company Website',
  'Agency',
  'Others',
];

const extraFunctionalitiesOptions = [
  'User Login System',
  'Admin Dashboard',
  'Blog System',
  'Review & rating',
  'Chat system',
  'Multi-language',
  'SEO optimization',
];

const ProjectRequestForm: React.FC<ProjectRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    brandBusinessName: '',
    businessType: businessTypes[0], // Default to first option
    hasDomain: 'No', // Default
    logoUpload: 'No', // Default
    preferredColorTheme: 'Light', // Default
    extraFunctionalities: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      setFormData((prev) => {
        const currentFunctionalities = prev.extraFunctionalities;
        if (checked) {
          return { ...prev, extraFunctionalities: [...currentFunctionalities, value] };
        } else {
          return { ...prev, extraFunctionalities: currentFunctionalities.filter((item) => item !== value) };
        }
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.brandBusinessName || !formData.businessType) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.hasDomain === 'Yes' && !formData.domainName) {
      setError('Please provide your domain name.');
      return;
    }

    setSubmitting(true);
    onSubmit(formData);
    // Assuming onSubmit handles navigation or closing logic
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto w-full bg-slate-700 p-6 sm:p-8 rounded-lg shadow-lg text-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Your Project Details</h2>
      <p className="text-slate-300 mb-6 text-center">
        Tell us about your website project to help us understand your needs better.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand / Business Name */}
        <div>
          <label htmlFor="brandBusinessName" className="block text-sm font-medium text-slate-300 mb-1">
            Brand / Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="brandBusinessName"
            name="brandBusinessName"
            value={formData.brandBusinessName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
            aria-required="true"
          />
        </div>

        {/* Business Type / Category */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-slate-300 mb-1">
            Business Type / Category <span className="text-red-500">*</span>
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-8"
            required
            aria-required="true"
          >
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Domain + Hosting */}
        <div>
          <p className="block text-sm font-medium text-slate-300 mb-2">Do you have a domain?</p>
          <div className="flex flex-wrap gap-4">
            {['Yes', 'No', 'Want to buy'].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  name="hasDomain"
                  value={option}
                  checked={formData.hasDomain === option}
                  onChange={handleChange}
                  className="form-radio text-primary h-4 w-4"
                />
                <span className="ml-2 text-slate-200">{option}</span>
              </label>
            ))}
          </div>
          {formData.hasDomain === 'Yes' && (
            <div className="mt-3">
              <label htmlFor="domainName" className="block text-xs font-medium text-slate-400 mb-1">
                Your domain name
              </label>
              <input
                type="text"
                id="domainName"
                name="domainName"
                value={formData.domainName || ''}
                onChange={handleChange}
                placeholder="e.g., example.com"
                className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                aria-required="true"
              />
            </div>
          )}
        </div>

        {/* Logo Upload */}
        <div>
          <p className="block text-sm font-medium text-slate-300 mb-2">Do you have a logo?</p>
          <div className="flex flex-wrap gap-4">
            {['Yes', 'No'].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  name="logoUpload"
                  value={option}
                  checked={formData.logoUpload === option}
                  onChange={handleChange}
                  className="form-radio text-primary h-4 w-4"
                />
                <span className="ml-2 text-slate-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Color Theme */}
        <div>
          <p className="block text-sm font-medium text-slate-300 mb-2">Preferred Color Theme</p>
          <div className="flex flex-wrap gap-4">
            {['Light', 'Dark', 'Others'].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  name="preferredColorTheme"
                  value={option}
                  checked={formData.preferredColorTheme === option}
                  onChange={handleChange}
                  className="form-radio text-primary h-4 w-4"
                />
                <span className="ml-2 text-slate-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Extra Functionalities */}
        <div>
          <p className="block text-sm font-medium text-slate-300 mb-2">Extra Functionalities (select all that apply)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {extraFunctionalitiesOptions.map((option) => (
              <label key={option} className="inline-flex items-center bg-slate-600 py-2 px-3 rounded-md cursor-pointer hover:bg-slate-500 transition-colors">
                <input
                  type="checkbox"
                  name="extraFunctionalities"
                  value={option}
                  checked={formData.extraFunctionalities.includes(option)}
                  onChange={handleChange}
                  className="form-checkbox text-primary h-4 w-4 rounded"
                />
                <span className="ml-2 text-slate-200 text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-center text-sm mt-4"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-300 shadow-md disabled:bg-gray-500 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            'Start Chat with Project Details'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProjectRequestForm;