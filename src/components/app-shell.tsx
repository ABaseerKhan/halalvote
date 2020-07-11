import React, { useState, useEffect } from 'react';
import { MenuComponent } from './menu/menu';
import { LoginComponent } from './login/login';
import { ItemCarouselComponent } from './item-carousel/item-carousel';
import { CommentsCardComponent } from './comments/comments-card';
import { Item } from '../types';
import { postData } from '../https-client/post-data';
import { itemsConfig } from '../https-client/config';
import Cookies from 'universal-cookie';
import { vhToPixels, vhToPixelsWithMax } from "../utils";

// type imports
import { Judgment } from '../types';

// style imports
import { elementStyles } from "../index";
import './app-shell.css';
import { ItemVotesComponent } from './item-votes/item-votes';
import { SearchComponent } from './search/search';

export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<{ userDetails: any; items: Item[]; itemIndex: number; loginDisplayed: boolean; scrollPosition: number }>({
    userDetails: {
      username: cookies.get('username'),
      sessiontoken: cookies.get('sessiontoken'),
    },
    items: [],
    itemIndex: 0,
    loginDisplayed: false,
    scrollPosition: window.innerHeight,
  });

  useEffect(() => {
    fetchItems();
    setTimeout(() => {
      document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
    }, 500)
  }, [state.userDetails])

  const fetchItems = async (itemsTofetch?: string[]) => {
    let body: any = { "itemNames": itemsTofetch };
    let additionalHeaders = {};

    if (state.userDetails.username && state.userDetails.sessiontoken && state.userDetails.username != "") {
      body = { ...body, "username": state.userDetails.username };
      additionalHeaders = { ...additionalHeaders, "sessiontoken": state.userDetails.sessiontoken };
    }

    const { data } = await postData({ baseUrl: itemsConfig.url, path: 'get-items', data: body, additionalHeaders: additionalHeaders, });

    for (let i = 0; i < state.items.length; i++) {
      for (let j = data.length - 1; j >= 0; j--) {
        if (state.items[i].itemName === data[j].itemName) {
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
      setState({ ...state, itemIndex: state.itemIndex + iteration });
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

  const appShellId = "app-shell";
  const searchId = "search";
  const menuId = "menu";
  const itemCarouselId = "itemCarousel";
  const descriptionId = "description";
  const commentsTableId = "commentsTable";
  const commentsCardZeroId = "comments-card-0";
  const commentsCardOneId = "comments-card-1";
  const analyticsId = "analytics";

  const appShell = document.getElementById(appShellId);
  const menu = document.getElementById(menuId);
  const search = document.getElementById(searchId);
  const itemCarousel = document.getElementById(itemCarouselId);
  const description = document.getElementById(descriptionId);
  const commentsTable = document.getElementById(commentsTableId);
  const commentsCardZero = document.getElementById(commentsCardZeroId);
  const commentsCardOne = document.getElementById(commentsCardOneId);
  const analytics = document.getElementById(analyticsId);

  if (appShell && itemCarousel) {
    appShell.onscroll = function (event: any) {
      const { toolbarHeightVh } = elementStyles;
      const toolbarHeightPx = vhToPixelsWithMax(toolbarHeightVh);
      const halfWindowHeight = window.innerHeight / 2.0;
  
      if (appShell.scrollTop > halfWindowHeight) {
        itemCarousel.style.visibility = "visible";
        itemCarousel.style.opacity = "1.0";
      } else if (appShell.scrollTop > toolbarHeightPx) {
        itemCarousel.style.visibility = "visible";
        itemCarousel.style.opacity = ((appShell.scrollTop - toolbarHeightPx)/(halfWindowHeight - toolbarHeightPx)).toString();
      } else {
        itemCarousel.style.opacity = "0.0";
        itemCarousel.style.visibility = "hidden";
      }
    }
  }

  if (appShell && menu && itemCarousel && search && commentsTable && commentsCardZero && commentsCardOne && description && analytics) {
    window.onwheel = function (event: any) {
      const { toolbarHeightVh, commentsCardHeightVh } = elementStyles;
      const toolbarHeightPx = vhToPixelsWithMax(toolbarHeightVh);
      const commentsCardHeightPx = vhToPixels(commentsCardHeightVh);
      const canMove = canMoveMenu(event);

      if (canMove) {
        if (menu.style.top) {
          if (event.deltaY < 0) {
            // scrolling up

            // fixed tops
            menu.style.top = Math.min(parseInt(menu.style.top) - event.deltaY, 0) + "px";
            itemCarousel.style.top = Math.min(parseInt(itemCarousel.style.top) - event.deltaY, toolbarHeightPx) + "px";
            
            // top paddings
            search.style.paddingTop = Math.min(parseInt(search.style.paddingTop) - event.deltaY, toolbarHeightPx) + "px";
            commentsTable.style.paddingTop = Math.min(parseInt(commentsTable.style.paddingTop) - event.deltaY, toolbarHeightPx * 2) + "px";
            description.style.paddingTop = commentsTable.style.paddingTop
            analytics.style.paddingTop = commentsTable.style.paddingTop
            
            // bottom paddings
            search.style.paddingBottom = toolbarHeightPx - parseInt(search.style.paddingTop) + "px";
            commentsTable.style.paddingBottom = (toolbarHeightPx * 2) - parseInt(commentsTable.style.paddingTop) + "px";
            description.style.paddingBottom = commentsTable.style.paddingBottom
            analytics.style.paddingBottom = commentsTable.style.paddingBottom

          } else if (event.deltaY > 0) {
            // scrolling down

            // fixed tops
            menu.style.top = Math.max(parseInt(menu.style.top) - event.deltaY, - toolbarHeightPx) + "px";
            itemCarousel.style.top = Math.max(parseInt(itemCarousel.style.top) - event.deltaY, 0) + "px";
            
            // top paddings
            search.style.paddingTop = Math.max(parseInt(search.style.paddingTop) - event.deltaY, 0) + "px";
            commentsTable.style.paddingTop = Math.max(parseInt(commentsTable.style.paddingTop) - event.deltaY, toolbarHeightPx) + "px";
            description.style.paddingTop = commentsTable.style.paddingTop
            analytics.style.paddingTop = commentsTable.style.paddingTop

            // bottom paddings
            search.style.paddingBottom = toolbarHeightPx - parseInt(search.style.paddingTop) + "px";
            commentsTable.style.paddingBottom = (toolbarHeightPx * 2) - parseInt(commentsTable.style.paddingTop) + "px";
            description.style.paddingBottom = commentsTable.style.paddingBottom
            analytics.style.paddingBottom = commentsTable.style.paddingBottom
          }

          // comment card heights
          const calculatedCommentsCardHeight = `${commentsCardHeightPx - parseInt(commentsTable.style.paddingTop) + (toolbarHeightPx * 2)}px`
          commentsCardZero.style.height = calculatedCommentsCardHeight;
          commentsCardOne.style.height = calculatedCommentsCardHeight;

        } else {
          // fixed tops
          menu.style.top = "0px";
          itemCarousel.style.top = toolbarHeightPx + "px";

          // top paddings
          search.style.paddingTop = toolbarHeightPx + "px";
          commentsTable.style.paddingTop = (toolbarHeightPx * 2) + "px";
          description.style.paddingTop = commentsTable.style.paddingTop;
          analytics.style.paddingTop = commentsTable.style.paddingTop;

          // bottom paddings
          search.style.paddingBottom = "0px";
          commentsTable.style.paddingBottom = "0px";
          description.style.paddingBottom = "0px";
          analytics.style.paddingBottom = "0px";

          // comment card heights
          commentsCardZero.style.height = commentsCardHeightPx + "px";
          commentsCardOne.style.height = commentsCardHeightPx + "px";
        }
      }
    }
  }

  const canMoveMenu = (scrollEvent: any): Boolean => {
    let path = scrollEvent.path;
    for (let index in path) {
      let element = path[index];

      if (element.className === "comments-container") {
        return (element.scrollTop === 0 && scrollEvent.deltaY < 0) ||
          (element.scrollTop === (element.scrollHeight - element.offsetHeight) && scrollEvent.deltaY > 0);
      }
    }

    return true;
  }

  return (
    <UserContext.Provider value={state.userDetails}>
      <div id={appShellId} className={appShellId} >
        <SearchComponent id={searchId} />
        <table id={commentsTableId} className="comments-table">
          <tbody>
            <tr className="comments-table-empty-row"/>
            <tr>
              <td className="comments-table-column vote-column">
                <ItemVotesComponent judgment={Judgment.HARAM} itemName={itemName} userVote={item?.vote} halalVotes={halalVotes} haramVotes={haramVotes} addItemVoteLocally={addItemVoteLocally} />
              </td>
              <td className="comments-table-column vote-column">
                <ItemVotesComponent judgment={Judgment.HALAL} itemName={itemName} userVote={item?.vote} halalVotes={halalVotes} haramVotes={haramVotes} addItemVoteLocally={addItemVoteLocally} />
              </td>
            </tr>
            <tr className="comments-table-empty-row"/>
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