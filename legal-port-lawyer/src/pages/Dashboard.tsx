
import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Phone,
  Video,
  Settings,
  Bell,
  Search,
  ArrowLeft,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { subscribeLawyerStatus } from "../services/lawyerStatusService";

const Dashboard = ({ user, balance, setCurrentPage, handleLogout }) => {
  const [lawyerData, setLawyerData] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        
        // Subscribe to real-time lawyer status
        const unsubscribeStatus = subscribeLawyerStatus(user.uid, (data) => {
          setLawyerData(data);
          setLoading(false);
        });

        return () => {
          if (unsubscribeStatus) unsubscribeStatus();
        };
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const stats = [
    {
      title: "Total Clients",
      value: lawyerData?.connections || "0",
      icon: Users,
      change: "+12%",
      color: "bg-blue-500",
    },
    {
      title: "Active Cases",
      value: "23",
      icon: Calendar,
      change: "+8%",
      color: "bg-green-500",
    },
    {
      title: "Monthly Revenue",
      value: `₹${balance.toLocaleString()}`,
      icon: DollarSign,
      change: "+15%",
      color: "bg-purple-500",
    },
    {
      title: "Success Rate",
      value: "94%",
      icon: TrendingUp,
      change: "+2%",
      color: "bg-orange-500",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "consultation",
      client: "Rahul Sharma",
      message: "Video consultation completed",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "message",
      client: "Priya Patel",
      message: "New message received",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: 3,
      type: "booking",
      client: "Amit Kumar",
      message: "Audio consultation booked",
      time: "6 hours ago",
      status: "scheduled",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Welcome back, {user.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {lawyerData?.specializations?.join(', ') || user.specialization}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Online Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${lawyerData?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {lawyerData?.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setCurrentPage("settings")}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCurrentPage("requests")}
                  className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-900">
                    View Requests
                  </span>
                </button>
                <button
                  onClick={() => setCurrentPage("chat")}
                  className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  <Phone className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-900">
                    Active Calls
                  </span>
                </button>
                <button
                  onClick={() => setCurrentPage("profile")}
                  className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <User className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-900">
                    Edit Profile
                  </span>
                </button>
                <button
                  onClick={() => setCurrentPage("analytics")}
                  className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
                >
                  <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-orange-900">
                    Analytics
                  </span>
                </button>
              </div>
            </div>

            {/* Service Status */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Video Calls</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lawyerData?.availability?.video 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lawyerData?.availability?.video ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Audio Calls</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lawyerData?.availability?.audio 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lawyerData?.availability?.audio ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Chat</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lawyerData?.availability?.chat 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lawyerData?.availability?.chat ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage("settings")}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Manage Availability
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.client}
                      </p>
                      <p className="text-sm text-gray-500">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage("requests")}
                className="w-full mt-4 text-indigo-600 hover:text-indigo-800 font-medium py-2 transition-colors"
              >
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="flex flex-col items-center py-2 px-1 text-indigo-600"
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentPage("requests")}
            className="flex flex-col items-center py-2 px-1 text-gray-400"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs mt-1">Requests</span>
          </button>
          <button
            onClick={() => setCurrentPage("profile")}
            className="flex flex-col items-center py-2 px-1 text-gray-400"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
          <button
            onClick={() => setCurrentPage("settings")}
            className="flex flex-col items-center py-2 px-1 text-gray-400"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
