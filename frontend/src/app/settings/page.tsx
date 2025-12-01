"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { Loader2, User, Lock, Bell, Palette, Moon, Monitor, Sun } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { Switch } from "@radix-ui/react-switch";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto w-full pb-20">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences.</p>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="cursor-pointer"><User size={16} className="mr-2 "/> Profile</TabsTrigger>
            <TabsTrigger value="account" className="cursor-pointer"><Lock size={16} className="mr-2 "/> Account</TabsTrigger>
            <TabsTrigger value="appearance" className="cursor-pointer"><Palette size={16} className="mr-2 "/> Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="cursor-pointer"><Bell size={16} className="mr-2 "/> Notifications</TabsTrigger>
            {/* Add other tabs if implemented */}
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm user={user} />
          </TabsContent>
          <TabsContent value="account">
            <AccountForm />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceForm />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsForm />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}



// --- 1. APPEARANCE FORM ---
function AppearanceForm() {
  const { user, updateProfile } = useAuthStore();
  const currentTheme = user?.theme || "light";

  const handleThemeChange = async (newTheme: string) => {
    try {
      // Optimistic UI update (optional, but store handles it mostly)
      await updateProfile({ theme: newTheme });
      toast.success(`Theme set to ${newTheme}`);
    } catch (error) {
      toast.error("Failed to update theme");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
            {/* LIGHT */}
            <div 
                className={`cursor-pointer rounded-md border-2 p-2 hover:border-blue-500 ${currentTheme === 'light' ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}
                onClick={() => handleThemeChange("light")}
            >
                <div className="mb-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-2 w-[80%] rounded-lg bg-gray-200" />
                    <div className="mt-2 h-2 w-[60%] rounded-lg bg-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                    <Sun size={16} />
                    <span className="text-sm font-medium">Light</span>
                </div>
            </div>

            {/* DARK */}
            <div 
                className={`cursor-pointer rounded-md border-2 p-2 hover:border-blue-500 ${currentTheme === 'dark' ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}
                onClick={() => handleThemeChange("dark")}
            >
                <div className="mb-2 rounded-md bg-slate-950 p-2 shadow-sm">
                    <div className="h-2 w-[80%] rounded-lg bg-slate-800" />
                    <div className="mt-2 h-2 w-[60%] rounded-lg bg-slate-800" />
                </div>
                <div className="flex items-center gap-2">
                    <Moon size={16} />
                    <span className="text-sm font-medium">Dark</span>
                </div>
            </div>

            {/* SYSTEM (Just treats as light for MVP if no detector logic) */}
            <div 
                className={`cursor-pointer rounded-md border-2 p-2 hover:border-blue-500 ${currentTheme === 'system' ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}
                onClick={() => handleThemeChange("system")}
            >
                <div className="mb-2 rounded-md bg-slate-200 p-2 shadow-sm">
                    <div className="h-2 w-[80%] rounded-lg bg-slate-400" />
                    <div className="mt-2 h-2 w-[60%] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                    <Monitor size={16} />
                    <span className="text-sm font-medium">System</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- 2. NOTIFICATIONS FORM ---
function NotificationsForm() {
  const { user, updateProfile } = useAuthStore();
  
  // Default values if JSON is empty/null
  const prefs = user?.notifications || { email: true, boards: true, marketing: false };

  const toggleNotification = async (key: string, value: boolean) => {
      const newPrefs = { ...prefs, [key]: value };
      try {
          await updateProfile({ notifications: newPrefs });
          toast.success("Preferences saved");
      } catch (error) {
          toast.error("Failed to save preference");
      }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive alerts.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
             <Label className="text-base">Email Notifications</Label>
             <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
          </div>
          <Switch 
            checked={prefs.email} 
            onCheckedChange={(val) => toggleNotification('email', val)} 
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
             <Label className="text-base">Board Updates</Label>
             <p className="text-sm text-muted-foreground">Get notified when cards are moved or comments are added.</p>
          </div>
          <Switch 
             checked={prefs.boards}
             onCheckedChange={(val) => toggleNotification('boards', val)}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
             <Label className="text-base">Marketing Emails</Label>
             <p className="text-sm text-muted-foreground">Receive news and updates about new features.</p>
          </div>
          <Switch 
             checked={prefs.marketing}
             onCheckedChange={(val) => toggleNotification('marketing', val)}
          />
        </div>

      </CardContent>
    </Card>
  );
}

// --- REAL PROFILE FORM ---
function ProfileForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  // Local state for inputs
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({ name, bio });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your public profile details.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input value={user?.email || ""} disabled className="bg-gray-100 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
                id="bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-gray-50/50 flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// --- REAL ACCOUNT FORM ---
function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const changePassword = useAuthStore((s) => s.changePassword);
  
  const [formData, setFormData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New passwords do not match");
        return;
    }
    
    if (formData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    setIsLoading(true);
    try {
      await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
      });
      toast.success("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Ensure your account is using a strong password.</CardDescription>
      </CardHeader>
      <form onSubmit={onPasswordSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
                id="currentPassword" 
                type="password" 
                value={formData.currentPassword}
                onChange={handleChange}
                required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
                id="newPassword" 
                type="password" 
                value={formData.newPassword}
                onChange={handleChange}
                required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
                id="confirmPassword" 
                type="password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-gray-50/50 flex justify-end">
          <Button type="submit" disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Update Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
