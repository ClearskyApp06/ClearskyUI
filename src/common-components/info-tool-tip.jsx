import InfoIcon from '@mui/icons-material/Info';
import './info-tool-tip.css';

const InfoTooltip = ({ text }) => {
  return (
    <div
      className="info-icon-wrapper"
      tabIndex="0"
      aria-describedby="tooltip-text"
    >
      <InfoIcon className="info-icon" />
      <span className="tooltip-text">{text}</span>
    </div>
  );
};

export default InfoTooltip;
