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
import { ItemVotesComponent } from './item-votes/item-votes';

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
    fetchItems();
  }, [state.userDetails])

  const fetchItems = async (itemsTofetch?: string[]) => {
    let body: any = { "itemNames": itemsTofetch };
    let additionalHeaders = {};

    if (state.userDetails.username && state.userDetails.sessiontoken && state.userDetails.username != "") {
      body = { ...body, "username": state.userDetails.username };
      additionalHeaders = { ...additionalHeaders, "sessiontoken": state.userDetails.sessiontoken };
    }

    const { data } = await postData({ baseUrl: itemsConfig.url, path: 'get-items', data: body, additionalHeaders: additionalHeaders,});

    for(let i = 0; i < state.items.length; i++) {
      for(let j = data.length - 1; j >= 0; j--) {
          if(state.items[i].itemName === data[j].itemName) {
              state.items.splice(i, 1, data[j]);
              data.splice(j, 1);
              break;
          }
      }
    }
    setState(s => ({ ...s, items: [...s.items, ...data] }));
  }

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

  const addItemVoteLocally = (itemName: string, itemVote: number) => {
    for (let x in state.items) {
      const item = state.items[x];

      if (item.itemName == itemName) {
        if (itemVote != item.vote) {
          state.items[x] = {
            ...item,
            vote: itemVote,
            halalVotes: itemVote == 0 ? item.halalVotes + 1 : (item.vote == 0 ? item.halalVotes - 1 : item.halalVotes),
            haramVotes: itemVote == 1 ? item.haramVotes + 1 : (item.vote == 1 ? item.haramVotes - 1 : item.haramVotes)
          }
        } else if (item.vote != undefined) {
          state.items[x] = {
            ...item,
            vote: undefined,
            halalVotes: itemVote == 0 ? item.halalVotes - 1 : item.halalVotes,
            haramVotes: itemVote == 1 ? item.haramVotes - 1 : item.haramVotes
          }
        }
      }

      setState({ ...state, items: state.items });
    }
  }

  const item = state.items.length > 0 ? state.items[state.itemIndex] : undefined;
  const itemName = item?.itemName != undefined ? item.itemName : "";
  const halalVotes = item?.halalVotes != undefined ? item.halalVotes : 0;
  const haramVotes = item?.haramVotes != undefined ? item.haramVotes : 0;
  const numHalalComments = item?.numHalalComments != undefined ? item.numHalalComments : 0;
  const numHaramComments = item?.numHaramComments != undefined ? item.numHaramComments : 0;

  const menuId = "menu";
  const itemCarouselId = "itemCarousel";
  const descriptionId = "description";
  const commentsTableId = "commentsTableId";
  const analyticsId = "analytics";

  window.onwheel = function(event: any) {
    let menu = document.getElementById(menuId);
    let itemCarousel = document.getElementById(itemCarouselId);
    let description = document.getElementById(descriptionId);
    let commentsTable = document.getElementById(commentsTableId);
    let analytics = document.getElementById(analyticsId);

    if (menu && itemCarousel && description && commentsTable && analytics) {
      if (event.deltaY < 0) {
        if (menu.style.top) {
          menu.style.top = Math.min(parseInt(menu.style.top) - event.deltaY, 0) + "px";
          itemCarousel.style.top = Math.min(parseInt(itemCarousel.style.top) - event.deltaY, 60) + "px";
          description.style.paddingTop = Math.min(parseInt(description.style.paddingTop) - event.deltaY, 120) + "px";
          commentsTable.style.paddingTop = Math.min(parseInt(commentsTable.style.paddingTop) - event.deltaY, 120) + "px";
          analytics.style.paddingTop = Math.min(parseInt(analytics.style.paddingTop) - event.deltaY, 120) + "px";

          description.style.paddingBottom = 120 - parseInt(description.style.paddingTop) + "px";
          commentsTable.style.paddingBottom = 120 - parseInt(commentsTable.style.paddingTop) + "px";
          analytics.style.paddingBottom = 120 - parseInt(analytics.style.paddingTop) + "px";
        } else {
          menu.style.top = "0px";
          itemCarousel.style.top = "60px";
          description.style.paddingTop = "120px";
          commentsTable.style.paddingTop = "120px";
          analytics.style.paddingTop = "120px";
          description.style.paddingBottom = "0px";
          commentsTable.style.paddingBottom = "0px";
          analytics.style.paddingBottom = "0px";
        }
      } else if (event.deltaY > 0) {
        if (menu.style.top) {
          menu.style.top = Math.max(parseInt(menu.style.top) - event.deltaY, -60) + "px";
          itemCarousel.style.top = Math.max(parseInt(itemCarousel.style.top) - event.deltaY, 0) + "px";
          description.style.paddingTop = Math.max(parseInt(description.style.paddingTop) - event.deltaY, 60) + "px";
          commentsTable.style.paddingTop = Math.max(parseInt(commentsTable.style.paddingTop) - event.deltaY, 60) + "px";
          analytics.style.paddingTop = Math.max(parseInt(analytics.style.paddingTop) - event.deltaY, 60) + "px";

          description.style.paddingBottom = 120 - parseInt(description.style.paddingTop) + "px";
          commentsTable.style.paddingBottom = 120 - parseInt(commentsTable.style.paddingTop) + "px";
          analytics.style.paddingBottom = 120 - parseInt(analytics.style.paddingTop) + "px";
        } else {
          menu.style.top = "-60px";
          itemCarousel.style.top = "0px";
          description.style.paddingTop = "60px";
          commentsTable.style.paddingTop = "60px";
          analytics.style.paddingTop = "60px";
          description.style.paddingBottom = "60px";
          commentsTable.style.paddingBottom = "60px";
          analytics.style.paddingBottom = "60px";
        }
      }
    }
  }

  return (
    <UserContext.Provider value={state.userDetails}>
      <div className="app-shell">
        <table id={commentsTableId} className="comments-table">
          <tbody>
            <tr>
              <td className="comments-table-column">
                <ItemVotesComponent judgment={Judgment.HARAM} itemName={itemName} vote={item?.vote} halalVotes={halalVotes} haramVotes={haramVotes} addItemVoteLocally={addItemVoteLocally} />
              </td>
              <td className="comments-table-column">
                <ItemVotesComponent judgment={Judgment.HALAL} itemName={itemName} vote={item?.vote} halalVotes={halalVotes} haramVotes={haramVotes} addItemVoteLocally={addItemVoteLocally} />
              </td>
            </tr>
            <tr>
              <td className="comments-table-column">
                <CommentsCardComponent judgment={Judgment.HARAM} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={fetchItems} />
              </td>
              <td className="comments-table-column">
                <CommentsCardComponent judgment={Judgment.HALAL} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={fetchItems} />
              </td>
            </tr>
          </tbody>
        </table>
        <div id={descriptionId} className="other-page">Description</div>
        <div id={analyticsId} className="other-page">Analytics</div>
        <div className="header">
          <MenuComponent id={menuId} displayLogin={displayLogin} setUserDetails={setUserDetails} />
          <ItemCarouselComponent id={itemCarouselId} iterateItem={iterateItem} itemName={item?.itemName} />
          {
            state.loginDisplayed && <LoginComponent displayLogin={displayLogin} setUserDetails={setUserDetails} />
          }
        </div>
      </div>
    </UserContext.Provider>
  )
}

const cookies = new Cookies();

export const UserContext = React.createContext({
    username: cookies.get('username'),
    sessiontoken: cookies.get('sessiontoken'),
});