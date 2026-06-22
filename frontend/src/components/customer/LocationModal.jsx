import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LocationModal = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (pincode && pincode.length >= 6) {
      setLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        let newAddress = '';
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          newAddress = `${postOffice.District}, ${postOffice.State} ${pincode}`;
        } else {
          newAddress = `Pincode ${pincode}`;
        }

        // Use dynamic import or pass login function
        const { default: useAuthStore } = await import('../../store/authStore');
        const { default: api } = await import('../../services/api');
        
        const login = useAuthStore.getState().login;
        
        if (user) {
          await api.put(`/users/${user.id}`, { address: newAddress });
          login({ ...user, address: newAddress });
        }
        
        onClose();
      } catch (err) {
        console.error('Failed to apply pincode:', err);
        // Fallback
        const { default: useAuthStore } = await import('../../store/authStore');
        const login = useAuthStore.getState().login;
        if (user) login({ ...user, address: `Pincode ${pincode}` });
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-[400px] sm:w-full">
          <div className="bg-gray-100 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900" id="modal-title">
              Choose your location
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <p className="text-xs text-gray-600 mb-4">
              Select a delivery location to see product availability and delivery options
            </p>

            {user?.address && (
              <div className="mb-4 border-2 border-[#007185] rounded-md p-3 bg-blue-50/50 cursor-pointer shadow-sm">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {user.name}
                </p>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap leading-snug">
                  {user.address}
                </p>
                <p className="text-xs font-bold text-gray-600 mt-2">
                  Default address
                </p>
              </div>
            )}

            <button 
              onClick={() => {
                onClose();
                navigate('/address/new');
              }}
              className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium mb-4 block"
            >
              Add an address or pick-up point
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">or enter an Indian pincode</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="text" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 border border-gray-400 rounded px-3 py-1.5 text-sm focus:border-[#E77600] focus:ring-0 focus:outline-none shadow-sm"
                placeholder="Enter a pincode"
              />
              <button 
                onClick={handleApply}
                disabled={loading}
                className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-800 px-4 py-1.5 rounded-full shadow-sm text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>

            <button 
              onClick={() => {
                if (navigator.geolocation) {
                  setLoading(true);
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data && data.address && data.address.postcode) {
                          setPincode(data.address.postcode);
                        } else {
                          alert('Could not determine pincode from your location.');
                        }
                      } catch (err) {
                        console.error('Reverse geocoding failed', err);
                        alert('Failed to get location address.');
                      } finally {
                        setLoading(false);
                      }
                    },
                    (error) => {
                      setLoading(false);
                      alert('Geolocation error: ' + error.message);
                    }
                  );
                } else {
                  alert('Geolocation is not supported by your browser.');
                }
              }}
              disabled={loading}
              className="mt-3 text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline flex items-center gap-1 w-full text-left bg-transparent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Use my current location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
