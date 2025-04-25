// src/app/account/page.js
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the password validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AccountPage() {
  const { user, loading, signOut, deleteAccount, updateUserPassword } =
    useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const router = useRouter();

  // Initialize the password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!password) return;

    setIsDeleting(true);

    try {
      const success = await deleteAccount(password);

      if (success) {
        setIsDeleteDialogOpen(false);
        router.push("/");
      }
    } finally {
      setIsDeleting(false);
      setPassword("");
    }
  };

  // Password update handler
  const handlePasswordUpdate = async (values) => {
    setIsUpdatingPassword(true);

    try {
      const success = await updateUserPassword(
        values.currentPassword,
        values.newPassword
      );

      if (success) {
        passwordForm.reset();
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Account Settings</h1>
        </div>

        <div className="p-6 bg-white">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium">Account Information</h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        value={user.email}
                        readOnly
                        className="pr-10 bg-gray-50"
                      />
                      {user.emailVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={user.uid}
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="created">Account Created</Label>
                    <Input
                      id="created"
                      value={
                        user.metadata.creationTime
                          ? new Date(
                              user.metadata.creationTime
                            ).toLocaleString()
                          : "N/A"
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastSignIn">Last Sign In</Label>
                    <Input
                      id="lastSignIn"
                      value={
                        user.metadata.lastSignInTime
                          ? new Date(
                              user.metadata.lastSignInTime
                            ).toLocaleString()
                          : "N/A"
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Update Section */}
            <div className="pt-5 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Change Password
              </h2>

              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                  className="space-y-4 max-w-md"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Your current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="New password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Account Actions section */}
            <div className="pt-5 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Account Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="destructive"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              Please enter your password to confirm account deletion:
            </p>
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!password || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
