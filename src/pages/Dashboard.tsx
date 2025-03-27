
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Section, PageTitle, PageSubtitle, Card } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Image, Plus, ArrowRight, Video, User, Layout } from 'lucide-react';
import Header from '@/components/Header';

const Dashboard = () => {
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
        
        <Section delay={1}>
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
