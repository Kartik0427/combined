import React from 'react';
import { Star, MessageSquare, Phone, Video, Shield } from 'lucide-react';
import { Lawyer } from '../services/lawyerService';

interface LawyerCardProps {
  lawyer: Lawyer;
  onSelectService: (lawyer: Lawyer, serviceType: 'audio' | 'video' | 'chat') => void;
}

// Helper function to format relative time
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onSelectService }) => {
  const getServiceButton = (serviceType: 'audio' | 'video' | 'chat', icon: React.ReactNode, label: string) => {
    const isAvailable = lawyer.availability[serviceType];
    const price = lawyer.pricing[serviceType];
    
    return (
      <button
        onClick={() => isAvailable && onSelectService(lawyer, serviceType)}
        disabled={!isAvailable}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isAvailable
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {icon}
        <span>{label}</span>
        <span className="ml-auto">${price}</span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <img
            src={lawyer.image || '/placeholder-lawyer.jpg'}
            alt={lawyer.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
            lawyer.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-900">{lawyer.name}</h3>
            {lawyer.verified && (
              <Shield className="w-4 h-4 text-blue-600" />
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-2">
            {lawyer.specializations.slice(0, 2).join(', ')}
            {lawyer.specializations.length > 2 && ` +${lawyer.specializations.length - 2} more`}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{lawyer.rating}</span>
              <span>({lawyer.reviews})</span>
            </div>
            <span>•</span>
            <span>{lawyer.experience} years exp.</span>
            <span>•</span>
            <span>{lawyer.connections} connections</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 mb-3">Book a session:</h4>
        
        {getServiceButton('chat', <MessageSquare className="w-4 h-4" />, 'Chat')}
        {getServiceButton('audio', <Phone className="w-4 h-4" />, 'Audio Call')}
        {getServiceButton('video', <Video className="w-4 h-4" />, 'Video Call')}
      </div>

      {!lawyer.isOnline && (
        <div className="mt-4 text-center text-sm text-gray-500 bg-gray-50 py-2 px-3 rounded-lg">
          Currently offline • Last seen {getRelativeTimeString(lawyer.lastActive)}
        </div>
      )}
    </div>
  );
};

export default LawyerCard;