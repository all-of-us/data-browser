import * as React from 'react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import '../../../styles/template.css';
import './pop-up.component.css';

export interface IMyComponentProps {
  title: string;
  statement: string,
  onClick?: () => void;
}

export const PopUpReactComponent: FunctionComponent<IMyComponentProps> = (props: IMyComponentProps) => {

  const {title: propsTitle, statement: propsStatement, onClick} = props;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return <div className="data-statement">
          <div className="card">
             <div onClick={handleClick} className="close">x</div>
            <h2 className="card-title">{propsTitle}</h2>
            <div className="card-body" dangerouslySetInnerHTML={{ __html: propsStatement }}></div>
            <div className="btn-container">
            <button onClick={handleClick} className="disclaimer-btn">OK</button>
             </div>
          </div>
         </div>;
};