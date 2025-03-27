
import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from './ui';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

const Header: React.FC<HeaderProps> = ({ className, ...props }) => {
  return (
    <header 
      className={cn(
        'w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50',
        className
      )}
      {...props}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-primary transition-opacity duration-200 hover:opacity-80"
          >
            <Layout className="h-8 w-8" />
            <span className="text-xl font-semibold">ThumbnailAI</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/create" 
              className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <Image className="h-4 w-4" />
              <span>Create Thumbnail</span>
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};

export default Header;
