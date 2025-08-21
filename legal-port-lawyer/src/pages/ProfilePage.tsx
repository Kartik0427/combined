
import React, { useState, useEffect } from "react";
import { ArrowLeft, Scale, Phone, Mail, Edit3, Save, X } from "lucide-react";
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { updateLawyerProfile } from '../services/lawyerStatusService';

const ProfilePage = ({ user, setCurrentPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [lawyerData, setLawyerData] = useState(null);
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    phoneNumber: user.phone || '',
    email: user.email || '',
    experience: user.experience || 0,
    bio: '',
    pricing: {
      audio: 30,
      video: 40,
      chat: 20
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
      const unsubscribe = onSnapshot(lawyerRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setLawyerData(data);
          setEditForm({
            name: data.name || user.name || '',
            phoneNumber: data.phoneNumber || user.phone || '',
            email: data.email || user.email || '',
            experience: data.experience || user.experience || 0,
            bio: data.bio || '',
            pricing: {
              audio: data.pricing?.audio || 30,
              video: data.pricing?.video || 40,
              chat: data.pricing?.chat || 20
            }
          });
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.uid) {
      alert('User not authenticated. Please log in again.');
      return;
    }
    
    // Basic validation
    if (!editForm.name.trim()) {
      alert('Name is required');
      return;
    }
    
    if (!editForm.email.trim()) {
      alert('Email is required');
      return;
    }
    
    setLoading(true);
    try {
      await updateLawyerProfile(user.uid, editForm);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <div className="ml-auto flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9A8C98] to-[#C9ADA7] text-white rounded-2xl font-medium hover:from-[#C9ADA7] hover:to-[#F2E9E4] hover:text-[#22223B] transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to current data
                    if (lawyerData) {
                      setEditForm({
                        name: lawyerData.name || user.name || '',
                        phoneNumber: lawyerData.phoneNumber || user.phone || '',
                        email: lawyerData.email || user.email || '',
                        experience: lawyerData.experience || user.experience || 0,
                        bio: lawyerData.bio || '',
                        pricing: {
                          audio: lawyerData.pricing?.audio || 30,
                          video: lawyerData.pricing?.video || 40,
                          chat: lawyerData.pricing?.chat || 20
                        }
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center">
              <Scale className="w-10 h-10 text-[#22223B]" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl font-bold text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#C9ADA7]"
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    value={editForm.experience}
                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                    className="text-white/80 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-[#C9ADA7]"
                    placeholder="Years"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-white">{editForm.name}</h2>
                  <p className="text-white/80">{user.specialization}</p>
                  <p className="text-sm text-white/70">
                    {editForm.experience} Years Experience
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#F2E9E4]">
                {lawyerData?.rating || user.rating || 0}
              </div>
              <div className="text-sm text-white/70">Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#F2E9E4]">
                {lawyerData?.reviews || user.cases || 0}
              </div>
              <div className="text-sm text-white/70">Cases Handled</div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
              <Phone className="w-5 h-5 text-white/70" />
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="flex-1 text-white bg-transparent focus:outline-none"
                  placeholder="Phone number"
                />
              ) : (
                <span className="text-white">{editForm.phoneNumber}</span>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
              <Mail className="w-5 h-5 text-white/70" />
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="flex-1 text-white bg-transparent focus:outline-none"
                  placeholder="Email address"
                />
              ) : (
                <span className="text-white">{editForm.email}</span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4 mb-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <h3 className="text-white font-medium mb-3">Pricing (₹/min)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Audio</label>
                    <input
                      type="number"
                      value={editForm.pricing.audio}
                      onChange={(e) => handleInputChange('pricing.audio', parseInt(e.target.value) || 0)}
                      className="w-full text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9ADA7]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Video</label>
                    <input
                      type="number"
                      value={editForm.pricing.video}
                      onChange={(e) => handleInputChange('pricing.video', parseInt(e.target.value) || 0)}
                      className="w-full text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9ADA7]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Chat</label>
                    <input
                      type="number"
                      value={editForm.pricing.chat}
                      onChange={(e) => handleInputChange('pricing.chat', parseInt(e.target.value) || 0)}
                      className="w-full text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9ADA7]"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <h3 className="text-white font-medium mb-3">Bio</h3>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9ADA7] resize-none"
                  placeholder="Tell clients about yourself, your experience, and expertise..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
