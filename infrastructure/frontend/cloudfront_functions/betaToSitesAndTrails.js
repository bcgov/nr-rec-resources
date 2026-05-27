/* eslint-disable @typescript-eslint/no-unused-vars -- `handler` is used by the CloudFront runtime */
function handler(event) {
  const request = event.request;
  const host = request.headers.host.value;

  // Check if the request is coming to the beta subdomain
  if (host === 'beta.sitesandtrailsbc.ca') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://sitesandtrailsbc.ca' + request.uri },
      },
    };
  }

  // If it's already the main domain, let it pass through
  return request;
}
