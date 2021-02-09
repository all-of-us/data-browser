import * as React from 'react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

export const PopUpReactComponent: FunctionComponent = (props) => {

  const {title: propsTitle, onClick} = props;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return <div className="data-statement">
          <div className="card">
             <div onClick={handleClick} className="close">x</div>
            <h2 className="card-title">{propsTitle}</h2>
            <div className="btn-container">
             </div>
          </div>
         </div>;
};