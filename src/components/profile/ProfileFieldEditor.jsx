// src/components/profile/ProfileFieldEditor.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, Loader2 } from "lucide-react";
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
import { Form } from "@/components/ui/form";

export default function ProfileFieldEditor({
  label,
  value,
  icon: Icon,
  form,
  onSubmit,
  renderFormField,
  isSubmitting,
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const fieldNameFormatted = label.toLowerCase();
  
  // Create a wrapped submit handler that closes the drawer after successful submission
  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      // Close the drawer after successful submission
      setIsOpen(false);
    } catch (error) {
      // Error handling is already done in the parent component
      console.error("Error in field editor:", error);
    }
  };
  
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
      <div className="flex-1 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-gray-900">{value}</p>
        </div>
        
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm">
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Edit {label}</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle>Edit Your {label}</DrawerTitle>
                <DrawerDescription>
                  Update your {fieldNameFormatted} information. Click save when you're done.
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="px-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {renderFormField()}
                    
                    <DrawerFooter className="px-0">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </form>
                </Form>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}