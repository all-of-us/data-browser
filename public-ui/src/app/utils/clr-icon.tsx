import * as React from 'react';

export const ClrIcon = ({className = '', ...props}) => {
    return React.createElement('clr-icon', {class: className, ...props});
};
