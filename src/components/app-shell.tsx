import React, { useState, useEffect } from 'react';
import { PageScrollerComponent } from './page-scroller/page-scroller';
import { MenuComponent } from './menu/menu';
import { ItemCarouselComponent } from './item-carousel/item-carousel';
import { SearchComponent } from './search/search';
import { CommentsComponent } from './comments/comments';
import { DescriptionComponent } from './description/description';
import { AnalyticsComponent } from './analytics/analytics';
import { AddItemButtonComponent } from './add-item/add-item-button';
import { Item, ModalType } from '../types';
import { postData } from '../https-client/post-data';
import { itemsConfig } from '../https-client/config';
import Cookies from 'universal-cookie';
import { vhToPixelsWithMax, arrayMove } from "../utils";
import { ModalComponent } from './modal/modal';
import { elementStyles } from "../index";

// type imports

// style imports
import './app-shell.css';


export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<{ userDetails: any; items: Item[]; itemIndex: number; modalDisplayed: ModalType; scrollPosition: number }>({
    userDetails: {
      username: cookies.get('username'),
      sessiontoken: cookies.get('sessiontoken'),
    },
    items: [],
    itemIndex: 0,
    modalDisplayed: ModalType.NONE,
    scrollPosition: window.innerHeight,
  });

  useEffect(() => {
    fetchItems(cookies.get('itemName') || undefined);
    setTimeout(() => {
      document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
    }, 500) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userDetails])

  const fetchItems = async (itemTofetch?: string) => {
    let body: any = { "itemNames": itemTofetch ? [itemTofetch] : undefined, "n": 3 };
    let additionalHeaders = {};

    if (state.userDetails.username && state.userDetails.sessiontoken && state.userDetails.username !== "") {
      body = { ...body, "username": state.userDetails.username };
      additionalHeaders = { ...additionalHeaders, "sessiontoken": state.userDetails.sessiontoken };
    }

    const { data }: { data: Item[] } = await postData({ baseUrl: itemsConfig.url, path: 'get-items', data: body, additionalHeaders: additionalHeaders, });

    if(itemTofetch) {
      const indexOfItemToFetch = state.items.findIndex(i => i.itemName === itemTofetch);
      if (indexOfItemToFetch >= 0) {
        state.itemIndex = arrayMove(state.items, indexOfItemToFetch, state.itemIndex); // move item to current index if needed (for search)
        state.items[state.itemIndex] = data[0]; // refresh item with new data from db
        setState(s => ({ ...s, items: state.items })); // trigger re-render
      } else {
        setState(s => ({ ...s, items: [...s.items.slice(0, s.itemIndex+1), ...data, ...s.items.slice(s.itemIndex+1)], itemIndex: s.items.length ? s.itemIndex+1 : 0 }));
      }
    } else {
      setState(s => ({ ...s, items: [...s.items, ...data] }));
    }
    if (data && data.length) cookies.set('itemName', data[0].itemName);
  }

  const iterateItem = (iteration: number) => () => {
    if ((state.itemIndex + iteration) < state.items.length && (state.itemIndex + iteration) >= 0) {
      setState({ ...state, itemIndex: state.itemIndex + iteration });
      cookies.set("itemName", state.items[state.itemIndex + iteration].itemName);
    } else {
      return undefined;
    }
  };

  const setUserDetails = (username: string, sessiontoken: string) => {
    cookies.set('username', username);
    cookies.set('sessiontoken', sessiontoken);
    setState({ ...state, userDetails: { username: username, sessiontoken: sessiontoken }, modalDisplayed: ModalType.NONE });
  }

  const displayModal = (modalDisplayed: ModalType) => {
    setState({ ...state, modalDisplayed: modalDisplayed });
  }

  const addItemVoteLocally = (itemName: string, itemVote: number) => {
    for (let x in state.items) {
      const item = state.items[x];

      if (item.itemName === itemName) {
        if (itemVote !== item.vote) {
          state.items[x] = {
            ...item,
            vote: itemVote,
            halalVotes: itemVote === 0 ? item.halalVotes + 1 : (item.vote === 0 ? item.halalVotes - 1 : item.halalVotes),
            haramVotes: itemVote === 1 ? item.haramVotes + 1 : (item.vote === 1 ? item.haramVotes - 1 : item.haramVotes)
          }
        } else if (item.vote !== undefined) {
          state.items[x] = {
            ...item,
            vote: undefined,
            halalVotes: itemVote === 0 ? item.halalVotes - 1 : item.halalVotes,
            haramVotes: itemVote === 1 ? item.haramVotes - 1 : item.haramVotes
          }
        }
      }

      setState({ ...state, items: state.items });
    }
  }

  const item = state.items.length > 0 ? state.items[state.itemIndex] : undefined;
  const itemName = item?.itemName !== undefined ? item.itemName : "";
  const halalVotes = item?.halalVotes !== undefined ? item.halalVotes : 0;
  const haramVotes = item?.haramVotes !== undefined ? item.haramVotes : 0;
  const numHalalComments = item?.numHalalComments !== undefined ? item.numHalalComments : 0;
  const numHaramComments = item?.numHaramComments !== undefined ? item.numHaramComments : 0;

  const appShellId = "app-shell";
  const menuId = "menu";
  const itemCarouselId = "itemCarousel";
  const pageZeroId = "pageZero";
  const pageOneId = "pageOne";
  const pageTwoId = "pageTwo";
  const pageThreeId = "pageThree";

  const searchId = "search";
  const commentsId = "comments";
  const descriptionId = "description";
  const analyticsId = "analytics";

  const appShell = document.getElementById(appShellId);
  const menu = document.getElementById(menuId);
  const itemCarousel = document.getElementById(itemCarouselId);
  const pageZero = document.getElementById(pageZeroId);
  const pageOne = document.getElementById(pageOneId);
  const pageTwo = document.getElementById(pageTwoId);
  const pageThree = document.getElementById(pageThreeId);

  const search = document.getElementById(searchId);
  const comments = document.getElementById(commentsId);
  const description = document.getElementById(descriptionId);
  const analytics = document.getElementById(analyticsId);

  if (appShell && itemCarousel) {
    appShell.onscroll = () => {
      const { itemCarouselHeightVh, maxItemCarouselHeightPx } = elementStyles;
      const itemCarouselHeightPx = vhToPixelsWithMax(itemCarouselHeightVh, maxItemCarouselHeightPx);
      const halfWindowHeight = window.innerHeight / 2.0;
  
      if (appShell.scrollTop > halfWindowHeight) {
        itemCarousel.style.visibility = "visible";
        itemCarousel.style.opacity = "1.0";
      } else if (appShell.scrollTop > itemCarouselHeightPx) {
        itemCarousel.style.visibility = "visible";
        itemCarousel.style.opacity = ((appShell.scrollTop - itemCarouselHeightPx)/(halfWindowHeight - itemCarouselHeightPx)).toString();
      } else {
        itemCarousel.style.opacity = "0.0";
        itemCarousel.style.visibility = "hidden";
      }


      if (appShell.scrollTop % window.innerHeight === 0) {
        const page = Math.floor(appShell.scrollTop / window.innerHeight);
        selectPageScrollerButton(page);
      }
    }
  }

  if (appShell && menu && itemCarousel && search && comments && description && analytics) {
    window.onwheel = (event: any) => {
      const { toolbarHeightVh, maxToolbarHeightPx, itemCarouselHeightVh, maxItemCarouselHeightPx } = elementStyles;
      const toolbarHeightPx = vhToPixelsWithMax(toolbarHeightVh, maxToolbarHeightPx);
      const itemCarouselHeightPx = vhToPixelsWithMax(itemCarouselHeightVh, maxItemCarouselHeightPx);
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
            comments.style.paddingTop = Math.min(parseInt(comments.style.paddingTop) - event.deltaY, toolbarHeightPx + itemCarouselHeightPx) + "px";
            description.style.paddingTop = comments.style.paddingTop
            analytics.style.paddingTop = comments.style.paddingTop
            
            // bottom paddings
            search.style.paddingBottom = toolbarHeightPx - parseInt(search.style.paddingTop) + "px";
            description.style.paddingBottom = (toolbarHeightPx + itemCarouselHeightPx) - parseInt(description.style.paddingTop) + "px"
            analytics.style.paddingBottom = description.style.paddingBottom

          } else if (event.deltaY > 0) {
            // scrolling down

            // fixed tops
            menu.style.top = Math.max(parseInt(menu.style.top) - event.deltaY, - toolbarHeightPx) + "px";
            itemCarousel.style.top = Math.max(parseInt(itemCarousel.style.top) - event.deltaY, 0) + "px";
            
            // top paddings
            search.style.paddingTop = Math.max(parseInt(search.style.paddingTop) - event.deltaY, 0) + "px";
            comments.style.paddingTop = Math.max(parseInt(comments.style.paddingTop) - event.deltaY, itemCarouselHeightPx) + "px";
            description.style.paddingTop = comments.style.paddingTop
            analytics.style.paddingTop = comments.style.paddingTop

            // bottom paddings
            search.style.paddingBottom = toolbarHeightPx - parseInt(search.style.paddingTop) + "px";
            description.style.paddingBottom = (toolbarHeightPx + itemCarouselHeightPx) - parseInt(description.style.paddingTop) + "px";
            analytics.style.paddingBottom = description.style.paddingBottom
          }
        } else {
          // fixed tops
          menu.style.top = "0px";
          itemCarousel.style.top = toolbarHeightPx + "px";

          // top paddings
          search.style.paddingTop = toolbarHeightPx + "px";
          comments.style.paddingTop = (toolbarHeightPx + itemCarouselHeightPx) + "px";
          description.style.paddingTop = comments.style.paddingTop;
          analytics.style.paddingTop = comments.style.paddingTop;

          // bottom paddings
          search.style.paddingBottom = "0px";
          description.style.paddingBottom = "0px";
          analytics.style.paddingBottom = "0px";
        }

        // comments height
        comments.style.height = `calc(100% - ${parseInt(comments.style.paddingTop)}px)`;
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

  const scrollToPage = (page: number) => {
    if (appShell) {
      appShell.scrollTop = page * window.innerHeight;
      selectPageScrollerButton(page);
    }
  }

  const selectPageScrollerButton = (page: number) => {
    if (pageZero && pageOne && pageTwo && pageThree) {
      pageZero.className = page === 0 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageOne.className = page === 1 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageTwo.className = page === 2 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageThree.className = page === 3 ? 'page-scroller-button-selected' : 'page-scroller-button'
    }
  }

  return (
    <UserContext.Provider value={state.userDetails}>
      <div id={appShellId} className={appShellId} >
        <SearchComponent id={searchId} onSuggestionClick={fetchItems} />
        <CommentsComponent id={commentsId} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={fetchItems} />
        <DescriptionComponent id={descriptionId} />
        <AnalyticsComponent id={analyticsId} />
        <div className="fixed-content">
          <MenuComponent menuId={menuId} displayModal={displayModal} setUserDetails={setUserDetails} />
          <ItemCarouselComponent id={itemCarouselId} iterateItem={iterateItem} itemName={itemName} userVote={item?.vote} halalVotes={halalVotes} haramVotes={haramVotes} addItemVoteLocally={addItemVoteLocally} />
          <PageScrollerComponent pageZeroId={pageZeroId} pageOneId={pageOneId} pageTwoId={pageTwoId} pageThreeId={pageThreeId} scrollToPage={scrollToPage} />
          <AddItemButtonComponent displayModal={displayModal}/>
          {
            state.modalDisplayed !== ModalType.NONE && <ModalComponent modalType={state.modalDisplayed} displayModal={displayModal} setUserDetails={setUserDetails} fetchItems={fetchItems} />
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