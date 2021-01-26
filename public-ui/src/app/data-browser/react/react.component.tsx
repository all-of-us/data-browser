import * as React from 'react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';


export const ReactComponent: FunctionComponent<any> =
    (props) => {
        return <span>{props.text}, React</span>;
    };
