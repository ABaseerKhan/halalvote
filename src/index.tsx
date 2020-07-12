import React from 'react';
import ReactDOM from 'react-dom';
import { AppShellComponent } from './components/app-shell';

// type imports

// style imports
import './index.css';

ReactDOM.render(
  <AppShellComponent />,
  document.getElementById('root')
);

export const elementStyles = {
  toolbarHeightVh: 10,
  maxToolbarHeightPx: 60,
  itemCarouselHeightVh: 20,
  maxItemCarouselHeightPx: 120,
  commentsCardHeightVh: 60
}