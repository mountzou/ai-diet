// src/components/dashboard/WeightTracker.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, Minus, HeartPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/lib/firebase";
import { doc, setDoc, collection, Timestamp, addDoc } from "firebase/firestore";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function WeightTracker() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState(70); // Default weight in kg
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to adjust weight value
  const adjustWeight = (adjustment) => {
    setWeight(Math.max(30, Math.min(250, weight + adjustment)));
  };
  
  // Function to save weight to Firestore with updated schema
  const saveWeight = async () => {
    if (!user) {
      toast.error("You must be logged in to track your weight");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const db = await getFirestoreDb();
      const weightCollectionRef = collection(db, "users", user.uid, "weight_progress");
      
      // Create a timestamp from the selected date
      const measurementTimestamp = Timestamp.fromDate(selectedDate);
      
      // Add a new document with auto-generated ID and proper timestamp fields
      await addDoc(weightCollectionRef, {
        weight: weight,
        timestamp: measurementTimestamp,
        created_at: Timestamp.now(),
        
        // Optional: For backward compatibility during migration
        legacy_format: true
      });
      
      toast.success("Weight measurement saved successfully!");
      setIsOpen(false);
      
    } catch (error) {
      console.error("Error saving weight measurement:", error);
      toast.error("Failed to save weight measurement");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset state when opening the drawer
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setWeight(70);
      setSelectedDate(new Date());
    }
  };
  
  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Weight Tracker</h2>
          <p className="text-sm text-gray-500">Track your weight progress</p>
        </div>
        <HeartPlus className="h-6 w-6 text-black-500" />
      </div>
      
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <Button className="w-full">Add Weight Measurement</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Add Weight Measurement</DrawerTitle>
              <DrawerDescription>
                Add your weight and specify when it was measured.
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-4 pb-0">
              <div className="flex items-center justify-center space-x-2 mb-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => adjustWeight(-0.5)}
                  disabled={weight <= 30}
                  type="button"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-6xl font-bold tracking-tighter">
                    {weight.toFixed(1)}
                  </div>
                  <div className="text-[0.70rem] uppercase text-muted-foreground">
                    kilograms
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => adjustWeight(0.5)}
                  disabled={weight >= 250}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Measurement Date & Time</h3>
                <DateTimePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Select when this weight was measured.
                </p>
              </div>
            </div>
            
            <DrawerFooter>
              <Button 
                onClick={saveWeight} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Measurement"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}