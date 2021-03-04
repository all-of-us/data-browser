import {mount} from 'enzyme';
import * as React from 'react';

import {RhFooter} from './rh-footer';

describe('RhFooter', () => {
  it('should render', () => {
    const wrapper = mount(<RhFooter/>);
    expect(wrapper).toBeTruthy();
  });
});
