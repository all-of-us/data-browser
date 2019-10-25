import { Injectable } from '@angular/core';

@Injectable()
export class TreeHighlightService {

  constructor() { }

  getHighlightId() {
    return localStorage.getItem('treeHighlight');
  }

}
