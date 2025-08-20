
import React from "react";
import { ArrowLeft, Scale, Phone, Mail } from "lucide-react";

const ProfilePage = ({ user, setCurrentPage }) => (
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
      </div>
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center">
            <Scale className="w-10 h-10 text-[#22223B]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-white/80">{user.specialization}</p>
            <p className="text-sm text-white/70">
              {user.experience} Experience
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F2E9E4]">
              {user.rating}
            </div>
            <div className="text-sm text-white/70">Rating</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F2E9E4]">{user.cases}</div>
            <div className="text-sm text-white/70">Cases Won</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
            <Phone className="w-5 h-5 text-white/70" />
            <span className="text-white">{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
            <Mail className="w-5 h-5 text-white/70" />
            <span className="text-white">{user.email}</span>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-[#9A8C98] to-[#C9ADA7] text-white py-3 rounded-2xl mt-6 font-medium hover:from-[#C9ADA7] hover:to-[#F2E9E4] hover:text-[#22223B] transition-all">
          Edit Profile
        </button>
      </div>
    </div>
  </div>
);

export default ProfilePage;
