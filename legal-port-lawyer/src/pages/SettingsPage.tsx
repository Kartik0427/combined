
import React, { useState, useEffect } from "react";
import { ArrowLeft, Video, Phone, MessageSquare, Bell, Shield, Globe, Settings as SettingsIcon } from "lucide-react";
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { updateLawyerAvailability, updateLawyerOnlineStatus } from '../services/lawyerStatusService';

const SettingsPage = ({ user, setCurrentPage }) => {
  const [settings, setSettings] = useState({
    isOnline: false,
    availability: {
      audio: false,
      video: false,
      chat: false
    },
    notifications: {
      newRequests: true,
      messages: true,
      promotions: false
    }
  });
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (user?.uid) {
      const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
      const unsubscribe = onSnapshot(lawyerRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSettings(prev => ({
            ...prev,
            isOnline: data.isOnline || false,
            availability: {
              audio: data.availability?.audio || false,
              video: data.availability?.video || false,
              chat: data.availability?.chat || false
            }
          }));
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const toggleOnlineStatus = async () => {
    const newStatus = !settings.isOnline;
    setLoading(prev => ({ ...prev, online: true }));
    
    try {
      await updateLawyerOnlineStatus(user.uid, newStatus);
    } catch (error) {
      console.error('Error updating online status:', error);
    } finally {
      setLoading(prev => ({ ...prev, online: false }));
    }
  };

  const toggleAvailability = async (serviceType) => {
    const newStatus = !settings.availability[serviceType];
    setLoading(prev => ({ ...prev, [serviceType]: true }));
    
    try {
      await updateLawyerAvailability(user.uid, serviceType, newStatus);
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setLoading(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const ToggleSwitch = ({ enabled, loading, onClick, label, icon, description }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <span className="text-white font-medium">{label}</span>
          {description && <p className="text-white/60 text-sm">{description}</p>}
        </div>
      </div>
      <button 
        onClick={onClick}
        disabled={loading}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors backdrop-blur-sm border border-white/20 ${
          enabled ? 'bg-gradient-to-r from-[#C9ADA7] to-[#F2E9E4]' : 'bg-white/10'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {/* Online Status */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Online Status
          </h2>
          <ToggleSwitch
            enabled={settings.isOnline}
            loading={loading.online}
            onClick={toggleOnlineStatus}
            label="Available for Consultations"
            icon={<div className={`w-3 h-3 rounded-full ${settings.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />}
            description="Toggle your overall availability for new consultation requests"
          />
        </div>

        {/* Service Availability */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Service Availability
          </h2>
          <div className="space-y-1 divide-y divide-white/10">
            <ToggleSwitch
              enabled={settings.availability.video}
              loading={loading.video}
              onClick={() => toggleAvailability('video')}
              label="Video Consultation"
              icon={<Video className="w-5 h-5 text-white/80" />}
              description="Accept video call consultation requests"
            />
            <ToggleSwitch
              enabled={settings.availability.audio}
              loading={loading.audio}
              onClick={() => toggleAvailability('audio')}
              label="Audio Consultation"
              icon={<Phone className="w-5 h-5 text-white/80" />}
              description="Accept audio call consultation requests"
            />
            <ToggleSwitch
              enabled={settings.availability.chat}
              loading={loading.chat}
              onClick={() => toggleAvailability('chat')}
              label="Chat Consultation"
              icon={<MessageSquare className="w-5 h-5 text-white/80" />}
              description="Accept text-based consultation requests"
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h2>
          <div className="space-y-1 divide-y divide-white/10">
            <ToggleSwitch
              enabled={settings.notifications.newRequests}
              loading={false}
              onClick={() => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, newRequests: !prev.notifications.newRequests }
              }))}
              label="New Consultation Requests"
              icon={<Bell className="w-5 h-5 text-white/80" />}
              description="Get notified when clients request consultations"
            />
            <ToggleSwitch
              enabled={settings.notifications.messages}
              loading={false}
              onClick={() => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, messages: !prev.notifications.messages }
              }))}
              label="New Messages"
              icon={<MessageSquare className="w-5 h-5 text-white/80" />}
              description="Get notified for new messages from clients"
            />
            <ToggleSwitch
              enabled={settings.notifications.promotions}
              loading={false}
              onClick={() => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, promotions: !prev.notifications.promotions }
              }))}
              label="Promotions & Updates"
              icon={<Shield className="w-5 h-5 text-white/80" />}
              description="Receive updates about new features and promotions"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
