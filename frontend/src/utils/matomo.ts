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
