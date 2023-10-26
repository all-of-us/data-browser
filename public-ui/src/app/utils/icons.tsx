import * as React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Icon = ({ shape, size, style, color, ...props }) => {
  return (
    <FontAwesomeIcon
      icon={shape}
      style={{ height: size, width: size, color, ...style }}
      {...props}
    />
  );
};
