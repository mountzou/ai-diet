"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2, Scale, TrendingUp, TrendingDown } from "lucide-react";
import { Separator } from "@/components/ui/separator"
import { 
  CartesianGrid, 
  Line, 
  LineChart, 
  XAxis, 
  YAxis,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";

export default function WeightHistory() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trend, setTrend] = useState({ direction: null, percentage: 0 });

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
        
        // Calculate trend percentage if we have at least two measurements
        if (weightData.length >= 2) {
          const newestWeight = weightData[0].weight;
          const oldestWeight = weightData[weightData.length - 1].weight;
          const difference = newestWeight - oldestWeight;
          const trendPercentage = ((difference / oldestWeight) * 100).toFixed(1);
          
          setTrend({
            direction: difference < 0 ? 'down' : 'up',
            percentage: Math.abs(trendPercentage)
          });
        }
        
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
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">Loading weight history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weight History</CardTitle>
            <Scale className="h-6 w-6 text-blue-500" />
          </div>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weight History</CardTitle>
            <Scale className="h-6 w-6 text-blue-500" />
          </div>
          <CardDescription>No weight measurements found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-4">
            Add your first weight measurement to start tracking your progress
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate min and max weight for Y-axis domain with a small buffer
  const weights = measurements.map(m => m.weight);
  const minWeight = Math.floor(Math.min(...weights) - 2);
  const maxWeight = Math.ceil(Math.max(...weights) + 2);

  return (
    <Card className="w-full shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weight History</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {measurements.length} measurements
          </CardDescription>
          <Scale className="h-6 w-6 text-dark-500" />
        </div>
      </CardHeader>
      <Separator className="my-1" />
      <CardContent>
        <ChartContainer config={{ weight: { label: "Weight" } }} className="h-[300px] w-full">
          <LineChart
            data={measurements}
            margin={{
              top: 5,
              right: 50,
              left: 10,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => value.split(',')[0]} 
            />
            <YAxis 
              domain={[minWeight, maxWeight]}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => `${value} kg`}
            />
            <ChartTooltip 
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(label) => `Measured on ${label}`}
                valueFormatter={(value) => `${value} kg`}
              />}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#e76e50" 
              strokeWidth={2}
              dot={{ fill: 'none', r: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <Separator className="my-1" />
      {trend.direction && (
        <CardFooter className="flex-col items-center gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {trend.direction === 'down' ? (
              <>
                Trending down by {trend.percentage}% from first to last measurement
                <TrendingDown className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Trending up by {trend.percentage}% from first to last measurement
                <TrendingUp className="h-4 w-4 text-red-500" />
              </>
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            Showing your {measurements.length} most recent weight measurements
          </div>
        </CardFooter>
      )}
    </Card>
  );
}