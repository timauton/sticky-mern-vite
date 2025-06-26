// frontend/src/components/ActivityChart.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getUserActivity } from '../services/activityService';
import { getCurrentUserId } from '../utils/auth';

const ActivityChart = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userId = getCurrentUserId();
        
        const data = await getUserActivity(userId, token);
        
        console.log('Activity API Response:', data);
        
        // Backend returns: { chartData: [...], token: '...' }
        // Data is combined with memesCreated and memesRated
        const chartData = data.chartData || [];
        
        // Transform the data to match chart format
        const transformedData = chartData.map(item => ({
          date: item.period, // Use period as the date
          created: item.memesCreated || 0,
          rated: item.memesRated || 0
        }));
        
        console.log('Transformed chart data:', transformedData);
        setActivityData(transformedData);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="card activity-chart-card">
        <h2>My Activity</h2>
        <p>Loading your activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card activity-chart-card">
        <h2>My Activity</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (activityData.length === 0) {
    return (
      <div className="card activity-chart-card">
        <h2>My Activity</h2>
        <p>No activity data yet. Start creating and rating memes!</p>
      </div>
    );
  }

  return (
    <div className="card activity-chart-card">
      <h2>My Activity</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis 
              dataKey="date" 
              stroke="#000"
              fontSize={12}
            />
            <YAxis 
              stroke="#000"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #000',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="#01b9e8"
              strokeWidth={3}
              name="Memes Created"
              dot={{ fill: '#01b9e8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#01b9e8', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="rated" 
              stroke="#EA375F"
              strokeWidth={3}
              name="Memes Rated"
              dot={{ fill: '#EA375F', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EA375F', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;