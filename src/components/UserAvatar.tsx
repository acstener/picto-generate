
import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md',
  onClick
}) => {
  const { user } = useAuth();
  
  // Fetch user profile including avatar
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Get the most recent face image as avatar
  const { data: latestImage } = useQuery({
    queryKey: ['latestUserImage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('thumbnails')
        .select('face_image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching latest image:', error);
        return null;
      }
      
      return data?.face_image_url || null;
    },
    enabled: !!user,
  });
  
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };
  
  const getFallbackSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };
  
  const getInitials = () => {
    if (!user) return 'G';
    
    const email = user.email || '';
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };
  
  // Update user profile with avatar if they have a face image but no avatar
  useEffect(() => {
    const updateUserAvatar = async () => {
      if (user && latestImage && profile && !profile.avatar_url) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: latestImage })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating user avatar:', error);
        }
      }
    };
    
    updateUserAvatar();
  }, [user, latestImage, profile]);
  
  // Get avatar URL from profile, latest image, or metadata
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (latestImage) return latestImage;
    return user?.user_metadata?.avatar_url || '';
  };
  
  return (
    <Avatar className={`${getSize()} cursor-pointer`} onClick={onClick}>
      <AvatarImage 
        src={getAvatarUrl()} 
        alt={user?.email || 'User'} 
      />
      <AvatarFallback className={getFallbackSize()}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
