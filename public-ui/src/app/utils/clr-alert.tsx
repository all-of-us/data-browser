import * as React from 'react';

export const ClrAlert = ({className = '', ...props}) => {
    return React.createElement('clr-alert', {class: className, ...props});
};
