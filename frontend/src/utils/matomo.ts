type TrackEventParams = {
  action?: string;
  category: string;
  name?: string;
  value?: number;
};

type TrackSiteSearchParams = {
  keyword: string;
  category: string;
  resultsCount?: number;
};

export const trackEvent = ({
  action,
  category,
  name,
  value,
}: TrackEventParams) => {
  console.log('Tracking event:', {
    action,
    category,
    name,
    value,
  });
  if (window._paq) {
    window._paq.push(['trackEvent', category, action, name, value]);
  }
};

export const trackClickEvent = ({
  action = 'Click',
  category,
  name,
  value,
}: TrackEventParams) => {
  return () => {
    console.log('Tracking click event:', {
      action,
      category,
      name,
      value,
    });
    trackEvent({
      category,
      action,
      name,
      value,
    });
  };
};

export const trackSiteSearch = ({
  category,
  keyword,
  resultsCount,
}: TrackSiteSearchParams) => {
  if (window._paq) {
    window._paq.push(['trackSiteSearch', keyword, category, resultsCount]);
  }
};
