import React, { useState, useEffect, useCallback } from 'react';
import { PageScrollerComponent } from './page-scroller/page-scroller';
import { TopicCarouselComponent, TopicCarouselComponentFS } from './topic-carousel/topic-carousel';
import { SearchComponent } from './search/search';
import { AnalyticsCardComponent } from './analytics-card/analytics-card';
import { MenuComponent } from './menu/menu';
import { Topic, Comment, TopicImages } from '../types';
import { postData } from '../https-client/client';
import { topicsConfig } from '../https-client/config';
import { arrayMove } from "../utils";
import { useCookies } from 'react-cookie';
import { CardsShellComponent } from './cards-shell/cards-shell';
import { CommentsCardComponent } from './comments/comments-card';
import {
  useParams,
  generatePath
} from "react-router-dom";

// type imports

// style imports
import './app-shell.css';
import { TopicImagesComponent } from './topic-images/topic-images';
import { FullScreenComponent } from './full-screen/full-screen';

enum IncomingDirection {
  LEFT,
  RIGHT,
  NONE
}

const maxTopicsDataCacheSize = 3;

const appShellId = "app-shell";
const topicContentId = "topic-content";
const topicCarouselId = "topicCarousel";
const pageZeroId = "Search";
const pageOneId = "Topics";
const cardsShellContainerId = "cards-shell-container";

const getAppShell = () => { return document.getElementById(appShellId); }
const getTopicCarousel = () => { return document.getElementById(topicCarouselId); }
const getPageZero = () => { return document.getElementById(pageZeroId); }
const getPageOne = () => { return document.getElementById(pageOneId); }
const getCardsShellContainer = () => { return document.getElementById(cardsShellContainerId); }

