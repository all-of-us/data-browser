import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import * as React from 'react';

export function highlightSearchTerm(searchTerm: string, text: string, highlightColor: string) {
  let words = [];
  let matchString: RegExp;
  if (!searchTerm || searchTerm === ' ' ||
    searchTerm === '.' || searchTerm === ',') {
    words = [text];
    return <React.Fragment>{words.map((word, w) => <span key={w}>
      {word}
    </span>)}</React.Fragment>;
  } else {
    let searchWords = searchTerm.split(new RegExp(',| '));
    searchWords = searchWords.filter(w => w.length > 0);
    // Replace all the special characters in search word
    searchWords = searchWords.map(word => word.replace(/[^a-zA-Z0-9-. ]/g, ''));
    matchString = new RegExp(searchWords.join('|'));
    const matches = text.match(new RegExp(matchString, 'gi'));
    const splits = text.split(new RegExp(matchString, 'i'));
    if (matches) {
      words = [];
      for (let i = 0; i < matches.length; i++) {
        words.push(splits[i], matches[i]);
      }
      if (splits.length > matches.length) {
        words.push(splits[splits.length - 1]);
      }
    } else {
      words = [text];
    }
  }

  return <React.Fragment>{words.map((word, w) => <span key={w}
    style={matchString.test(word.toLowerCase()) ? {
            fontFamily: 'GothamBold, Arial, san-serif',
            fontWeight: 700
    } : {}}>
    {word}
  </span>)}</React.Fragment>;
}

interface Props {
  searchTerm: string;
  text: string;
}

export const HighlightReactComponent = class extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { searchTerm, text } = this.props;
    return highlightSearchTerm(searchTerm, text, 'yellow');
  }
};

@Component({
  selector: 'app-highlight-react',
  template: `<span #root></span>`,
  styleUrls: ['./highlight-search.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class HighlightWrapperComponent extends BaseReactWrapper {
  @Input() public searchTerm: string;
  @Input() public text: string;

  constructor() {
    super(HighlightReactComponent, ['searchTerm', 'text']);
  }
}
