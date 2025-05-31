"use client";

import { useState, useEffect } from 'react';
import { getRecentActivities, formatActivityDescription, getActivityIcon, Activity } from '@/lib/activities';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const recentActivities = await getRecentActivities(5);
        setActivities(recentActivities);
      } catch (err) {
        setError('Failed to load recent activities');
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'Recently';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-300">Loading recent activity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-300">
          <div className="text-4xl mb-4">📝</div>
          <p>No recent activity</p>
          <p className="text-sm mt-2">Roster changes and transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-4 bg-black/20 rounded-lg">
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-white font-medium">
                {formatActivityDescription(activity)}
              </p>
              {activity.details && (
                <p className="text-gray-400 text-sm mt-1">{activity.details}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              activity.type === 'trade' ? 'bg-blue-500/20 text-blue-300' :
              activity.type === 'signing' ? 'bg-green-500/20 text-green-300' :
              activity.type === 'drop' ? 'bg-red-500/20 text-red-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {activity.type.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Activity updates in real-time when roster changes are made
        </p>
      </div>
    </div>
  );
}
