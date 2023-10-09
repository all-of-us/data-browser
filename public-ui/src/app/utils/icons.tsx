import * as React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWatchFitness, faMonitorWaveform } from '@fortawesome/pro-solid-svg-icons';
import { faHeartPulse, faPersonRunning, faPersonWalking, faBedPulse } from '@fortawesome/free-solid-svg-icons';
import { faBedPulse as faBedPulseDuo } from '@fortawesome/pro-duotone-svg-icons';

const Icon = ({ shape, size, style, color, ...props }) => {
  return (
    <FontAwesomeIcon
      icon={shape}
      style={{ height: size, width: size, color, ...style }}
      {...props}
    />
  );
};

export const WatchFitness = (props) => (
  <Icon shape={faWatchFitness} {...props} />
);

export const MonitorWaveForm = (props) => (
 <Icon shape={faMonitorWaveform} {...props} />
);

export const PersonRunning = (props) => (
 <Icon shape={faPersonRunning} {...props} />
);

export const PersonWalking = (props) => (
 <Icon shape={faPersonWalking} {...props} />
);

export const HeartPulse = (props) => (
 <Icon shape={faHeartPulse} {...props} />
);

export const BedPulse = (props) => (
 <Icon shape={faBedPulse} {...props} />
);

export const BedPulseDuo = (props) => (
 <Icon shape={faBedPulseDuo} {...props} />
);