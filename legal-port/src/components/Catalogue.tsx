import React, { useState, useMemo, useEffect } from 'react';
import { Star, Phone, MessageCircle, User, CheckCircle, Filter, X, ChevronDown, Search, MapPin, Mail, PhoneCall, GraduationCap } from 'lucide-react';
import { fetchLawyers, Lawyer } from '../services/lawyerService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';



interface Filters {
  maxAudioRate: number;
  maxVideoRate: number;
  maxChatRate: number;
  minRating: number;
  minExperience: number;
  onlineOnly: boolean;
  specializations: string[];
  sortBy: 'rating' | 'experience' | 'audioRate' | 'videoRate' | 'chatRate' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface DetailedLawyer extends Lawyer {
  email?: string;
  phoneNumber?: string;
  bio?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  specializationNames?: string[];
}

const LawyerCatalogue: React.FC = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<DetailedLawyer | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedLawyers = await fetchLawyers();
        setLawyers(fetchedLawyers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lawyers');
        console.error('Error loading lawyers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLawyers();
  }, []);

  const [filters, setFilters] = useState<Filters>({
    maxAudioRate: 40,
    maxVideoRate: 30,
    maxChatRate: 35,
    minRating: 0,
    minExperience: 0,
    onlineOnly: false,
    specializations: [],
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  const availableSpecializations = [
    'Matrimonial',
    'Commercial',
    'Consumer',
    'Child Laws',
    'Civil',
    'Corporate',
    'Labour Law',
    'Property Rights',
    'Cheque Bounce',
    'Documentation',
    'Criminal',
    'Challans'
  ];

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedLawyers = useMemo(() => {
    let filtered = lawyers.filter(lawyer => {
      const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lawyer.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialization = filters.specializations.length === 0 ||
                                   filters.specializations.some(filterSpec => 
                                     lawyer.specializations.some(lawyerSpec => 
                                       lawyerSpec.toLowerCase().includes(filterSpec.toLowerCase())
                                     )
                                   );
      
      return (
        matchesSearch &&
        matchesSpecialization &&
        lawyer.pricing.audio <= filters.maxAudioRate &&
        lawyer.pricing.video <= filters.maxVideoRate &&
        lawyer.pricing.chat <= filters.maxChatRate &&
        lawyer.rating >= filters.minRating &&
        lawyer.experience >= filters.minExperience &&
        (!filters.onlineOnly || lawyer.isOnline)
      );
    });

    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (filters.sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        case 'audioRate':
          aValue = a.pricing.audio;
          bValue = b.pricing.audio;
          break;
        case 'videoRate':
          aValue = a.pricing.video;
          bValue = b.pricing.video;
          break;
        case 'chatRate':
          aValue = a.pricing.chat;
          bValue = b.pricing.chat;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.rating;
          bValue = b.rating;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [lawyers, filters, searchTerm]);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatFirebaseDate = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchDetailedLawyerData = async (lawyerId: string): Promise<DetailedLawyer | null> => {
    try {
      const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
      const lawyerDoc = await getDoc(lawyerRef);
      
      if (!lawyerDoc.exists()) {
        throw new Error('Lawyer not found');
      }

      const data = lawyerDoc.data();
      const basicLawyer = lawyers.find(l => l.id === lawyerId);
      
      if (!basicLawyer) {
        throw new Error('Lawyer data not found in local state');
      }

      return {
        ...basicLawyer,
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        bio: data.bio || '',
        education: Array.isArray(data.education) && data.education.length > 0 
          ? data.education 
          : [{ degree: "", institution: "", year: "" }],
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        specializationNames: basicLawyer.specializations
      };
    } catch (error) {
      console.error('Error fetching detailed lawyer data:', error);
      return null;
    }
  };

  const openModal = async (lawyer: Lawyer) => {
    setModalLoading(true);
    setIsModalOpen(true);
    
    const detailedData = await fetchDetailedLawyerData(lawyer.id);
    if (detailedData) {
      setSelectedLawyer(detailedData);
    } else {
      setSelectedLawyer({
        ...lawyer,
        specializationNames: lawyer.specializations
      });
    }
    setModalLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLawyer(null);
  };

  const resetFilters = () => {
    setFilters({
      maxAudioRate: 40,
      maxVideoRate: 30,
      maxChatRate: 35,
      minRating: 0,
      minExperience: 0,
      onlineOnly: false,
      specializations: [],
      sortBy: 'rating',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  const toggleSpecialization = (specialization: string) => {
    setFilters(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const LawyerCard: React.FC<{ lawyer: Lawyer }> = ({ lawyer }) => {
    const [selectedCallType, setSelectedCallType] = useState<'audio' | 'video' | 'chat'>('video');

    return (
      <div 
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 group cursor-pointer"
        onClick={() => openModal(lawyer)}
      >
        <div className="bg-gradient-to-br from-dark-blue via-slate-800 to-dark-blue p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                lawyer.isOnline ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  lawyer.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                {lawyer.isOnline ? 'Available Now' : 'Offline'}
              </div>
              {lawyer.verified && (
                <div className="bg-gold/90 text-dark-blue px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Pro
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl mb-2 shadow-lg overflow-hidden">
                {lawyer.image ? (
                  <img 
                    src={lawyer.image} 
                    alt={lawyer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center text-dark-blue font-bold text-lg ${lawyer.image ? 'hidden' : ''}`}>
                  {lawyer.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1 text-center">{lawyer.name}</h3>
              <div className="flex flex-wrap justify-center gap-1">
                {lawyer.specializations.slice(0, 2).map((spec, index) => (
                  <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    {spec}
                  </span>
                ))}
                {lawyer.specializations.length > 2 && (
                  <span className="text-xs text-gray-300">+{lawyer.specializations.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center gap-2 bg-yellow-50 p-2 rounded-lg">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(lawyer.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-yellow-800">{lawyer.rating}</span>
            <span className="text-xs text-yellow-700">({lawyer.reviews.toLocaleString()} reviews)</span>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg inline-flex items-center gap-1 text-sm font-bold">
              <MapPin className="w-3 h-3" />
              {lawyer.experience} Years Experience
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['audio', 'video', 'chat'] as const).map((type) => {
              const isAvailable = lawyer.availability && lawyer.availability[type];
              return (
                <button
                  key={type}
                  onClick={() => isAvailable && setSelectedCallType(type)}
                  disabled={!isAvailable}
                  className={`p-2 rounded-lg text-center transition-all duration-200 border cursor-pointer ${
                    !isAvailable
                      ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-50'
                      : selectedCallType === type
                      ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-blue border-gold'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm">₹{lawyer.pricing[type]}</div>
                  <div className="text-xs uppercase opacity-75">{type}</div>
                  <div className="text-xs opacity-60">
                    {isAvailable ? 'per min' : 'unavailable'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              disabled={!lawyer.availability?.[selectedCallType]}
              onClick={(e) => {
                e.stopPropagation();
                // Handle call logic here
              }}
              className={`py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all duration-200 ${
                lawyer.availability?.[selectedCallType]
                  ? 'bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Phone className="w-3 h-3" />
              {lawyer.availability?.[selectedCallType] ? 'Call Now' : 'Unavailable'}
            </button>
            <button 
              disabled={!lawyer.availability?.chat}
              onClick={(e) => {
                e.stopPropagation();
                // Handle message logic here
              }}
              className={`border py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all duration-200 ${
                lawyer.availability?.chat
                  ? 'border-gray-300 hover:border-gold text-gray-700 hover:text-gold'
                  : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              {lawyer.availability?.chat ? 'Message' : 'Unavailable'}
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <User className="w-3 h-3" />
              <span>{lawyer.connections} Connections</span>
            </div>
            {lawyer.verified && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const FilterSidebar: React.FC = () => (
    <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark-blue flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl">
            <Filter className="w-5 h-5 text-gold" />
          </div>
          Filters
        </h2>
        <button
          onClick={() => setShowFilters(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Sort By</label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-300 font-medium"
            >
              <option value="rating">Rating</option>
              <option value="experience">Experience</option>
              <option value="audioRate">Audio Rate</option>
              <option value="videoRate">Video Rate</option>
              <option value="chatRate">Chat Rate</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Sort Order</label>
          <div className="flex gap-3">
            <button
              onClick={() => updateFilter('sortOrder', 'asc')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                filters.sortOrder === 'asc'
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-blue shadow-lg shadow-gold/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low to High
            </button>
            <button
              onClick={() => updateFilter('sortOrder', 'desc')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                filters.sortOrder === 'desc'
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-blue shadow-lg shadow-gold/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High to Low
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">Specializations</label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {availableSpecializations.map((specialization) => (
              <label
                key={specialization}
                className="flex items-center space-x-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.specializations.includes(specialization)}
                  onChange={() => toggleSpecialization(specialization)}
                  className="w-5 h-5 text-gold bg-gray-100 border-2 border-gray-300 rounded focus:ring-gold focus:ring-2 transition-all duration-300"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gold transition-colors">
                  {specialization}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Max Audio Rate: <span className="text-gold">₹{filters.maxAudioRate}/min</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="10"
                max="40"
                value={filters.maxAudioRate}
                onChange={(e) => updateFilter('maxAudioRate', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${((filters.maxAudioRate - 10) / (40 - 10)) * 100}%, #E5E7EB ${((filters.maxAudioRate - 10) / (40 - 10)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Max Video Rate: <span className="text-gold">₹{filters.maxVideoRate}/min</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="5"
                max="30"
                value={filters.maxVideoRate}
                onChange={(e) => updateFilter('maxVideoRate', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${((filters.maxVideoRate - 5) / (30 - 5)) * 100}%, #E5E7EB ${((filters.maxVideoRate - 5) / (30 - 5)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Max Chat Rate: <span className="text-gold">₹{filters.maxChatRate}/min</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="8"
                max="35"
                value={filters.maxChatRate}
                onChange={(e) => updateFilter('maxChatRate', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${((filters.maxChatRate - 8) / (35 - 8)) * 100}%, #E5E7EB ${((filters.maxChatRate - 8) / (35 - 8)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Minimum Rating: <span className="text-gold">{filters.minRating} stars</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${(filters.minRating / 5) * 100}%, #E5E7EB ${(filters.minRating / 5) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Minimum Experience: <span className="text-gold">{filters.minExperience} years</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="25"
                value={filters.minExperience}
                onChange={(e) => updateFilter('minExperience', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${(filters.minExperience / 25) * 100}%, #E5E7EB ${(filters.minExperience / 25) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center space-x-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.onlineOnly}
              onChange={(e) => updateFilter('onlineOnly', e.target.checked)}
              className="w-5 h-5 text-gold bg-gray-100 border-2 border-gray-300 rounded focus:ring-gold transition-all duration-300"
            />
            <span className="text-sm font-bold text-gray-700 group-hover:text-gold transition-colors">Show Online Only</span>
          </label>
        </div>

        <button
          onClick={resetFilters}
          className="w-full py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-300 hover:scale-105"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );

  const LawyerModal: React.FC = () => {
    if (!selectedLawyer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gradient-to-br from-dark-blue via-slate-800 to-dark-blue text-white p-6 rounded-t-2xl relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              {selectedLawyer.image ? (
                <img 
                  src={selectedLawyer.image} 
                  alt={selectedLawyer.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center text-dark-blue text-3xl font-bold">
                  {selectedLawyer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{selectedLawyer.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-3 h-3 rounded-full ${selectedLawyer.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <span className="text-gray-300">{selectedLawyer.isOnline ? 'Online' : 'Offline'}</span>
                  {selectedLawyer.verified && (
                    <span className="bg-gold px-2 py-1 rounded text-xs text-dark-blue font-bold">Verified Pro</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {modalLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 mx-auto border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">Loading detailed information...</p>
              </div>
            ) : (
              <>
                {/* Contact Information */}
                {(selectedLawyer.email || selectedLawyer.phoneNumber) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLawyer.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="text-gray-500" size={20} />
                          <span>{selectedLawyer.email}</span>
                        </div>
                      )}
                      {selectedLawyer.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="text-gray-500" size={20} />
                          <span>{selectedLawyer.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience & Rating */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedLawyer.experience}</div>
                      <div className="text-sm text-gray-600">Years Experience</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{selectedLawyer.rating}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedLawyer.reviews}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {selectedLawyer.education && selectedLawyer.education.length > 0 && selectedLawyer.education[0].degree && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="text-gray-500" size={20} />
                      Education
                    </h3>
                    {selectedLawyer.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2">
                        <div className="font-semibold text-gray-800">{edu.degree.toUpperCase()}</div>
                        <div className="text-gray-600">{edu.institution}</div>
                        <div className="text-sm text-gray-500">Graduated: {edu.year}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Specializations */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLawyer.specializationNames || selectedLawyer.specializations || ["General Practice"]).map((spec, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                {selectedLawyer.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedLawyer.bio}</p>
                  </div>
                )}

                {/* Pricing Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Consultation Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${selectedLawyer.availability.audio ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="text-center">
                        <div className="text-xl font-bold">₹{selectedLawyer.pricing.audio}/min</div>
                        <div className="text-sm text-gray-600">Audio Call</div>
                        <div className={`text-xs mt-1 ${selectedLawyer.availability.audio ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedLawyer.availability.audio ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedLawyer.availability.video ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="text-center">
                        <div className="text-xl font-bold">₹{selectedLawyer.pricing.video}/min</div>
                        <div className="text-sm text-gray-600">Video Call</div>
                        <div className={`text-xs mt-1 ${selectedLawyer.availability.video ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedLawyer.availability.video ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedLawyer.availability.chat ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="text-center">
                        <div className="text-xl font-bold">₹{selectedLawyer.pricing.chat}/min</div>
                        <div className="text-sm text-gray-600">Chat</div>
                        <div className={`text-xs mt-1 ${selectedLawyer.availability.chat ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedLawyer.availability.chat ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Activity</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedLawyer.createdAt && (
                      <div>Member since: {formatFirebaseDate(selectedLawyer.createdAt)}</div>
                    )}
                    <div>Last active: {formatFirebaseDate(selectedLawyer.lastActive)}</div>
                    {selectedLawyer.updatedAt && (
                      <div>Profile updated: {formatFirebaseDate(selectedLawyer.updatedAt)}</div>
                    )}
                    <div>Total connections: {selectedLawyer.connections}</div>
                    <div>Lawyer ID: {selectedLawyer.id}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button className="flex-1 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300">
                    <PhoneCall size={18} />
                    Call Now
                  </button>
                  <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    <MessageCircle size={18} />
                    Send Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue via-slate-900 to-dark-blue">
      <div className="max-w-8xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Find Your Perfect <span className="text-gold">Legal Expert</span>
          </h1>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with verified lawyers instantly via chat, call, or video consultation
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-300 text-lg"
              />
            </div>
          </div>
          
          
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Filters Sidebar */}
          <div className="xl:col-span-1">
            <button
              onClick={() => setShowFilters(true)}
              className="xl:hidden w-full mb-6 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-xl hover:scale-105"
            >
              <Filter className="w-5 h-5" />
              Show Filters & Sort
            </button>
            <FilterSidebar />
          </div>

          {/* Lawyers Grid */}
          <div className="xl:col-span-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-gray-400 mb-6">
                    <div className="w-20 h-20 mx-auto opacity-50 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Loading lawyers...</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Please wait while we fetch the latest lawyer profiles
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-red-400 mb-6">
                    <X className="w-20 h-20 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Error loading lawyers</h3>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 px-8 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-xl hover:scale-105"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredAndSortedLawyers.map(lawyer => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer} />
                ))}
              </div>
            )}

            {/* No Results State */}
            {filteredAndSortedLawyers.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-gray-400 mb-6">
                    <Filter className="w-20 h-20 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No lawyers found</h3>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Try adjusting your search terms or filters to discover more legal experts
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 px-8 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-xl hover:scale-105"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EB9601, #F59E0B);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(235, 150, 1, 0.4);
          border: 3px solid white;
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(235, 150, 1, 0.6);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EB9601, #F59E0B);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(235, 150, 1, 0.4);
          transition: all 0.3s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(235, 150, 1, 0.6);
        }

        .slider::-webkit-slider-track {
          background: transparent;
          height: 12px;
          border-radius: 6px;
        }

        .slider::-moz-range-track {
          background: transparent;
          height: 12px;
          border-radius: 6px;
          border: none;
        }

        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          border-radius: 6px;
          outline: none;
          opacity: 0.9;
          transition: opacity 0.3s;
        }

        .slider:hover {
          opacity: 1;
        }

        .slider:active .slider::-webkit-slider-thumb {
          transform: scale(1.3);
          box-shadow: 0 8px 24px rgba(235, 150, 1, 0.8);
        }
        `
      }} />
      
      {/* Lawyer Detail Modal */}
      {isModalOpen && <LawyerModal />}
    </div>
  );
};

export default LawyerCatalogue;