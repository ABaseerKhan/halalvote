import React, {ReactNode} from 'react';
import ReactDOM from 'react-dom';
import { AppShellComponent } from './components/app-shell';
import { CookiesProvider } from 'react-cookie';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

// type imports

// style imports
import './index.css';
import { vhToPixels } from './utils';

export const elementStyles = {
  toolbarHeightVh: 13,
  maxToolbarHeightPx: 70,
  topicCarouselHeightVh: 15,
  maxTopicCarouselHeightPx: 150
}

export const modalHeightVh = 70;
export const modalWidthVw = (isMobile: boolean): number => isMobile ? 80 : 40;
export const modalMaxHeight = window.innerHeight - (Math.max(elementStyles.maxTopicCarouselHeightPx, vhToPixels(elementStyles.topicCarouselHeightVh)) + vhToPixels(10));
export const modalMaxWidth = 800;

ReactDOM.render(
  <CookiesProvider >
    <Router >
      <Switch>
        <Route exact path={["/", "/:topicTitle", "/:topicTitle/:username"]} component={AppShellComponent} />
      </Switch>
    </Router>
    <div id="login-portal"></div>
    <div id="portal"></div>
  </CookiesProvider>,
  document.getElementById('root')
);

export const Portal = ({children} : {children: ReactNode}) => ReactDOM.createPortal(children, document.getElementById("portal") || document.createElement("portal"));
