export const SITE_TITLE = 'Sites and trails BC';

// https://react.dev/reference/react-dom/components/title
// In React 19 you can place the title component anywhere in the DOM and it will place it in the document head

const PageTitle = ({ title }: { title: string }) => {
  return <title>{title}</title>;
};

export default PageTitle;
