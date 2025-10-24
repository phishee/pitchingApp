import React from 'react';
import { Dumbbell, Calendar, TrendingUp, Users, Target, Clock, Award, Activity } from 'lucide-react';

export function AthleteDashboard() {
  
  // If user is not a member and has no pending requests/invitations
  return (
    <div className="space-y-6 p-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Athlete!</h1>
        <p className="text-blue-100">Ready to crush your training goals today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Dumbbell className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Workouts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
          <p className="text-xs text-green-600">+2 this week</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Goals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">8/10</p>
          <p className="text-xs text-green-600">80% complete</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">2.5h</p>
          <p className="text-xs text-gray-500">This week</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
          <p className="text-xs text-green-600">Days</p>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Workout Session {i}</h3>
                <p className="text-sm text-gray-500">45 minutes • {i} day{i > 1 ? 's' : ''} ago</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Schedule</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Training Session {i}</h3>
                <p className="text-sm text-gray-500">Tomorrow at 2:00 PM</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Scheduled</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h2>
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Progress chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Team Activity */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Teammate {i}</span> completed a workout
                </p>
                <p className="text-xs text-gray-500">{i} hour{i > 1 ? 's' : ''} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Dumbbell, label: 'Start Workout', color: 'blue' },
            { icon: Calendar, label: 'Schedule', color: 'purple' },
            { icon: Target, label: 'Set Goals', color: 'green' },
            { icon: Activity, label: 'View Progress', color: 'orange' }
          ].map((action, i) => (
            <button
              key={i}
              className={`p-4 rounded-lg border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors`}
            >
              <action.icon className={`w-6 h-6 text-${action.color}-600 mx-auto mb-2`} />
              <p className={`text-sm font-medium text-${action.color}-800`}>{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Content for Scrolling */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">More Content</h2>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-medium text-gray-900 mb-2">Content Section {i}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              This is some sample content to help you test the scrolling behavior of the mobile header and bottom navigation. 
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="mt-3 flex space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Tag {i}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Category</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Spacing */}
      <div className="h-20"></div>
    </div>
  );
}