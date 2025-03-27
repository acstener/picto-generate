
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md',
  onClick
}) => {
  const { user } = useAuth();
  
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
  
  return (
    <Avatar className={`${getSize()} cursor-pointer`} onClick={onClick}>
      <AvatarImage 
        src={user?.user_metadata?.avatar_url || ''} 
        alt={user?.email || 'User'} 
      />
      <AvatarFallback className={getFallbackSize()}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
