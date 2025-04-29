"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Loader2, TrendingUp, TrendingDown, CalendarIcon, FilterIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  CartesianGrid, 
  Line, 
  LineChart, 
  XAxis, 
  YAxis,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function WeightHistory() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true); // New state for chart-specific loading
  const [error, setError] = useState(null);
  const [trend, setTrend] = useState({ direction: null, percentage: 0 });
  const [filterType, setFilterType] = useState("preset"); // 'preset' or 'custom'
  const [dateRange, setDateRange] = useState("10d");
  const [dateRangeValue, setDateRangeValue] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 10)),
    to: new Date()
  });
  const [allMeasurements, setAllMeasurements] = useState([]);

  const dateRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "10d", label: "Last 10 days" },
    { value: "14d", label: "Last 14 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "all", label: "All measurements" }
  ];

  // Render filter controls for both preset and custom date ranges
  const renderFilterControls = () => {
    return (
      <div className="flex items-start flex-col w-full">
        <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Preset Ranges</TabsTrigger>
            <TabsTrigger value="custom">Custom Range</TabsTrigger>
          </TabsList>
          <TabsContent value="preset" className="mt-2">
            <Select value={dateRange} onValueChange={(value) => {
              setChartLoading(true); // Set chart to loading state when filter changes
              setDateRange(value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
          <TabsContent value="custom" className="mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeValue.from ? (
                    dateRangeValue.to ? (
                      <>
                        {format(dateRangeValue.from, "MMM dd, yyyy")} - {format(dateRangeValue.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRangeValue.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRangeValue.from}
                  selected={dateRangeValue}
                  onSelect={(value) => {
                    setChartLoading(true); // Set chart to loading state when filter changes
                    setDateRangeValue(value);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Generate filter description based on current filter settings
  const getFilterDescription = () => {
    if (filterType === 'preset') {
      const selectedRangeLabel = dateRangeOptions.find(option => option.value === dateRange)?.label;
      return `${measurements.length} measurements ${selectedRangeLabel ? `(${selectedRangeLabel})` : ''}`;
    } else {
      const fromFormatted = format(dateRangeValue.from, 'MMM dd, yyyy');
      const toFormatted = format(dateRangeValue.to, 'MMM dd, yyyy');
      return `${measurements.length} measurements (${fromFormatted} - ${toFormatted})`;
    }
  };

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!user) return;

      try {
        setChartLoading(true); // Set chart to loading state when data is being fetched
        
        // Save the current scroll position
        const scrollPosition = window.scrollY;
        
        const db = await getFirestoreDb();
        
        // Create a reference to the user's weight_progress subcollection
        const weightCollectionRef = collection(db, "users", user.uid, "weight_progress");
        
        // Start with a base query
        let weightQuery;
        
        if (filterType === 'preset') {
          if (dateRange === "all") {
            // Just get the most recent 30 measurements
            weightQuery = query(
              weightCollectionRef,
              orderBy("timestamp", "desc"), // Now using timestamp field
              limit(30)
            );
          } else {
            // Get measurements from the last X days
            const days = parseInt(dateRange);
            const cutoffDate = subDays(new Date(), days);
            
            weightQuery = query(
              weightCollectionRef,
              where("timestamp", ">=", Timestamp.fromDate(cutoffDate)),
              orderBy("timestamp", "desc"),
              limit(30)
            );
          }
        } else if (filterType === 'custom' && dateRangeValue.from && dateRangeValue.to) {
          // For custom range, use timestamp field for both bounds
          const fromDate = startOfDay(dateRangeValue.from);
          const toDate = endOfDay(dateRangeValue.to);
          
          weightQuery = query(
            weightCollectionRef,
            where("timestamp", ">=", Timestamp.fromDate(fromDate)),
            where("timestamp", "<=", Timestamp.fromDate(toDate)), 
            orderBy("timestamp", "desc"),
            limit(30)
          );
        } else {
          // Default: just get the most recent measurements
          weightQuery = query(
            weightCollectionRef,
            orderBy("timestamp", "desc"),
            limit(30)
          );
        }
        
        // Execute the query
        const querySnapshot = await getDocs(weightQuery);
        
        // Format the results - handle both old and new document formats
        let weightData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let formattedDate = "Unknown";
          let dateObj = null;
          
          // Check if there's a timestamp field (new format)
          if (data.timestamp && data.timestamp.toDate) {
            dateObj = data.timestamp.toDate();
            formattedDate = format(dateObj, 'MMM dd, HH:mm');
          } else {
            // Fall back to legacy format (parsing from document ID)
            try {
              const timestampId = doc.id;
              const match = timestampId.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})_(\d{2})_/);
              if (match) {
                const [_, datePart, hours, minutes] = match;
                dateObj = new Date(`${datePart}T${hours}:${minutes}:00`);
                formattedDate = format(dateObj, 'MMM dd, HH:mm');
              }
            } catch (e) {
              console.error("Error parsing timestamp:", e);
            }
          }
          
          return {
            id: doc.id,
            weight: data.weight,
            date: formattedDate,
            dateObj: dateObj,
            // Use proper timestamp for sorting if available
            timestamp: data.timestamp ? data.timestamp.toDate().getTime() : (dateObj ? dateObj.getTime() : 0)
          };
        });
        
        // Sort by timestamp
        weightData.sort((a, b) => b.timestamp - a.timestamp);
        
        // Set filtered measurements
        setAllMeasurements(weightData);
        
        // Calculate trend percentage if we have at least two measurements
        if (weightData.length >= 2) {
          // The data is in descending order (newest first)
          const newestWeight = weightData[0].weight;
          const oldestWeight = weightData[weightData.length - 1].weight;
          const difference = newestWeight - oldestWeight;
          const trendPercentage = ((difference / oldestWeight) * 100).toFixed(1);
          
          setTrend({
            direction: difference < 0 ? 'down' : 'up',
            percentage: Math.abs(trendPercentage)
          });
        } else {
          // Reset trend if fewer than 2 measurements
          setTrend({ direction: null, percentage: 0 });
        }
        
        // Reverse the array to get chronological order for the chart (oldest first)
        setMeasurements(weightData.reverse());
        setError(null);
      } catch (err) {
        console.error("Error fetching weight measurements:", err);
        setError("Failed to load weight history");
      } finally {
        setLoading(false);
        // Add a small delay before removing the loading state to ensure smooth transition
        setTimeout(() => {
          setChartLoading(false);
          
          // Restore scroll position after a short delay to ensure DOM has updated
          setTimeout(() => {
            window.scrollTo({
              top: window.scrollY,
              behavior: 'auto' // Use 'auto' to avoid smooth scrolling which could be noticeable
            });
          }, 50);
        }, 300);
      }
    };

    fetchMeasurements();
  }, [user, dateRange, filterType, dateRangeValue]);

  // Chart Skeleton component that matches exact dimensions of the chart
  const ChartSkeleton = () => (
    <div className="h-[300px] w-full flex flex-col" style={{ minHeight: '300px' }}>
      <div className="flex justify-between items-center h-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ height: 'calc(100% - 8px)' }}>
        <div className="w-full h-full relative">
          <Skeleton className="absolute bottom-0 w-full h-[80%] rounded-md opacity-70" />
          <div className="absolute bottom-0 w-full flex justify-between">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-12" />
            ))}
          </div>
          <div className="absolute h-[80%] left-0 flex flex-col justify-between">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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
            <div>
              <CardTitle>Weight History</CardTitle>
              <CardDescription className="text-red-500">{error}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Calculate min and max weight for Y-axis domain with a small buffer (if measurements exist)
  const weights = measurements.map(m => m.weight);
  const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 2) : 0;
  const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 2) : 100;

  return (
    <Card className="w-full shadow">
      <CardHeader>
        {/* Use flex-col on mobile and flex-row on larger screens */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <CardTitle>Weight History</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {allMeasurements.length > 0 
                ? getFilterDescription()
                : "No weight measurements found"}
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {renderFilterControls()}
          </div>
        </div>
      </CardHeader>
      <Separator className="my-1" />
      <CardContent>
        <div className="h-[300px]" style={{ minHeight: '300px' }}>
          {chartLoading ? (
            <ChartSkeleton />
          ) : measurements.length > 0 ? (
            <ChartContainer config={{ weight: { label: "Weight" } }} className="h-[300px] w-full">
              <LineChart
                data={measurements}
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
                  dot={{ fill: '#e76e50', r: 3 }}
                  activeDot={{ r: 5, stroke: '#e76e50', strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-sm text-muted-foreground py-4">
                {allMeasurements.length > 0 
                  ? "No measurements found for the selected date range" 
                  : "Add your first weight measurement to start tracking your progress"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <Separator className="my-1" />
      {trend.direction && measurements.length >= 2 && (
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
            Showing your {measurements.length} measurements from {filterType === 'preset' 
              ? dateRangeOptions.find(option => option.value === dateRange)?.label 
              : `${format(dateRangeValue.from, 'MMM dd')} to ${format(dateRangeValue.to, 'MMM dd')}`}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}