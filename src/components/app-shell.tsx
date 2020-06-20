import React, { useState, useEffect } from 'react';
import { MenuComponent } from './menu/menu';
import { LoginComponent } from './login/login';
import { ItemCarouselComponent } from './item-carousel/item-carousel';
import { CommentsCardComponent } from './comments/comments-card';
import { Item } from '../types';
import { postData } from '../https-client/post-data';
import { itemsConfig } from '../https-client/config';
import Cookies from 'universal-cookie';

// type imports
import { Judgment } from '../types';

// style imports
import './app-shell.css';

export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<{ userDetails: any; items: Item[]; itemIndex: number; loginDisplayed: boolean }>({
    userDetails: {
        username: cookies.get('username'),
        sessiontoken: cookies.get('sessiontoken'),
    },
    items: [],
    itemIndex: 0,
    loginDisplayed: false,
  });

  useEffect(() => {
    const fetchData = async () => {
        const data = await postData({ baseUrl: itemsConfig.url, path: 'get-items', data: { }, additionalHeaders: { },});
        setState(s => ({ ...s, items: data }));
    };
    fetchData();
  }, [])

  const iterateItem = (iteration: number) => () => {
    if ((state.itemIndex + iteration) < state.items.length && (state.itemIndex + iteration) >= 0) {
        setState({  ...state, itemIndex: state.itemIndex + iteration });
    } else {
        return undefined;
    }
  };

  const setUserDetails = (username: string, sessiontoken: string) => {
    cookies.set('username', username);
    cookies.set('sessiontoken', sessiontoken);
    setState({ ...state, userDetails: { username: username, sessiontoken: sessiontoken }, loginDisplayed: false });
  }

  const displayLogin = (loginDisplayed: boolean) => {
    setState({ ...state, loginDisplayed: loginDisplayed });
  }

  const item = state.items.length > 0 ? state.items[state.itemIndex] : undefined;

  return (
    <UserContext.Provider value={state.userDetails}>
        <div className="app-shell">
          <div className="body">
                  <ItemCarouselComponent iterateItem={iterateItem} itemName={item?.itemName} />
                  <CommentsCardComponent judgment={Judgment.HARAM} item={item} />
                  <CommentsCardComponent judgment={Judgment.HALAL} item={item} />
          </div>
          <MenuComponent displayLogin={displayLogin} setUserDetails={setUserDetails} />
          {
            state.loginDisplayed && <LoginComponent displayLogin={displayLogin} setUserDetails={setUserDetails} />
          }
        </div>
    </UserContext.Provider>
  )
}

const cookies = new Cookies();

export const UserContext = React.createContext({
    username: cookies.get('username'),
    sessiontoken: cookies.get('sessiontoken'),
});