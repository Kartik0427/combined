
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, DollarSign, MessageSquare, Mail, Star, LogOut, Phone, Video, RefreshCw, Scale, TrendingUp, Calendar, BarChart3, Settings, Inbox } from 'lucide-react';

const Dashboard = ({ user, balance, setCurrentPage, handleLogout }) => {
  const [services, setServices] = useState({
    videoCall: false,
    audioCall: false,
    chat: false
  });
  const [incomingCall, setIncomingCall] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    specialization: user?.specialization || '',
    cases: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchLawyerProfile = async () => {
      try {
        const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
        const docSnap = await getDoc(lawyerRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Profile data:', data);
          
          setProfile({
            name: data.name || user.name || '',
            specialization: data.specialization || user.specialization || '',
            cases: data.cases || 0,
            rating: data.rating || 0
          });
          
          // Initialize services state from fetched data
          setServices({
            videoCall: data.availability?.video || false,
            audioCall: data.availability?.audio || false,
            chat: data.availability?.chat || false,
          });
        } else {
          // Create initial profile if doesn't exist
          const initialProfile = {
            name: user.name || '',
            specialization: user.specialization || '',
            email: user.email || '',
            availability: {
              video: false,
              audio: false,
              chat: false
            },
            isOnline: false,
            rating: 0,
            reviews: 0,
            connections: 0,
            verified: false,
            cases: 0,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
          };
          
          await setDoc(lawyerRef, initialProfile);
          setProfile({
            name: initialProfile.name,
            specialization: initialProfile.specialization,
            cases: 0,
            rating: 0
          });
        }
      } catch (error) {
        console.error("Error fetching lawyer profile:", error);
      }
    };

    fetchLawyerProfile();

    // Simulate incoming calls
    const interval = setInterval(() => {
      setIncomingCall(prev => !prev);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [user]);

  const toggleService = async (service) => {
    if (!user?.uid) return;
    
    const fieldMapping = {
      videoCall: 'video',
      audioCall: 'audio',
      chat: 'chat'
    };
    
    const newValue = !services[service];
    setLoading(true);
    
    try {
      const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
      
      // Check if document exists first
      const docSnap = await getDoc(lawyerRef);
      if (!docSnap.exists()) {
        // Create document with basic profile data
        const initialData = {
          name: user.name || '',
          specialization: user.specialization || '',
          email: user.email || '',
          availability: {
            video: service === 'videoCall' ? newValue : false,
            audio: service === 'audioCall' ? newValue : false,
            chat: service === 'chat' ? newValue : false
          },
          isOnline: true,
          rating: 0,
          reviews: 0,
          connections: 0,
          verified: false,
          cases: 0,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        };
        
        await setDoc(lawyerRef, initialData);
      } else {
        // Update existing document
        await updateDoc(lawyerRef, {
          [`availability.${fieldMapping[service]}`]: newValue,
          lastActive: serverTimestamp(),
          isOnline: true
        });
      }
      
      // Update local state only after successful database update
      setServices(prev => ({ ...prev, [service]: newValue }));
      console.log(`${service} availability updated successfully to:`, newValue);
      
    } catch (error) {
      console.error(`Error updating ${service} availability:`, error);
      // Revert the optimistic update
      alert(`Failed to update ${service} availability. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98]">
        <div className="text-white">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
      <div className="space-y-6">
        {/* Profile Card with Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center shadow-lg">
                <Scale className="w-8 h-8 text-[#22223B]" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome</p>
                <h2 className="text-2xl font-bold text-white">{profile.name || user.name}</h2>
                <p className="text-white/80 mb-2">
                  {profile.specialization || user.specialization}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
              <span className="text-xl font-bold text-[#F2E9E4]">₹ {balance?.toLocaleString() || '0'}</span>
            </div>
          </div>

          {/* Profile Edit Button */}
          <button
            onClick={() => setCurrentPage('profile')}
            className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
          >
            <User className="w-4 h-4" /> View Profile
          </button>
        </div>

        {/* Services Toggles */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">My Services</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80 flex items-center gap-2">
                <Video className="w-5 h-5 text-white/70" /> Video Call
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.videoCall}
                  onChange={() => toggleService('videoCall')}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 flex items-center gap-2">
                <Phone className="w-5 h-5 text-white/70" /> Audio Call
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.audioCall}
                  onChange={() => toggleService('audioCall')}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-white/70" /> Chat
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.chat}
                  onChange={() => toggleService('chat')}
                  disabled={loading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>
          {loading && (
            <div className="mt-2 text-center">
              <p className="text-white/60 text-sm">Updating services...</p>
            </div>
          )}
        </div>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Client Status</span>
            <RefreshCw className={`w-5 h-5 text-[#F2E9E4] ${incomingCall ? 'animate-spin' : ''}`} />
          </div>
          <div className="mt-3">
            {incomingCall ? (
              <div className="text-sm text-[#C9ADA7] animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-[#C9ADA7] rounded-full"></div>
                Incoming consultation request...
              </div>
            ) : (
              <div className="text-sm text-white/60">No pending consultations</div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="text-3xl font-bold text-[#F2E9E4]">{profile.cases || 0}</div>
            <div className="text-sm text-white/70">Cases Handled</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="text-3xl font-bold text-[#F2E9E4]">{profile.rating || 0}</div>
            <div className="text-sm text-white/70">Client Rating</div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-3 gap-6">
          <button onClick={() => setCurrentPage('profile')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9A8C98] to-[#C9ADA7] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">My Profile</span>
          </button>
          <button onClick={() => setCurrentPage('analytics')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Analytics</span>
          </button>
          <button onClick={() => setCurrentPage('reports')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A4E69] to-[#9A8C98] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Reports</span>
          </button>
          <button onClick={() => setCurrentPage('chat')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] text-[#22223B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Chat</span>
          </button>
          <button onClick={() => setCurrentPage('contact')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9A8C98] to-[#C9ADA7] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Contact Us</span>
          </button>
          <button onClick={() => setCurrentPage('reviews')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] text-[#22223B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Reviews</span>
          </button>
          <button onClick={() => setCurrentPage('settings')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A4E69] to-[#9A8C98] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Settings</span>
          </button>
          <button onClick={() => setCurrentPage('requests')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Requests</span>
          </button>
          <button onClick={handleLogout} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22223B] to-[#4A4E69] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
