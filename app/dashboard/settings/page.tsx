'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, Camera, User } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setFormData({
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          location: user.user_metadata?.location || '',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
        });
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    }
    
    loadProfile();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    setIsUploading(true);
    setMessage(null);

    // 0. Auto-delete the old photo if it exists to save space
    if (formData.avatarUrl) {
      try {
        // Extract the filename from the public URL
        const urlParts = formData.avatarUrl.split('/');
        const oldFileName = urlParts[urlParts.length - 1];
        
        if (oldFileName) {
          await supabase.storage
            .from('Photos')
            .remove([oldFileName]);
        }
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
        // Continue with the upload even if delete fails
      }
    }

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('Photos')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ type: 'error', text: `Upload failed: ${uploadError.message}` });
      setIsUploading(false);
      return;
    }

    // 2. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('Photos')
      .getPublicUrl(filePath);

    // 3. Immediately update the user's metadata with the new URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) {
      setMessage({ type: 'error', text: `Failed to save avatar: ${updateError.message}` });
    } else {
      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
    }
    
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { 
        first_name: formData.firstName,
        last_name: formData.lastName,
        location: formData.location
        // avatarUrl is handled immediately on upload, no need to send it here
      }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c26941]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2621]">Account Settings</h1>
        <p className="text-sm text-[#78716c] mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e7e5e4] shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-[#2d2621] mb-6">Profile Information</h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md flex items-start gap-3 border ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Avatar Upload Section */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#e7e5e4]">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-[#e7e5e4] border-4 border-white shadow-sm flex items-center justify-center shrink-0">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-gray-400" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-[#2d2621]">Profile Photo</h3>
            <p className="text-xs text-[#78716c] mb-3 mt-1">We recommend a square image, at least 200x200px.</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              disabled={isUploading || isSaving}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSaving}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              {formData.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#2d2621]">First name</Label>
              <Input 
                id="firstName" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="border-[#e7e5e4] focus-visible:ring-[#c26941]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#2d2621]">Last name</Label>
              <Input 
                id="lastName" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="border-[#e7e5e4] focus-visible:ring-[#c26941]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-[#2d2621]">Location</Label>
            <Input 
              id="location" 
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Main Warehouse"
              className="border-[#e7e5e4] focus-visible:ring-[#c26941]"
            />
            <p className="text-xs text-[#78716c]">This will be displayed as your role/location in the header.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#2d2621]">Email Address</Label>
            <Input 
              id="email" 
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="border-[#e7e5e4] bg-[#f5f5f4] text-[#78716c] cursor-not-allowed"
            />
            <p className="text-xs text-[#78716c]">Email addresses cannot be changed directly from here.</p>
          </div>

          <div className="pt-4 border-t border-[#e7e5e4] flex justify-end">
            <Button 
              type="submit" 
              className="bg-[#c26941] hover:bg-[#a65632] text-white"
              disabled={isSaving || isUploading}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
