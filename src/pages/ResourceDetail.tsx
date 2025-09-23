import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, ExternalLink, Share, DollarSign, FileText, Phone, Mail, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSavedResources } from '@/hooks/useSupabaseSavedResources';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url?: string;
  content?: string;
  tags?: string[];
  estimated_benefit?: string;
  eligibility_requirements?: string[];
  application_process?: string;
  contact_info?: any;
  external_links?: any;
}

const ResourceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const { saveResource, unsaveResource, isResourceSaved } = useSupabaseSavedResources();

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
      if (isResourceSaved(resource.id)) {
        await unsaveResource(resource.id);
        toast.success('Resource removed from saved');
      } else {
        await saveResource(resource.id);
        toast.success('Resource saved');
      }
    } catch (err) {
      toast.error('Failed to update saved status');
    }
  };

  const handleApplyClick = () => {
    if (resource?.external_links?.apply_url) {
      window.open(resource.external_links.apply_url, '_blank');
      // Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'resource_click_apply', {
          resource_id: resource.id
        });
      }
    }
  };

  const handleLearnMoreClick = () => {
    if (resource?.url || resource?.external_links?.source_url) {
      const url = resource.external_links?.source_url || resource.url;
      window.open(url, '_blank');
      // Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'resource_click_source', {
          resource_id: resource.id
        });
      }
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
                  className={`${isResourceSaved(resource.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                >
                  <Heart className={`h-5 w-5 ${isResourceSaved(resource.id) ? 'fill-current' : ''}`} />
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
              <p className="text-gray-700">{resource.content || resource.description}</p>
            </div>

            {/* Estimated Savings */}
            {resource.estimated_benefit && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Estimated Savings</h3>
                    <p className="text-gray-700">{resource.estimated_benefit}</p>
                  </div>
                </div>
              </>
            )}

            {/* Eligibility */}
            {resource.eligibility_requirements && resource.eligibility_requirements.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Eligibility Requirements</h3>
                  <ul className="space-y-2">
                    {resource.eligibility_requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* How to Apply */}
            {resource.application_process && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">How to Apply</h3>
                    <p className="text-gray-700 whitespace-pre-line">{resource.application_process}</p>
                  </div>
                </div>
              </>
            )}

            {/* Contact Information */}
            {resource.contact_info && Object.keys(resource.contact_info).length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {resource.contact_info.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${resource.contact_info.phone}`} className="text-blue-600 hover:underline">
                          {resource.contact_info.phone}
                        </a>
                      </div>
                    )}
                    {resource.contact_info.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href={`mailto:${resource.contact_info.email}`} className="text-blue-600 hover:underline">
                          {resource.contact_info.email}
                        </a>
                      </div>
                    )}
                    {resource.contact_info.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{resource.contact_info.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <Separator />
            <div className="flex flex-col sm:flex-row gap-3">
              {resource.external_links?.apply_url && (
                <Button onClick={handleApplyClick} className="flex items-center gap-2">
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {(resource.url || resource.external_links?.source_url) && (
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