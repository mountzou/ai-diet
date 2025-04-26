// src/components/profile/NumericProfileFieldEditor.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, Loader2, Plus, Minus } from "lucide-react";
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

export default function NumericProfileFieldEditor({
  label,
  value,
  unit,
  icon: Icon,
  form,
  onSubmit,
  isSubmitting,
  min = 0,
  max = 1000,
  step = 1,
  fieldName
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(parseInt(form.getValues()[fieldName]) || 0);
  
  const fieldNameFormatted = label.toLowerCase();
  
  // Increment/decrement the value
  const adjustValue = (adjustment) => {
    const newValue = Math.max(min, Math.min(max, localValue + adjustment));
    setLocalValue(newValue);
    form.setValue(fieldName, newValue.toString());
  };
  
  // Create a wrapped submit handler that closes the drawer after successful submission
  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      // Close the drawer after successful submission
      setIsOpen(false);
    } catch (error) {
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
        
        <Drawer open={isOpen} onOpenChange={(newOpen) => {
          setIsOpen(newOpen);
          // Reset local value when opening the drawer
          if (newOpen) {
            const currentValue = parseInt(form.getValues()[fieldName]) || 0;
            setLocalValue(currentValue);
          }
        }}>
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
                    <div className="p-4 pb-0">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-full"
                          onClick={() => adjustValue(-step)}
                          disabled={localValue <= min}
                          type="button"
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease</span>
                        </Button>
                        <div className="flex-1 text-center">
                          <div className="text-6xl font-bold tracking-tighter">
                            {localValue}
                          </div>
                          <div className="text-[0.70rem] uppercase text-muted-foreground">
                            {unit}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-full"
                          onClick={() => adjustValue(step)}
                          disabled={localValue >= max}
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>
                    </div>
                    
                    <DrawerFooter>
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