type AppShellState = { 
  topicDetails: {topics: Topic[]; topicIndex: number}; 
  topicImages: TopicImagesState,
  comments: CommentsState,
  scrollPosition: number, 
  specificComment?: Comment, 
  incomingDirection: IncomingDirection, 
  fullScreenMode: boolean 
};
export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<AppShellState>({
    topicDetails: {
      topics: [],
      topicIndex: 0
    },
    topicImages: { },
    comments: { },
    scrollPosition: window.innerHeight,
    specificComment: undefined,
    incomingDirection: IncomingDirection.NONE,
    fullScreenMode: false,
  });

  let { topicTitle } = useParams();
  topicTitle = topicTitle?.replace(/_/g, ' ').replace(/%2F/g, '/');
  const [cookies] = useCookies(['username', 'sessiontoken']);
  const { username, sessiontoken } = cookies;

  useEffect(() => {
    setTimeout(() => {
      const appShell = getAppShell();
      const cardsShellContainer = getCardsShellContainer();
      
      if (appShell && cardsShellContainer) {
        appShell.scrollTo(0, window.innerHeight);
        cardsShellContainer.style.opacity = "1.0";
      }
    }, 500) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const indexOfTopicToFetch = state.topicDetails.topics.findIndex(i => i.topicTitle === cookies.topicTitle);
    if (indexOfTopicToFetch >= 0) {
      state.topicDetails.topics = [state.topicDetails.topics[indexOfTopicToFetch]];
      state.topicDetails.topicIndex = 0;
    }
    fetchTopics((topicTitle) || undefined); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessiontoken]);

  useEffect(() => {
    const appShell = getAppShell();
    const topicCarousel = getTopicCarousel();

    if (appShell && topicCarousel) {
      appShell.onscroll = () => {
        const scrollRatio = parseFloat((appShell.scrollTop / window.innerHeight).toFixed(1));
  
        if (scrollRatio === 0 || scrollRatio === 0.4) {
          selectPageScrollerButton(0);
        } else if (scrollRatio === 0.6 || scrollRatio === 1 || scrollRatio === 1.4) {
          selectPageScrollerButton(1);
        } else if (scrollRatio === 1.6 || scrollRatio === 2 || scrollRatio === 2.4) {
          selectPageScrollerButton(2);
        }
      }
    } // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const appShell = getAppShell();
    const cardsShellContainer = getCardsShellContainer();

    if (appShell && appShell.scrollTop > 0 && cardsShellContainer && state.incomingDirection !== IncomingDirection.NONE) {
        cardsShellContainer.style.transform = state.incomingDirection === IncomingDirection.RIGHT ? "translate(100%)" : "translate(-100%)";
        cardsShellContainer.style.opacity = "1.0";
        cardsShellContainer.animate([
          {
            transform: 'translate(0)'
          }
        ], {
          duration: prevNextTopicAnimationDuration,
          easing: 'ease-out',
          fill: "forwards"
        }).onfinish = () => {
          cardsShellContainer.style.transform = "translate(0)";
        }
    } else if (cardsShellContainer && state.incomingDirection !== IncomingDirection.NONE) {
        cardsShellContainer.style.opacity = "1.0";
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.topicDetails]);

  const fetchTopics = async (topicTofetch?: string) => {
    let body: any = { 
      "topicTitles": topicTofetch ? [topicTofetch] : undefined, 
      "n": 3,
      "excludedTopics": state.topicDetails.topics && state.topicDetails.topics.length && !topicTofetch ? state.topicDetails.topics.map((topic) => topic.topicTitle) : undefined,
    };
    let additionalHeaders = {};

    if (username && sessiontoken && username !== "") {
      body = { ...body, "username": username };
      additionalHeaders = { ...additionalHeaders, "sessiontoken": sessiontoken };
    }

    const { status, data }: { status: number, data: Topic[] } = await postData({ baseUrl: topicsConfig.url, path: 'get-topics', data: body, additionalHeaders: additionalHeaders, });
    if (status !== 200) {
      console.log("failed to fetch topics");
      return;
    }

    if(topicTofetch) {
      const indexOfTopicToFetch = state.topicDetails.topics.findIndex(i => i.topicTitle === topicTofetch);
      if (indexOfTopicToFetch >= 0) {
        state.topicDetails.topicIndex = arrayMove(state.topicDetails.topics, indexOfTopicToFetch, state.topicDetails.topicIndex); // move topic to current index if needed (for search)
        state.topicDetails.topics[state.topicDetails.topicIndex] = data[0]; // refresh topic with new data from db
        setState(s => ({ ...s, topicDetails: {...s.topicDetails, topics: state.topicDetails.topics }})); // trigger re-render
      } else {
        setState(s => ({ ...s, topicDetails: {topics: [...s.topicDetails.topics.slice(0, s.topicDetails.topicIndex+1), ...data, ...s.topicDetails.topics.slice(s.topicDetails.topicIndex+1)], topicIndex: s.topicDetails.topics.length ? s.topicDetails.topicIndex+1 : 0 }}));
      }
    } else {
      setState(s => ({ ...s, topicDetails: {...s.topicDetails, topics: [...s.topicDetails.topics, ...data] }}));
    }
    if (data && data.length) { 
      if (props.match.path === "/") {
        props.history.push(`${data[0].topicTitle.replace(/ /g,"_")}`);
      } else {
        props.history.push({
          pathname: generatePath(props.match.path, { topicTitle: data[0].topicTitle.replace(/ /g,"_") }),
          search: props.location.search
        });
      }
    }
  }

  const searchTopic = async (topicTofetch?: string) => {
    await fetchTopics(topicTofetch);
    const appShell = getAppShell();
    const cardsShellContainer = getCardsShellContainer();
    
    if (appShell && cardsShellContainer) {
      appShell.scrollTo(0, window.innerHeight);
      cardsShellContainer.style.opacity = "1.0";
    }
  }

  const animationCallback = useCallback((state: any, iteration: any, setState: any, fetchTopics: any) => () => {
    const incomingDirection = iteration === 0 ? IncomingDirection.NONE : iteration > 0 ? IncomingDirection.RIGHT : IncomingDirection.LEFT;
    if ((state.topicDetails.topicIndex + iteration) < state.topicDetails.topics.length && (state.topicDetails.topicIndex + iteration) >= 0) {
      setState({ ...state, topicDetails: {...state.topicDetails, topicIndex: state.topicDetails.topicIndex + iteration }, incomingDirection: incomingDirection});
      props.history.push({
        pathname: generatePath(props.match.path, { topicTitle: state.topicDetails.topics[state.topicDetails.topicIndex + iteration].topicTitle.replace(/ /g,"_") }),
        search: props.location.search
      });
    } else if ((state.topicDetails.topicIndex + iteration) === state.topicDetails.topics.length) {
      fetchTopics();
      setState({ ...state, topicDetails: {...state.topicDetails, topicIndex: state.topicDetails.topicIndex + iteration }, incomingDirection: incomingDirection});
    }
  }, [props.match.path, props.history, props.location.search]);

  const iterateTopic = (iteration: number) => () => {
    const cardsShellContainer = getCardsShellContainer();

    if (cardsShellContainer) {
      if (iteration === 1) {
        animateNextTopic(cardsShellContainer, animationCallback(state, iteration, setState, fetchTopics));
      }
      if (iteration === -1) {
        animatePrevTopic(cardsShellContainer, animationCallback(state, iteration, setState, fetchTopics));
      }
    }
  };

  const showSpecificComment = (comment: Comment) => {
    setState(prevState => ({ ...prevState, specificComment: comment }));
  };

  const topic = state.topicDetails.topics.length > 0 ? state.topicDetails.topics[state.topicDetails.topicIndex] : undefined;
  const nextTopic = (state.topicDetails.topics.length > 0) && (state.topicDetails.topicIndex < state.topicDetails.topics.length) ? state.topicDetails.topics[state.topicDetails.topicIndex + 1] : undefined;
  const prevTopic = (state.topicDetails.topics.length > 0) && (state.topicDetails.topicIndex >= 0) ? state.topicDetails.topics[state.topicDetails.topicIndex - 1] : undefined;
  const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
  const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
  const numTopicVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;

  const scrollToPage = (page: number) => {
    const appShell = getAppShell();

    if (appShell) {
      appShell.scrollTo({left: 0, top: page * window.innerHeight, behavior:'smooth'});
    }
  }

  const selectPageScrollerButton = (page: number) => {
    const pageZero = getPageZero();
    const pageOne = getPageOne();

    if (pageZero && pageOne) {
      pageZero.className = page === 0 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageOne.className = page === 1 ? 'page-scroller-button-selected' : 'page-scroller-button'
    }
  }

  // context-setters (they also serve as application cache)
  const setFullScreenModeContext = (fullScreenMode: boolean) => { setState(prevState => ({ ...prevState, fullScreenMode: fullScreenMode })); };
  const setTopicContext = (newTopic: Topic) => setState(prevState => ({ ...prevState, topicDetails: { ...prevState.topicDetails, topics: prevState.topicDetails.topics.map((topic, idx) => { if(idx === prevState.topicDetails.topicIndex) return newTopic; return topic; })}}));
  const setTopicImagesContext = (topicTitle: string, topicImages: TopicImages[], index: number) => setState(prevState => { 
    prevState.topicImages[topicTitle] = { images: topicImages, index: index, creationTime: Date.now() };
    limitCacheSize(prevState.topicImages);
    return { ...prevState };
  });
  const setCommentsContext = (topicTitle: string, comments: Comment[], specificComment: Comment) => setState(prevState => { 
    prevState.comments[topicTitle] = { comments: comments, specificComment: specificComment, creationTime: Date.now() };
    limitCacheSize(prevState.comments);
    return { ...prevState };
  });

  return (
      <div id={appShellId} className={appShellId} style={{ overflowY: state.fullScreenMode ? 'hidden' : 'scroll' }} >
        <SearchComponent onSuggestionClick={searchTopic} />
        <fullScreenContext.Provider value={{ fullScreenMode: state.fullScreenMode, setFullScreenModeContext: setFullScreenModeContext }}>
          <topicContext.Provider value={{ topic: topic, setTopicContext: setTopicContext }}>
            <topicImagesContext.Provider value={{ topicImagesState: state.topicImages, setTopicImagesContext: setTopicImagesContext }}>
              <commentsContext.Provider value={{ commentsState: state.comments, setCommentsContext: setCommentsContext }}>
                <div id={topicContentId} className={topicContentId}>
                    <div key={state.topicDetails.topicIndex} id={cardsShellContainerId} className={cardsShellContainerId}> 
                        {state.fullScreenMode && 
                          <FullScreenComponent
                            MediaCard={<TopicImagesComponent topicTitle={topic?.topicTitle || ""} />}
                            CommentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                            AnalyticsCard={<AnalyticsCardComponent id={"analytics"} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numTopicVotes}/>}
                            TopicCarousel={<TopicCarouselComponentFS id={topicCarouselId} topicTitle={topic?.topicTitle || ""} />}
                          />
                        }
                        {!state.fullScreenMode && 
                          <CardsShellComponent
                            mediaCard={<TopicImagesComponent topicTitle={topic?.topicTitle || ""} /> }
                            commentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                            analyticsCard={<AnalyticsCardComponent id={"analytics"} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numTopicVotes}/>}
                          />
                        }
                    </div>
                  {
                    !state.fullScreenMode && 
                    <TopicCarouselComponent id={topicCarouselId} iterateTopic={iterateTopic} topicTitle={topic?.topicTitle || ""} nextTopicTitle={nextTopic?.topicTitle} prevTopicTitle={prevTopic?.topicTitle} userVote={topic?.vote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numTopicVotes} />
                  }
                </div>
              </commentsContext.Provider>
            </topicImagesContext.Provider>
          </topicContext.Provider>
        </fullScreenContext.Provider>
        <div className="fixed-content">
          <PageScrollerComponent pageZeroId={pageZeroId} pageOneId={pageOneId} scrollToPage={scrollToPage} />
          <MenuComponent fetchTopics={fetchTopics} showSpecificComment={showSpecificComment} />
        </div>
      </div>
  )
}

