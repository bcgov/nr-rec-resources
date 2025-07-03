import { CSSProperties, FC } from 'react';
import { RecreationResourceDetailModel } from '@/service/custom-models/recreation-resource';
import parse from 'html-react-parser';
import {
  formatFeeDate,
  formatFeeDays,
  getFeeTypeLabel,
} from '@/utils/recreationFeeUtils';
import activityIconMap from '@/data/activityIconMap';
import { SiteDescription } from '@/components/rec-resource/section';
import { getRecResourceDetailPageUrl } from '@/utils/recreationResourceUtils';

interface RecResourceHTMLExportDescriptionProps {
  recResource: RecreationResourceDetailModel;
}

const containerStyle: CSSProperties = {
  padding: 16,
  fontFamily: 'Arial, sans-serif',
  fontSize: 15,
  margin: '10px 0',
  background: '#f9f9f9',
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  maxWidth: 420,
};

const imageStyle: CSSProperties = {
  width: '100%',
  maxWidth: 'fit-content',
  borderRadius: 6,
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: 8,
  objectFit: 'cover',
};

const titleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 8,
};

const feeCardStyle: CSSProperties = {
  border: '1px solid #d0d0d0',
  padding: 8,
  borderRadius: 5,
  background: '#fff',
  marginBottom: 2,
  marginTop: 4,
};

const feeLabelStyle: CSSProperties = {
  fontWeight: 600,
  marginBottom: 2,
};

const feeAmountStyle: CSSProperties = {
  color: '#555',
  fontWeight: 500,
};

const feeMetaStyle: CSSProperties = {
  fontSize: 13,
  color: '#555',
};

const thingsToDoSectionStyle: CSSProperties = {
  marginTop: 12,
  padding: 10,
  background: '#fff',
  borderRadius: 6,
  border: '1px solid #d0d0d0',
};

const thingsToDoListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'table',
  width: '100%',
};

const thingsToDoItemStyle: CSSProperties = {
  display: 'table-row',
  borderRadius: 4,
  padding: '4px 10px',
  border: '1px solid #e0e0e0',
};

const thingsToDoItemCellStyle: CSSProperties = {
  display: 'table-cell',
  verticalAlign: 'middle',
  padding: '4px',
};

const thingsToDoItemTextStyle: CSSProperties = {
  fontSize: 15,
  display: 'inline-block',
  verticalAlign: 'middle',
};

const sectionHeadingCSS = `
.rec-resource-description h2 {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

h3 {
  font-weight: 700;
  font-size: 16px;
}
`;

/**
 * Renders a detailed HTML description of a recreation resource for export (e.g., KML file).
 * This component displays the resource's name, image, description, fees, access, driving directions,
 * activities (with icons).
 *
 * All styles (CSS) are inline to ensure compatibility with HTML exports and KML viewers.
 */
export const RecResourceHTMLExportDescription: FC<
  RecResourceHTMLExportDescriptionProps
> = ({ recResource }) => {
  const {
    name,
    recreation_access,
    recreation_resource_images,
    driving_directions,
    recreation_activity,
    recreation_fee,
    description,
    maintenance_standard_code,
  } = recResource;

  const renderFees = () =>
    recreation_fee && recreation_fee.length > 0 ? (
      <div>
        <h3>Fees</h3>
        <div
          style={{
            marginTop: 6,
          }}
        >
          {recreation_fee.map((fee, index) => (
            <div key={index} style={feeCardStyle}>
              <div style={feeLabelStyle}>
                {getFeeTypeLabel(fee.recreation_fee_code)} Fee
              </div>
              <div style={feeAmountStyle}>
                ${Number(fee.fee_amount).toFixed(2)}
              </div>
              <div style={feeMetaStyle}>
                {formatFeeDate(fee.fee_start_date)} -{' '}
                {formatFeeDate(fee.fee_end_date)}
              </div>
              <div style={feeMetaStyle}>{formatFeeDays(fee)}</div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const renderThingsToDo = () =>
    recreation_activity && recreation_activity.length > 0 ? (
      <div>
        <h3>Things to do</h3>
        <section style={thingsToDoSectionStyle}>
          <ul style={thingsToDoListStyle}>
            {recreation_activity.map((activity) => {
              const { description, recreation_activity_code } = activity;
              const activityIcon = activityIconMap?.[recreation_activity_code];
              return (
                <li key={description} style={thingsToDoItemStyle}>
                  <span style={thingsToDoItemCellStyle}>
                    {activityIcon && (
                      <img
                        alt={`${description} icon`}
                        src={activityIcon}
                        height={28}
                        width={28}
                        style={{ marginRight: 4, verticalAlign: 'middle' }}
                      />
                    )}
                  </span>
                  <span style={thingsToDoItemCellStyle}>
                    <span style={thingsToDoItemTextStyle}>{description}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    ) : null;

  const access = recreation_access.join(', ');

  const imageUrl =
    recreation_resource_images && recreation_resource_images.length > 0
      ? recreation_resource_images[0]?.recreation_resource_image_variants?.[0]
          ?.url || ''
      : '';

  return (
    <>
      <style>{sectionHeadingCSS}</style>
      <div className="rec-resource-description" style={containerStyle}>
        {imageUrl && <img src={imageUrl} alt={name} style={imageStyle} />}
        <div style={titleStyle}>{name}</div>
        <a
          style={{ color: '#4f8747' }}
          href={getRecResourceDetailPageUrl(recResource.rec_resource_id)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Sites & Trails BC
        </a>
        <SiteDescription
          description={description}
          maintenanceCode={maintenance_standard_code}
        />
        {renderFees()}
        {access && (
          <div>
            <h3>Access</h3>
            <span>{access}</span>
          </div>
        )}
        {driving_directions && (
          <div>
            <h3>Driving directions</h3>
            <span>{parse(driving_directions)}</span>
          </div>
        )}
        {renderThingsToDo()}
      </div>
    </>
  );
};
