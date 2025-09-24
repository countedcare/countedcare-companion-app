import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, ExternalLink, Share, DollarSign, FileText, Phone, Mail, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useResourcesSystem } from '@/hooks/useResourcesSystem';
import { toast } from 'sonner';
import { analytics } from '@/utils/analytics';

const ResourceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toggleBookmark, isBookmarked, logResourceEvent } = useResourcesSystem();

  useEffect(() => {
    if (id) {
      loadResource(id);
      // Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'resource_view', {
          resource_id: id
        });
      }
    }
  }, [id]);

  const loadResource = async (resourceId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) throw error;
      setResource(data);
    } catch (err) {
      console.error('Error loading resource:', err);
      toast.error('Resource not found');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!resource) return;
    
    try {
      await toggleBookmark(resource.id);
    } catch (err) {
      toast.error('Failed to update saved status');
    }
  };

  const handleApplyClick = () => {
    if (resource?.apply_url) {
      try {
        // Ensure URL has protocol
        let url = resource.apply_url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        console.log('Opening apply URL:', url);
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Analytics event
        analytics.resourceApplyClicked(resource.id);
        toast.success('Opening application page...');
      } catch (error) {
        console.error('Error opening apply URL:', error);
        toast.error('Unable to open application page');
      }
    } else {
      toast.error('No application link available');
    }
  };

  const handleLearnMoreClick = () => {
    if (resource?.source_url) {
      try {
        // Ensure URL has protocol
        let url = resource.source_url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        console.log('Opening source URL:', url);
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Analytics event  
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'resource_click_source', {
            resource_id: resource.id
          });
        }
        toast.success('Opening information page...');
      } catch (error) {
        console.error('Error opening source URL:', error);
        toast.error('Unable to open information page');
      }
    } else {
      toast.error('No information link available');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: resource?.title,
      text: resource?.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!resource) {
    return (
      <Layout>
        <div className="container-padding py-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Resource not found</p>
            <Button onClick={() => navigate('/resources')} className="mt-4">
              Back to Resources
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{resource.category}</Badge>
                  {resource.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <CardTitle className="text-2xl mb-2">{resource.title}</CardTitle>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  className={`${isBookmarked(resource.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                >
                  <Heart className={`h-5 w-5 ${isBookmarked(resource.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

        <CardContent className="space-y-6">
          {/* What it provides */}
          <div>
            <h3 className="font-semibold mb-2">What it provides</h3>
            <p className="text-gray-700">{resource.description}</p>
          </div>

          {/* Estimated Savings */}
          {(resource.estimated_benefit_min || resource.estimated_benefit_max) && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Estimated Savings</h3>
                  <p className="text-gray-700">
                    {resource.estimated_benefit_min && resource.estimated_benefit_max
                      ? `$${resource.estimated_benefit_min.toLocaleString()} - $${resource.estimated_benefit_max.toLocaleString()}`
                      : resource.estimated_benefit_min
                        ? `From $${resource.estimated_benefit_min.toLocaleString()}`
                        : `Up to $${resource.estimated_benefit_max.toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Eligibility */}
          {resource.eligibility_summary && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Eligibility Requirements</h3>
                <p className="text-gray-700">{resource.eligibility_summary}</p>
              </div>
            </>
          )}

          {/* How to Apply */}
          {resource.application_steps && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">How to Apply</h3>
                  <p className="text-gray-700 whitespace-pre-line">{resource.application_steps}</p>
                </div>
              </div>
            </>
          )}

          {/* Documents Required */}
          {resource.documents_required && resource.documents_required.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Documents Required</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.documents_required.map((doc, index) => (
                    <Badge key={index} variant="outline">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Contact Information */}
          {resource.contact_phone || resource.contact_email || resource.contact_hours && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                   {resource.contact_phone && (
                     <div className="flex items-center gap-2">
                       <Phone className="h-4 w-4 text-gray-500" />
                       <a 
                         href={`tel:${resource.contact_phone.replace(/[^\d+]/g, '')}`} 
                         className="text-blue-600 hover:underline"
                         onClick={() => console.log('Calling:', resource.contact_phone)}
                       >
                         {resource.contact_phone}
                       </a>
                     </div>
                   )}
                   {resource.contact_email && (
                     <div className="flex items-center gap-2">
                       <Mail className="h-4 w-4 text-gray-500" />
                       <a 
                         href={`mailto:${resource.contact_email}`} 
                         className="text-blue-600 hover:underline"
                         onClick={() => console.log('Emailing:', resource.contact_email)}
                       >
                         {resource.contact_email}
                       </a>
                     </div>
                   )}
                  {resource.contact_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{resource.contact_hours}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex flex-col sm:flex-row gap-3">
            {resource.apply_url && (
              <Button onClick={handleApplyClick} className="flex items-center gap-2">
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {resource.source_url && (
              <Button variant="secondary" onClick={handleLearnMoreClick} className="flex items-center gap-2">
                Learn More
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ResourceDetail;