const prevNextTopicAnimationDuration = 300;
const animateNextTopic = (cardsShellContainer: HTMLElement | null, callback: () => void) => {
  if(cardsShellContainer) {
    cardsShellContainer.style.transform = "translate(0)";
    cardsShellContainer.animate([
      {
        transform: 'translate(-100%)'
      }
    ], {
      duration: prevNextTopicAnimationDuration,
      easing: 'ease-in',
      fill: 'forwards',
    }).onfinish = () => {
      callback();
    }
  };
}

const animatePrevTopic = (cardsShellContainer: any, callback: () => void) => {
  if(cardsShellContainer) {
    cardsShellContainer.style.transform = "translate(0)";
    cardsShellContainer.animate([
      {
        transform: 'translate(100%)'
      }
    ], {
      duration: prevNextTopicAnimationDuration,
      easing: 'ease-in',
      fill: 'forwards',
    }).onfinish = () => {
      callback();
    }
  };
}

export const topicContext = React.createContext<{topic: Topic | undefined; setTopicContext: (newTopic: Topic) => void}>({
  topic: undefined,
  setTopicContext: (newTopic) => undefined
});

export const fullScreenContext = React.createContext<{fullScreenMode: boolean; setFullScreenModeContext: (fullScreenMode: boolean) => void}>({
  fullScreenMode: false,
  setFullScreenModeContext: (fullScreenMode) => undefined
});

export type TopicImagesState = { [topicTitle: string]: { images: TopicImages[], index: number, creationTime: number } };
export const topicImagesContext = React.createContext<{topicImagesState: TopicImagesState; setTopicImagesContext: (topicTitle: string, topicImages: TopicImages[], index: number) => void}>({
  topicImagesState: { },
  setTopicImagesContext: (topicTitle, topicImages, index) => undefined
});

export type CommentsState = { [topicTitle: string]: { comments: Comment[], specificComment: Comment | undefined, creationTime: number } };
export const commentsContext = React.createContext<{commentsState: CommentsState; setCommentsContext: (topicTitle: string, comments: Comment[], specificComment: Comment) => void}>({
  commentsState: { },
  setCommentsContext: (topicTitle, comments, specificComment) => undefined
});

const limitCacheSize = (object: Object): void => {
  let i = 1;
  let oldest = ['', Number.MAX_SAFE_INTEGER];
  for (const [key, value] of Object.entries(object)) {
    if (value.creationTime < oldest[1]) {
      oldest = [key, value.creationTime];
    };

    if (i > maxTopicsDataCacheSize) {
      delete (object as any)[oldest[0]];
    }
    i++;
  }
}