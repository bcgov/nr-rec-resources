import HomeIcon from "@/assets/icons/home.svg";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import "./BreadCrumbs.scss";

export interface BreadCrumbsProps {
  recResourceName: string;
}

const BreadCrumbs = ({ recResourceName }: BreadCrumbsProps) => {
  return (
    <div className="breadcrumbs">
      <a href="/" aria-label="Home">
        <img src={HomeIcon} alt="Home icon" />
      </a>
      <img src={ChevronRightIcon} alt="chevron icon" />
      <span className="current-path">{recResourceName}</span>
    </div>
  );
};

export default BreadCrumbs;
