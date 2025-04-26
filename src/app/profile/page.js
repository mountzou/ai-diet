// src/app/profile/page.js
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, Ruler, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getFirestoreDb } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ProfileFieldEditor from "@/components/profile/ProfileFieldEditor";
import NumericProfileFieldEditor from "@/components/profile/NumericProfileFieldEditor";


// Define individual validation schemas
const ageSchema = z.object({
  age: z.string().min(1, "Age is required"),
});

const genderSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
});

const heightSchema = z.object({
  height: z.string().min(1, "Height is required"),
});

export default function ProfilePage() {
  const { user, loading, isAuthenticated, profileComplete } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize separate forms for each field
  const ageForm = useForm({
    resolver: zodResolver(ageSchema),
    defaultValues: { age: "" },
  });
  
  const genderForm = useForm({
    resolver: zodResolver(genderSchema),
    defaultValues: { gender: "" },
  });
  
  const heightForm = useForm({
    resolver: zodResolver(heightSchema),
    defaultValues: { height: "" },
  });

  useEffect(() => {
    // Check if user is authenticated and has completed profile
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (!profileComplete) {
        router.push('/complete-profile');
        return;
      }
      
      // Fetch profile data from Firestore
      fetchProfileData();
    }
  }, [loading, isAuthenticated, profileComplete, user, router]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const db = await getFirestoreDb();
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData(data);
        
        // Reset forms with fetched values
        ageForm.reset({ age: data.age || "" });
        genderForm.reset({ gender: data.gender || "" });
        heightForm.reset({ height: data.height || "" });
      } else {
        console.error("User document does not exist");
        router.push('/complete-profile');
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Could not load your profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Generic field update function
  async function updateField(fieldName, value) {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const db = await getFirestoreDb();
      const userDocRef = doc(db, "users", user.uid);
      
      // Update just this field
      await updateDoc(userDocRef, {
        [fieldName]: value
      });
      
      // Update local state
      setProfileData({
        ...profileData,
        [fieldName]: value
      });
      
      toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
      
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      toast.error(`Failed to update ${fieldName}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Submit handlers for each field
  const onAgeSubmit = (values) => updateField("age", values.age);
  const onGenderSubmit = (values) => updateField("gender", values.gender);
  const onHeightSubmit = (values) => updateField("height", values.height);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  if (!profileComplete || !profileData) {
    return null; // Router will handle redirect
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold">User Profile</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/account">Account Settings</Link>
          </Button>
        </div>
        
        <div className="p-6 bg-white">
          <div>
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-6">
                {/* Email Field (not editable) */}
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                {/* Age Field - using NumericProfileFieldEditor */}
                <NumericProfileFieldEditor
                  label="Age"
                  value={`${profileData.age} years`}
                  unit="years"
                  icon={Calendar}
                  form={ageForm}
                  onSubmit={onAgeSubmit}
                  isSubmitting={isSubmitting}
                  min={1}
                  max={120}
                  step={1}
                  fieldName="age"
                />
                
                {/* Gender Field - using regular ProfileFieldEditor */}
                <ProfileFieldEditor
                  label="Gender"
                  value={profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : "Not specified"}
                  icon={User}
                  form={genderForm}
                  onSubmit={onGenderSubmit}
                  isSubmitting={isSubmitting}
                  renderFormField={() => (
                    <FormField
                      control={genderForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                />
                
                {/* Height Field - using NumericProfileFieldEditor */}
                <NumericProfileFieldEditor
                  label="Height"
                  value={`${profileData.height} cm`}
                  unit="cm"
                  icon={Ruler}
                  form={heightForm}
                  onSubmit={onHeightSubmit}
                  isSubmitting={isSubmitting}
                  min={50}
                  max={250}
                  step={1}
                  fieldName="height"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}