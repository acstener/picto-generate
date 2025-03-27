
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Section, PageTitle, PageSubtitle, Card } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Image, Plus, ArrowRight, Video, User, Layout, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's thumbnails
  const { data: userThumbnails, isLoading } = useQuery({
    queryKey: ['userThumbnails', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('thumbnails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching thumbnails:', error);
        toast.error('Failed to load your thumbnails');
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Delete thumbnail mutation
  const deleteThumbnailMutation = useMutation({
    mutationFn: async (thumbnailId: string) => {
      const { error } = await supabase
        .from('thumbnails')
        .delete()
        .eq('id', thumbnailId);
      
      if (error) throw error;
      return thumbnailId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userThumbnails', user?.id] });
      toast.success('Thumbnail deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting thumbnail:', error);
      toast.error(`Failed to delete thumbnail: ${error.message}`);
    },
  });

  const handleDeleteThumbnail = (id: string) => {
    if (confirm('Are you sure you want to delete this thumbnail?')) {
      deleteThumbnailMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <Container>
        <Section delay={0}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <PageTitle>Dashboard</PageTitle>
              <PageSubtitle>Create and manage your YouTube thumbnails</PageSubtitle>
            </div>
            
            <Link to="/create">
              <Button className="mt-4 md:mt-0 gap-2">
                <Plus className="h-4 w-4" />
                New Thumbnail
              </Button>
            </Link>
          </div>
        </Section>
        
        {user && userThumbnails && userThumbnails.length > 0 && (
          <Section delay={1}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Thumbnails</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userThumbnails.map((thumbnail) => (
                <Card key={thumbnail.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full">
                    <img 
                      src={thumbnail.thumbnail_url} 
                      alt={thumbnail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{thumbnail.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{thumbnail.description || 'No description'}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {thumbnail.style || 'Custom'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteThumbnail(thumbnail.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}
        
        <Section delay={user && userThumbnails && userThumbnails.length > 0 ? 2 : 1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create a Thumbnail</h2>
                  <p className="text-gray-500 mt-2">
                    Generate eye-catching thumbnails for your YouTube videos in minutes
                  </p>
                  
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-gray-600">Upload your face or use examples</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                        <Video className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-gray-600">Enter your video information</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                        <Layout className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-gray-600">Select your preferred style</span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                        <Image className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-gray-600">Get your professionally-designed thumbnail</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/create">
                  <Button className="w-full gap-2">
                    Get Started 
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover-scale">
              <h2 className="text-2xl font-semibold text-gray-900">Why Great Thumbnails Matter</h2>
              <p className="text-gray-600 mt-2">
                Thumbnails are the first thing viewers see and significantly impact your click-through rate
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="bg-white/80 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900">Higher Click-Through Rates</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Professional thumbnails can increase CTR by up to 30%
                  </p>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900">Brand Recognition</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Consistent thumbnail style helps viewers recognize your content
                  </p>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900">Better Viewer Retention</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Clear thumbnails set accurate expectations for your content
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/create">
                  <Button variant="outline" className="w-full gap-2">
                    Create Your First Thumbnail
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Section>
      </Container>
    </div>
  );
};

export default Dashboard;
