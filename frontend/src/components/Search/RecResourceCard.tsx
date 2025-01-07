import '@/styles/components/Search.scss';

interface RecResourceCardProps {
  forest_file_id: string;
  name: string;
  description: string;
}

const RecResourceCard: React.FC<RecResourceCardProps> = ({
  forest_file_id,
  name,
  description,
}) => {
  return (
    <div
      className="rec-resource-card"
      key={forest_file_id}
      style={{
        border: '1px solid black',
        padding: '1rem',
        margin: '1rem 0',
      }}
    >
      <h2>{name}</h2>
      <p>{description}</p>
      <a href={`/resource/${forest_file_id}`}>View {name} Information</a>
    </div>
  );
};

export default RecResourceCard;
