import React, {ReactNode} from 'react';
import ReactDOM from 'react-dom';
import { AppShellComponent } from './components/app-shell';
import { CookiesProvider } from 'react-cookie';

// type imports

// style imports
import './index.css';

ReactDOM.render(
  <CookiesProvider >
    <AppShellComponent/>
    <div id="login-portal"></div>
    <div id="portal"></div>
  </CookiesProvider>,
  document.getElementById('root')
);

export const elementStyles = {
  toolbarHeightVh: 12,
  maxToolbarHeightPx: 65,
  topicCarouselHeightVh: 14,
  maxTopicCarouselHeightPx: 135
}

export const Portal = ({children} : {children: ReactNode}) => ReactDOM.createPortal(children, document.getElementById("portal") || document.createElement("portal"));
