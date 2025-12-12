
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  const adminSections = [
    {
      title: 'User Management',
      description: 'View, edit, and manage all user accounts.',
      link: '/admin/user-management',
      icon: 'fas fa-users-cog',
    },
    {
      title: 'Order Management',
      description: 'Track and manage all project orders and inquiries.',
      link: '/admin/order-management',
      icon: 'fas fa-file-invoice-dollar',
    },
    {
      title: 'Support Center',
      description: 'Review and respond to user support tickets.',
      link: '/admin/support-center',
      icon: 'fas fa-headset',
    },
  ];

  return (
    <AnimatedPage>
      <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold text-primary">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2">Welcome, Administrator. Select an option to manage the platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link
                  to={section.link}
                  className="block bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                    <i className={`${section.icon} text-3xl text-primary`}></i>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 text-center mb-3">{section.title}</h2>
                  <p className="text-slate-400 text-center">{section.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminDashboardPage;
