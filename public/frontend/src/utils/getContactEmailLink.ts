import { RecreationResourceDetailModel } from '@/service/custom-models';

/**
 * Generates a mailto link for contacting Recreation Sites and Trails BC.
 *
 * If a recreation resource is provided, the email body will be pre-filled with
 * details about the resource and placeholders for user information.
 *
 * @param rec_resource - Optional recreation resource details to include in the email body.
 * @returns A mailto link string with subject and optional body.
 */
export function getContactEmailLink(
  rec_resource?: RecreationResourceDetailModel,
): string {
  const email = 'recinfo@gov.bc.ca';
  const subject = 'Recreation Sites and Trails BC - Contact Us Message';

  if (!rec_resource) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }

  const {
    name = '',
    rec_resource_id = '',
    recreation_district,
    closest_community = '',
  } = rec_resource;

  const districtDescription = recreation_district?.description?.trim();
  const districtLine = districtDescription
    ? `District: ${districtDescription}\n`
    : '';

  const body = [
    'Full Name: [Your Name]',
    'Email Address: [your@email.com]',
    'Phone Number: [123-456-7890]',
    `Location: ${name.trim()}${rec_resource_id ? ` - ${rec_resource_id.trim()}` : ''}`,
    districtLine ? districtLine.trim() : '',
    `Closest Community: ${closest_community}`,
    'Message: [Please provide your message here.]',
  ]
    .filter(Boolean)
    .join('\n');

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
