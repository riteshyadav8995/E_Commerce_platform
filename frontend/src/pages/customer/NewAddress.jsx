import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const NewAddress = () => {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    country: 'India',
    fullName: user?.name || '',
    mobile: user?.phone || '',
    pincode: '',
    flatHouse: '',
    areaStreet: '',
    landmark: '',
    townCity: '',
    state: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAutofill = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    setAutofillLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using OpenStreetMap Nominatim
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          if (data && data.address) {
            setFormData(prev => ({
              ...prev,
              pincode: data.address.postcode || prev.pincode,
              townCity: data.address.city || data.address.town || data.address.village || data.address.county || prev.townCity,
              state: data.address.state || prev.state,
              areaStreet: data.address.suburb || data.address.neighbourhood || data.address.road || prev.areaStreet,
              country: data.address.country || prev.country
            }));
          }
        } catch (err) {
          setError('Failed to fetch location data automatically.');
        } finally {
          setAutofillLoading(false);
        }
      },
      (err) => {
        setError('Location permission denied or unavailable.');
        setAutofillLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Construct full address string
    const fullAddress = `${formData.fullName}
${formData.flatHouse}, ${formData.areaStreet}
${formData.landmark ? formData.landmark + '\n' : ''}${formData.townCity}, ${formData.state} ${formData.pincode}
${formData.country}
Phone: ${formData.mobile}`;

    try {
      const response = await api.put(`/users/${user.id}`, {
        address: fullAddress,
        phone: formData.mobile
      });
      
      // Update local store
      login({ ...user, address: fullAddress, phone: formData.mobile });
      
      // Navigate back to store
      navigate('/store');
    } catch (err) {
      setError('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* Breadcrumb */}
        <div className="text-sm mb-6">
          <Link to="/store" className="text-[#007185] hover:text-[#C7511F] hover:underline">Your Account</Link>
          <span className="mx-2 text-gray-500">›</span>
          <Link to="/store" className="text-[#007185] hover:text-[#C7511F] hover:underline">Your Addresses</Link>
          <span className="mx-2 text-gray-500">›</span>
          <span className="text-[#C7511F]">New Address</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a new address</h1>
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="text-[#F7CA00] w-5 h-5 fill-current stroke-white" />
          <button 
            type="button"
            onClick={handleAutofill}
            disabled={autofillLoading}
            className="text-[#007185] text-sm hover:text-[#C7511F] hover:underline cursor-pointer disabled:opacity-50 bg-transparent border-none p-0"
          >
            {autofillLoading ? 'Loading...' : 'Use my current location'}
          </button>
        </div>

        {/* Autofill Box */}
        <div className="bg-[#E7F4F5] border border-[#A4D5DB] rounded-lg p-4 flex justify-between items-center mb-8">
          <span className="font-bold text-gray-900">Save time. Autofill your current location.</span>
          <button 
            type="button"
            onClick={handleAutofill}
            disabled={autofillLoading}
            className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-800 px-5 py-1.5 rounded-full shadow-sm text-sm font-medium disabled:opacity-50"
          >
            {autofillLoading ? 'Loading...' : 'Autofill'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Country/Region</label>
            <select 
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm bg-gray-50"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Full name (First and Last name) *</label>
            <input 
              required
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Mobile number *</label>
            <input 
              required
              type="tel" 
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
            />
            <p className="text-xs text-gray-600 mt-1">May be used to assist delivery</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Pincode *</label>
            <input 
              required
              type="text" 
              name="pincode"
              placeholder="6 digits [0-9] PIN code"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Flat, House no., Building, Company, Apartment *</label>
            <input 
              required
              type="text" 
              name="flatHouse"
              value={formData.flatHouse}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Area, Street, Sector, Village *</label>
            <input 
              required
              type="text" 
              name="areaStreet"
              value={formData.areaStreet}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Landmark</label>
            <input 
              type="text" 
              name="landmark"
              placeholder="E.g. near apollo hospital"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">Town/City *</label>
              <input 
                required
                type="text" 
                name="townCity"
                value={formData.townCity}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">State *</label>
              <input 
                required
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:border-[#E77600] focus:ring-0 shadow-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#ffd814] hover:bg-[#F7CA00] border border-[#FCD200] text-black w-full sm:w-auto px-8 py-2 rounded-full shadow-[0_2px_5px_rgba(213,217,217,0.5)] text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Add address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAddress;
