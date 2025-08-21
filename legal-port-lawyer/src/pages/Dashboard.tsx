import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, DollarSign, MessageSquare, Mail, Star, LogOut, Phone, Video, RefreshCw, Scale, TrendingUp, Calendar, BarChart3, Settings, Inbox } from 'lucide-react';

const Dashboard = ({ user, balance, setCurrentPage, handleLogout }) => {
  const [services, setServices] = useState({
    videoCall: false,
    audioCall: false,
    chat: false
  });
  const [incomingCall, setIncomingCall] = useState(false);
  const [analyticsView, setAnalyticsView] = useState('week');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
        const docSnap = await getDoc(lawyerRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          // Initialize services state from fetched data
          setServices({
            videoCall: data.availability?.video || false,
            audioCall: data.availability?.audio || false,
            chat: data.availability?.chat || false,
          });
        } else {
          console.log("No such document!");
          // If no profile exists, use initial state or default values
          setProfile({ name: user.name, specialization: user.specialization, cases: 0, rating: 0 });
        }
      } catch (error) {
        console.error("Error fetching lawyer profile:", error);
        // Fallback to user data if fetching fails
        setProfile({ name: user.name, specialization: user.specialization, cases: 0, rating: 0 });
      }
    };

    fetchLawyerProfile();

    const interval = setInterval(() => {
      setIncomingCall(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [user.uid, user.name, user.specialization]);

  const toggleService = async (service) => {
    const fieldMapping = {
      videoCall: 'video',
      audioCall: 'audio',
      chat: 'chat'
    };
    
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
    try {
      const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
      await updateDoc(lawyerRef, {
        [`availability.${fieldMapping[service]}`]: !services[service],
        lastActive: serverTimestamp(),
        isOnline: true // Assuming toggling a service means the lawyer is online
      });
      console.log(`${service} availability updated successfully`);
    } catch (error) {
      console.error(`Error updating ${service} availability:`, error);
      // Revert local state if update fails
      setServices(prev => ({ ...prev, [service]: services[service] }));
    }
  };

  // Mock analytics data
  const analyticsData = {
    week: [12, 19, 15, 27, 22, 18, 25],
    month: [45, 52, 48, 61, 58, 65, 72, 69, 75, 68, 82, 89, 95, 88, 92, 98, 105, 102, 110, 115, 108, 120, 118, 125, 128, 135, 132, 140, 138, 145],
    year: [450, 520, 480, 610, 580, 650, 720, 690, 750, 680, 820, 890]
  };

  const labels = {
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    month: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Feb 1', 'Feb 5', 'Feb 10', 'Feb 15', 'Feb 20', 'Feb 25', 'Mar 1', 'Mar 5', 'Mar 10', 'Mar 15', 'Mar 20', 'Mar 25', 'Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'May 1', 'May 5', 'May 10', 'May 15', 'May 20', 'May 25'],
    year: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

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
                <h2 className="text-2xl font-bold text-white">{profile?.name || user.name}</h2>
                <p className="text-white/80 mb-2">
                  {profile?.specialization || user.specialization}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
              <span className="text-xl font-bold text-[#F2E9E4]">₹ {balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Profile Edit Button */}
          <button
            onClick={() => setCurrentPage('editProfile')}
            className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
          >
            <User className="w-4 h-4" /> Edit Profile
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
              </label>
            </div>
          </div>
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
            <div className="text-3xl font-bold text-[#F2E9E4]">{profile?.cases || 0}</div>
            <div className="text-sm text-white/70">Cases Handled</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="text-3xl font-bold text-[#F2E9E4]">{profile?.rating || 0}</div>
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