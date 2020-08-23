import React, { useState, useEffect } from 'react';
import { PageScrollerComponent } from './page-scroller/page-scroller';
import { ItemCarouselComponent } from './item-carousel/item-carousel';
import { SearchComponent } from './search/search';
import { CommentsComponent } from './comments/comments';
import { AnalyticsComponent } from './analytics/analytics';
import { MenuComponent } from './menu/menu';
import { Item } from '../types';
import { postData } from '../https-client/client';
import { itemsConfig } from '../https-client/config';
import { vhToPixelsWithMax, arrayMove } from "../utils";
import { elementStyles } from "../index";
import { useCookies } from 'react-cookie';

// type imports

// style imports
import './app-shell.css';

export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<{ items: Item[]; itemIndex: number; scrollPosition: number }>({
    items: [],
    itemIndex: 0,
    scrollPosition: window.innerHeight,
  });

  const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken', 'itemName']);
  const { username, sessiontoken } = cookies;

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
    }, 500) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchItems(cookies.itemName || undefined);
  }, [sessiontoken]);

  const fetchItems = async (itemTofetch?: string) => {
    let body: any = { 
      "itemNames": itemTofetch ? [itemTofetch] : undefined, 
      "n": 3,
      "excludedItems": state.items && state.items.length && !itemTofetch ? state.items.map((item) => item.itemName) : undefined,
    };
    let additionalHeaders = {};

    if (username && sessiontoken && username !== "") {
      body = { ...body, "username": username };
      additionalHeaders = { ...additionalHeaders, "sessiontoken": sessiontoken };
    }

    const { data }: { status: number, data: Item[] } = await postData({ baseUrl: itemsConfig.url, path: 'get-items', data: body, additionalHeaders: additionalHeaders, });

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
    if (data && data.length) setCookie('itemName', data[0].itemName);
    else {
      removeCookie("itemName");
    }
  }

  const iterateItem = (iteration: number) => () => {
    if ((state.itemIndex + iteration) < state.items.length && (state.itemIndex + iteration) >= 0) {
      setState({ ...state, itemIndex: state.itemIndex + iteration });
      setCookie("itemName", state.items[state.itemIndex + iteration].itemName);
    } else if ((state.itemIndex + iteration) === state.items.length) {
      fetchItems();
      setState({ ...state, itemIndex: state.itemIndex + iteration });
    }
  };

  const item = state.items.length > 0 ? state.items[state.itemIndex] : undefined;
  const itemName = item?.itemName !== undefined ? item.itemName : "";
  const halalPoints = item?.halalPoints !== undefined ? item.halalPoints : 0;
  const haramPoints = item?.haramPoints !== undefined ? item.haramPoints : 0;
  const numItemVotes = item?.numVotes !== undefined ? item.numVotes : 0;
  const numHalalComments = item?.numHalalComments !== undefined ? item.numHalalComments : 0;
  const numHaramComments = item?.numHaramComments !== undefined ? item.numHaramComments : 0;

  const appShellId = "app-shell";
  const itemCarouselId = "itemCarousel";
  const pageZeroId = "Search";
  const pageOneId = "Comments";
  const pageTwoId = "Analytics";

  const searchId = "search";
  const commentsId = "comments";
  const analyticsId = "analytics";

  const appShell = document.getElementById(appShellId);
  const itemCarousel = document.getElementById(itemCarouselId);
  const pageZero = document.getElementById(pageZeroId);
  const pageOne = document.getElementById(pageOneId);
  const pageTwo = document.getElementById(pageTwoId);

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

      const scrollRatio = parseFloat((appShell.scrollTop / window.innerHeight).toFixed(1));

      if (scrollRatio === 0 || scrollRatio === 0.4) {
        selectPageScrollerButton(0);
      } else if (scrollRatio === 0.6 || scrollRatio === 1 || scrollRatio === 1.4) {
        selectPageScrollerButton(1);
      } else if (scrollRatio === 1.6 || scrollRatio === 2 || scrollRatio === 2.4) {
        selectPageScrollerButton(2);
      }
    }
  }

  const scrollToPage = (page: number) => {
    if (appShell) {
      appShell.scrollTo({left: 0, top: page * window.innerHeight, behavior:'smooth'});
    }
  }

  const selectPageScrollerButton = (page: number) => {
    if (pageZero && pageOne && pageTwo) {
      pageZero.className = page === 0 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageOne.className = page === 1 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageTwo.className = page === 2 ? 'page-scroller-button-selected' : 'page-scroller-button'
    }
  }

  return (
      <div id={appShellId} className={appShellId} >
        <SearchComponent id={searchId} onSuggestionClick={fetchItems} />
        <CommentsComponent id={commentsId} itemName={itemName} numHalalComments={numHalalComments} numHaramComments={numHaramComments} refreshItem={fetchItems} />
        <AnalyticsComponent id={analyticsId} />
        <div className="fixed-content">
          <ItemCarouselComponent id={itemCarouselId} iterateItem={iterateItem} itemName={itemName} userVote={item?.vote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numItemVotes} />
          <PageScrollerComponent pageZeroId={pageZeroId} pageOneId={pageOneId} pageTwoId={pageTwoId} scrollToPage={scrollToPage} />
          <MenuComponent fetchItems={fetchItems}/>
        </div>
      </div>
  )
}