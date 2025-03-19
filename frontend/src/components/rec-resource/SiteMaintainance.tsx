import '@/components/rec-resource/SiteMaintainance.scss';

interface RecreationMaintenanceDto {
  id: number;
  recreation_maintenance_code: string;
}

interface SiteMaintenanceProps {
  data: RecreationMaintenanceDto[];
}

const maintenanceMessages: Record<string, string> = {
  M: 'This site is maintained to Recreation Sites & Trails BC standards by partners or contractors.',
  U: 'Limited maintenance services are provided at this site. Please respect the environment and pack out what you pack in.',
};

const SiteMaintenance: React.FC<SiteMaintenanceProps> = ({ data }) => {
  if (data.length === 0) return null;

  const maintenanceInfo =
    maintenanceMessages[data[0]?.recreation_maintenance_code] ||
    'Unknown maintenance status';

  return (
    <div className="pb-5">
      <span className="text-dark site-maintainance-title">
        Maintenance Type
      </span>
      <p className="site-maintainance-description pt-2">{maintenanceInfo}</p>
    </div>
  );
};

export default SiteMaintenance;
