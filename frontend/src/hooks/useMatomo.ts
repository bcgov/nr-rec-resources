import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useMatomoTracking = () => {
  // TODO: figure out if this is necessary
  const location = useLocation();

  useEffect(() => {
    if (window._paq) {
      console.log('Tracking page view:', {
        url: window.location.href,
        title: document.title,
      });
      window._paq.push(['setCustomUrl', window.location.href]);
      window._paq.push(['setDocumentTitle', document.title]);
      window._paq.push(['trackPageView']);
    }
  }, [location]);
};

export const useMatomo = () => {
  const trackEvent = ({
    category,
    action,
    name,
    value,
  }: {
    category: string;
    action: string;
    name?: string;
    value?: number;
  }) => {
    if (window._paq) {
      console.log('Tracking event:', {
        category,
        action,
        name,
        value,
      });
      window._paq.push(['trackEvent', category, action, name, value]);
    }
  };

  const trackSiteSearch = ({
    keyword,
    category,
    resultsCount,
  }: {
    keyword: string;
    category: string;
    resultsCount?: number;
  }) => {
    if (window._paq) {
      console.log('Tracking site search:', {
        keyword,
        category,
        resultsCount,
      });
      window._paq.push(['trackSiteSearch', keyword, category, resultsCount]);
    }
  };

  return {
    trackEvent,
    trackSiteSearch,
  };
};
