// src/components/dashboard/WeightHistory.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2, Scale } from "lucide-react";
import { 
  Line,
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

export default function WeightHistory() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const db = await getFirestoreDb();
        
        // Create a reference to the user's weight_progress subcollection
        const weightCollectionRef = collection(db, "users", user.uid, "weight_progress");
        
        // Get all documents
        const querySnapshot = await getDocs(weightCollectionRef);
        
        // Format the results, sort manually and limit to 10
        const weightData = querySnapshot.docs
          .map(doc => {
            // Extract date and time from document ID
            const timestampId = doc.id;
            let formattedDate = "Unknown";
            
            try {
              // Parse the timestamp ID format
              const match = timestampId.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})_(\d{2})_/);
              if (match) {
                const [_, datePart, hours, minutes] = match;
                // Create a date object for the chart
                const dateObj = new Date(`${datePart}T${hours}:${minutes}:00`);
                formattedDate = format(dateObj, 'MMM dd, HH:mm');
              }
            } catch (e) {
              console.error("Error parsing timestamp:", e);
            }
            
            return {
              id: doc.id,
              weight: doc.data().weight,
              date: formattedDate,
              // Original timestamp for sorting
              originalTimestamp: doc.id
            };
          })
          // Sort by document ID (timestamp) in descending order
          .sort((a, b) => b.originalTimestamp.localeCompare(a.originalTimestamp))
          // Limit to 10 items
          .slice(0, 10);
        
        // Reverse the array to get chronological order for the chart (oldest first)
        setMeasurements(weightData.reverse());
        setError(null);
      } catch (err) {
        console.error("Error fetching weight measurements:", err);
        setError("Failed to load weight history");
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
        <p className="text-sm text-gray-500">Loading weight history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Weight History</h2>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <Scale className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Weight History</h2>
            <p className="text-sm text-gray-500">No weight measurements found</p>
          </div>
          <Scale className="h-6 w-6 text-blue-500" />
        </div>
        <p className="text-center text-sm text-gray-500 py-4">
          Add your first weight measurement to start tracking your progress
        </p>
      </div>
    );
  }

  // Calculate min and max weight for Y-axis domain with a small buffer
  const weights = measurements.map(m => m.weight);
  const minWeight = Math.floor(Math.min(...weights) - 2);
  const maxWeight = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Weight History</h2>
          <p className="text-sm text-gray-500">Your recent measurements</p>
        </div>
        <Scale className="h-6 w-6 text-blue-500" />
      </div>
      
      {/* Weight Chart */}
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={measurements} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.split(',')[0]} 
            />
            <YAxis 
              domain={[minWeight, maxWeight]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value} kg`}
            />
            <Tooltip 
              formatter={(value) => [`${value} kg`, 'Weight']}
              labelFormatter={(label) => `Measured on ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#0369a1" 
              strokeWidth={2}
              dot={{ fill: '#0369a1', r: 4 }}
              activeDot={{ r: 6, fill: '#0284c7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}