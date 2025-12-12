
import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import { db, ref, onValue, update } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';

// Define the shape of the user data object
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  bio: string;
  number: string;
  dateOfBirth: string;
  address: string;
  country: string;
  picBase64: string;
  status: 'active' | boolean; // Can be 'active' or boolean false for banned
  createdAt: string;
  deviceInfo?: {
    os: string;
    browser: string;
    userAgent: string;
  };
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // State for the search filter
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const usersRef = ref(db, 'Users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList: UserProfile[] = Object.keys(data).map(uid => ({
          uid,
          ...data[uid],
        }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return users.filter(user => {
        // BUG FIX: Provide fallback empty strings for potentially undefined properties to prevent .includes error
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const number = (user.number || '').toString(); // Ensure number is a string
        const country = (user.country || '').toLowerCase();
        const status = (user.status === 'active' || user.status === true) ? 'active' : 'banned';

        switch (filterBy) {
            case 'name':
                return name.includes(lowercasedSearchTerm);
            case 'email':
                return email.includes(lowercasedSearchTerm);
            case 'number':
                return number.includes(lowercasedSearchTerm);
            case 'country':
                return country.includes(lowercasedSearchTerm);
            case 'status':
                return status.includes(lowercasedSearchTerm);
            case 'all':
            default:
                return (
                    name.includes(lowercasedSearchTerm) ||
                    email.includes(lowercasedSearchTerm) ||
                    number.includes(lowercasedSearchTerm) ||
                    country.includes(lowercasedSearchTerm)
                );
        }
    });
  }, [users, searchTerm, filterBy]);


  const handleOpenModal = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const userRef = ref(db, `Users/${selectedUser.uid}`);
      const updates = { ...formData };
      delete updates.uid; // Don't try to write the uid inside the user object

      // Handle boolean conversion for status
      if (typeof updates.status === 'string') {
        updates.status = (updates.status as string) === 'true' || updates.status === 'active';
      }

      await update(userRef, updates);
      alert('User updated successfully!');
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update user:", error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <AnimatedPage>
      <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">User Management</h1>
          
          {/* Advanced Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-2/3 lg:w-1/2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full sm:w-1/3 lg:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Search All</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="number">Phone</option>
              <option value="country">Country</option>
              <option value="status">Status (active/banned)</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUsers.map(user => (
                      <tr key={user.uid} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={user.picBase64 || 'https://via.placeholder.com/150'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-100">{user.name}</div>
                              <div className="text-sm text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' || user.status === true ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {user.status === 'active' || user.status === true ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleOpenModal(user)} className="text-primary hover:text-primary-dark">View / Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail and Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSaveChanges}>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-primary mb-4">Edit User: {selectedUser.name}</h2>
                    <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-white">&times;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Editable fields */}
                    <div>
                      <label className="text-xs text-slate-400">Name</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Email</label>
                      <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Phone</label>
                      <input type="tel" name="number" value={formData.number || ''} onChange={handleInputChange} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Country</label>
                      <input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                     <div>
                      <label className="text-xs text-slate-400">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Status</label>
                      <select name="status" value={String(formData.status === 'active' || formData.status === true)} onChange={handleInputChange} className="w-full bg-slate-700 p-2 rounded mt-1">
                        <option value="true">Active</option>
                        <option value="false">Banned</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-400">Bio</label>
                      <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} rows={3} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-400">Address</label>
                      <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows={2} className="w-full bg-slate-700 p-2 rounded mt-1"/>
                    </div>
                    {/* Read-only info */}
                    <div className="md:col-span-2 bg-slate-700/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">System Information (Read-only)</h3>
                      <p className="text-sm"><strong className="text-slate-400">User ID:</strong> {selectedUser.uid}</p>
                      <p className="text-sm"><strong className="text-slate-400">Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                      <p className="text-sm"><strong className="text-slate-400">OS:</strong> {selectedUser.deviceInfo?.os || 'N/A'}</p>
                      <p className="text-sm"><strong className="text-slate-400">Browser:</strong> {selectedUser.deviceInfo?.browser || 'N/A'}</p>
                      <p className="text-sm"><strong className="text-slate-400">Location:</strong> {selectedUser.geolocation ? `${selectedUser.geolocation.latitude}, ${selectedUser.geolocation.longitude}` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 flex justify-end gap-4">
                  <button type="button" onClick={handleCloseModal} className="py-2 px-4 rounded-md text-slate-200 hover:bg-slate-600">Cancel</button>
                  <button type="submit" disabled={isSaving} className="py-2 px-6 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default UserManagementPage;
