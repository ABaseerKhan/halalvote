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

export const elementStyles = {
  toolbarHeightVh: 11,
  maxToolbarHeightPx: 50,
  topicCarouselHeightVh: 15,
  maxTopicCarouselHeightPx: 135
}

export const modalHeightVh = 70;
export const modalWidthVw = (isMobile: boolean): number => isMobile ? 90 : 40;
export const modalMaxWidth = 800;

export const Portal = ({children} : {children: ReactNode}) => ReactDOM.createPortal(children, document.getElementById("portal") || document.createElement("portal"));
export const FullScreenPortal = ({children} : {children: ReactNode}) => ReactDOM.createPortal(children, document.getElementById("full-screen-portal") || document.createElement("full-screen-portal"));

ReactDOM.render(
  <CookiesProvider >
    <Router >
      <Switch>
        <Route component={AppShellComponent} />
      </Switch>
    </Router>
    <div id="login-portal"></div>
    <div id="portal"></div>
  </CookiesProvider>,
  document.getElementById('root')
);
