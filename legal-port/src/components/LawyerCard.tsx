import React from 'react';
import { Star, MessageSquare, Phone, Video, Shield } from 'lucide-react';
import { Lawyer } from '../services/lawyerService';

interface LawyerCardProps {
  lawyer: Lawyer;
  onSelectService: (lawyer: Lawyer, serviceType: 'audio' | 'video' | 'chat') => void;
}

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

  const handleConsultation = (type: 'call' | 'message') => {
    if (type === 'call') {
      if (lawyer.availability?.audio || lawyer.availability?.video) {
        // Placeholder for call action
        console.log('Initiating call with', lawyer.name);
      }
    } else if (type === 'message') {
      if (lawyer.availability?.chat) {
        // Placeholder for message action
        console.log('Opening message with', lawyer.name);
      }
    }
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
          Currently offline • Last seen {lawyer.lastActive.toRelativeTimeString()}
        </div>
      )}

      <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleConsultation('call')}
              disabled={!lawyer.availability?.audio && !lawyer.availability?.video}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !lawyer.availability?.audio && !lawyer.availability?.video
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              Call Now
            </button>
            <button
              onClick={() => handleConsultation('message')}
              disabled={!lawyer.availability?.chat}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !lawyer.availability?.chat
                  ? 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>
    </div>
  );
};

export default LawyerCard;