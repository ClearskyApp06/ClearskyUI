import InfoIcon from '@mui/icons-material/Info';
import './info-tool-tip.css';

const InfoTooltip = ({ text }) => {
  return (
    <div className="info-tooltip-container">
      <InfoIcon className="info-icon" />
      <span className="tooltip-text">{text}</span>
    </div>
  );
};

export default InfoTooltip;
