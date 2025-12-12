
import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import { db, ref, onValue, update } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for a single ticket from Firebase
interface Ticket {
  ticketId: string;
  topic: string;
  formData: Record<string, string>;
  status: 'open' | 'closed';
  createdAt: number;
  userId: string;
  userEmail: string;
}

const SupportCenterPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tickets in real-time
  useEffect(() => {
    setLoading(true);
    const ticketsRef = ref(db, 'Kinbo_SupportCenter/tickets');
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ticketList: Ticket[] = Object.keys(data)
          .map(ticketId => ({
            ticketId,
            ...data[ticketId],
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
        setTickets(ticketList);
      } else {
        setTickets([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching support tickets:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Memoized filtering and searching
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Status filter
      if (filterStatus !== 'all' && ticket.status !== filterStatus) {
        return false;
      }
      // Search term filter
      if (searchTerm.trim() === '') {
        return true;
      }
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      return (
        ticket.topic.toLowerCase().includes(lowercasedSearchTerm) ||
        ticket.userEmail.toLowerCase().includes(lowercasedSearchTerm) ||
        ticket.ticketId.toLowerCase().includes(lowercasedSearchTerm)
      );
    });
  }, [tickets, searchTerm, filterStatus]);

  const handleOpenModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleStatusChange = async (newStatus: 'open' | 'closed') => {
    if (!selectedTicket) return;
    setIsSaving(true);
    try {
      const ticketRef = ref(db, `Kinbo_SupportCenter/tickets/${selectedTicket.ticketId}`);
      await update(ticketRef, { status: newStatus });
      // Update local state for immediate feedback in the modal
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      alert('Failed to update status.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AnimatedPage>
      <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">Support Center</h1>
          
          {/* Filter and Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by topic, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:flex-grow px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'open' | 'closed')}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => (
                  <motion.div
                    key={ticket.ticketId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => handleOpenModal(ticket)}
                    className="bg-slate-800 p-4 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-grow">
                        <h3 className="font-bold text-slate-100">{ticket.topic}</h3>
                        <p className="text-sm text-slate-400">{ticket.userEmail}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <span className="text-xs text-slate-500">{formatDate(ticket.createdAt)}</span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === 'open' ? 'bg-green-500/20 text-green-300' : 'bg-slate-600 text-slate-300'
                        }`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <i className="fas fa-ticket-alt text-5xl mb-4"></i>
                  <p>No tickets match your current filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-primary">{selectedTicket.topic}</h2>
                    <p className="text-sm text-slate-400">From: {selectedTicket.userEmail}</p>
                  </div>
                  <button type="button" onClick={handleCloseModal} className="text-slate-400 text-2xl hover:text-white">&times;</button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-grow space-y-4">
                <h3 className="font-semibold text-slate-200 border-b border-slate-700 pb-2">Submitted Details</h3>
                {Object.entries(selectedTicket.formData).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-medium text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-700/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div>
                    <p className="text-xs text-slate-400">Ticket Status</p>
                    <p className={`font-bold ${selectedTicket.status === 'open' ? 'text-green-400' : 'text-slate-300'}`}>
                        {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                    </p>
                 </div>
                 <div className="flex gap-2">
                    {selectedTicket.status === 'open' ? (
                       <button onClick={() => handleStatusChange('closed')} disabled={isSaving} className="py-2 px-4 rounded-md bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50 text-sm">
                         Mark as Closed
                       </button>
                    ) : (
                       <button onClick={() => handleStatusChange('open')} disabled={isSaving} className="py-2 px-4 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-50 text-sm">
                         Re-open Ticket
                       </button>
                    )}
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default SupportCenterPage;
