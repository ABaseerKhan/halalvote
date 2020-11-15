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
import { FullScreenContainer } from './full-screen/full-screen-container';

enum IncomingDirection {
  LEFT,
  RIGHT,
  NONE
}

const maxTopicsDataCacheSize = 20;

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
  topicsState: TopicsState; 
  topicImages: TopicImagesState,
  comments: CommentsState,
  scrollPosition: number, 
  specificComment?: Comment, 
  incomingDirection: IncomingDirection, 
  fullScreenMode: boolean,
  analytics: AnalyticsState
};
export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<AppShellState>({
    topicsState: {
      topics: [],
      topicIndex: 0
    },
    topicImages: { },
    comments: { },
    scrollPosition: window.innerHeight,
    specificComment: undefined,
    incomingDirection: IncomingDirection.NONE,
    fullScreenMode: false,
    analytics: { }
  });
  

  let { topicTitle } = useParams();
  topicTitle = topicTitle?.replace(/_/g, ' ').replace(/%2F/g, '/');

  const [cookies] = useCookies(['username', 'sessiontoken']);
  const { username, sessiontoken } = cookies;

  // context-setters (they also serve as application cache)
  const setFullScreenModeContext = (fullScreenMode: boolean) => { setState(prevState => ({ ...prevState, fullScreenMode: fullScreenMode })); };
  const setTopicsContext = (topics: Topic[], index: number) => {
    setState(prevState => ({ ...prevState, topicsState: { topics: topics, topicIndex: index }}));
  };
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
  const setAnalyticsContext = (topicTitle: string, graph: AnalyticsGraph) => setState(prevState => {
    prevState.analytics[topicTitle] = { graph: graph, creationTime: Date.now() }
    limitCacheSize(prevState.analytics);
    return { ...prevState };
  });

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
    const indexOfTopicToFetch = state.topicsState.topics.findIndex(i => i.topicTitle === cookies.topicTitle);
    if (indexOfTopicToFetch >= 0) {
      state.topicsState.topics = [state.topicsState.topics[indexOfTopicToFetch]];
      state.topicsState.topicIndex = 0;
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
    const { topics, topicIndex } = state.topicsState;
    if (topics[topicIndex]) {
      if (props.match.path === "/") {
        props.history.push(`${topics[topicIndex].topicTitle.replace(/ /g,"_")}`);
      } else {
        props.history.push({
          pathname: generatePath(props.match.path, { topicTitle: topics[topicIndex].topicTitle.replace(/ /g,"_") }),
          search: window.location.search
        });
      }
    }

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
  }, [state.topicsState]);

  const fetchTopics = async (topicTofetch?: string, newIndex?: number) => {
    let body: any = { 
      "topicTitles": topicTofetch ? [topicTofetch] : undefined, 
      "n": 2,
      "excludedTopics": state.topicsState.topics && state.topicsState.topics.length && !topicTofetch ? state.topicsState.topics.map((topic) => topic.topicTitle) : undefined,
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
      const indexOfTopicToFetch = state.topicsState.topics.findIndex(i => i.topicTitle === topicTofetch);
      if (indexOfTopicToFetch >= 0) {
        state.topicsState.topicIndex = arrayMove(state.topicsState.topics, indexOfTopicToFetch, state.topicsState.topicIndex); // move topic to current index if needed (for search)
        state.topicsState.topics[state.topicsState.topicIndex] = data[0]; // refresh topic with new data from db
        setTopicsContext(state.topicsState.topics, state.topicsState.topicIndex); // trigger re-render
      } else {
        console.log([...state.topicsState.topics.slice(0, state.topicsState.topicIndex+1), ...data, ...state.topicsState.topics.slice(state.topicsState.topicIndex+1)]);
        setTopicsContext([...state.topicsState.topics.slice(0, state.topicsState.topicIndex+1), ...data, ...state.topicsState.topics.slice(state.topicsState.topicIndex+1)], state.topicsState.topics.length >= 1 ? state.topicsState.topicIndex+1 : 0);
      }
    } else {
      setTopicsContext([...state.topicsState.topics, ...data], newIndex!==undefined ? newIndex : state.topicsState.topicIndex);
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

  const animationCallback = useCallback((state: AppShellState, iteration: any, setState: any, fetchTopics: any) => () => {
    const incomingDirection = iteration === 0 ? IncomingDirection.NONE : iteration > 0 ? IncomingDirection.RIGHT : IncomingDirection.LEFT;
    if ((state.topicsState.topicIndex + iteration) < state.topicsState.topics.length && (state.topicsState.topicIndex + iteration) >= 0) {
      state.topicsState.topicIndex = state.topicsState.topicIndex + iteration;
      setTopicsContext(state.topicsState.topics, state.topicsState.topicIndex);
      setState({ ...state, incomingDirection: incomingDirection});
      props.history.push({
        pathname: generatePath(props.match.path, { topicTitle: state.topicsState.topics[state.topicsState.topicIndex].topicTitle.replace(/ /g,"_") }),
        search: window.location.search
      });
    } else if ((state.topicsState.topicIndex + iteration) === state.topicsState.topics.length) {
      fetchTopics();
      state.topicsState.topicIndex = state.topicsState.topicIndex + iteration;
      setTopicsContext(state.topicsState.topics, state.topicsState.topicIndex);
      setState({ ...state, incomingDirection: incomingDirection});
    } // eslint-disable-next-line
  }, [props.match.path, props.history]);

  const iterateTopic = (iteration: number) => () => {
    const cardsShellContainer = getCardsShellContainer();

    if (cardsShellContainer) {
      if (iteration === 1) {
        animateNextTopic(cardsShellContainer, animationCallback(state, iteration, setState, fetchTopics));
      }
      if (iteration === -1) {
        if ((state.topicsState.topicIndex + iteration) >= 0) {
          animatePrevTopic(cardsShellContainer, animationCallback(state, iteration, setState, fetchTopics));
        }
      }
    }
  };

  const showSpecificComment = (comment: Comment) => {
    setCommentsContext(topic?.topicTitle!, state.comments[topic?.topicTitle!].comments, comment);
  };

  const topic = state.topicsState.topics.length > 0 ? state.topicsState.topics[state.topicsState.topicIndex] : undefined;

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

  return (
      <div id={appShellId} className={appShellId} style={{ overflowY: state.fullScreenMode ? 'hidden' : 'scroll' }} >
        <SearchComponent onSuggestionClick={searchTopic} />
        <fullScreenContext.Provider value={{ fullScreenMode: state.fullScreenMode, setFullScreenModeContext: setFullScreenModeContext }}>
          <topicsContext.Provider value={{ topicsState: state.topicsState, setTopicsContext: setTopicsContext }}>
            <topicImagesContext.Provider value={{ topicImagesState: state.topicImages, setTopicImagesContext: setTopicImagesContext }}>
              <commentsContext.Provider value={{ commentsState: state.comments, setCommentsContext: setCommentsContext }}>
                <analyticsContext.Provider value={{ analyticsState: state.analytics, setAnalyticsContext: setAnalyticsContext }}>
                  <div id={topicContentId} className={topicContentId}>
                    {state.fullScreenMode && 
                      <FullScreenContainer 
                        fetchTopics={fetchTopics}
                        MediaCard={<TopicImagesComponent />}
                        CommentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                        AnalyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
                        TopicCarousel={<TopicCarouselComponentFS id={topicCarouselId} />}
                      />
                    }
                    <div key={state.topicsState.topicIndex} id={cardsShellContainerId} className={cardsShellContainerId} style={{ height: (state.fullScreenMode ? '0' : '100%') }}> 
                        {!state.fullScreenMode && 
                          <CardsShellComponent
                            mediaCard={<TopicImagesComponent /> }
                            commentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                            analyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
                          />
                        }
                    </div>
                    {
                      !state.fullScreenMode && 
                      <TopicCarouselComponent id={topicCarouselId} iterateTopic={iterateTopic}/>
                    }
                  </div>
                </analyticsContext.Provider>
              </commentsContext.Provider>
            </topicImagesContext.Provider>
          </topicsContext.Provider>
        </fullScreenContext.Provider>
        <div className="fixed-content">
          {!state.fullScreenMode && <PageScrollerComponent pageZeroId={pageZeroId} pageOneId={pageOneId} scrollToPage={scrollToPage} />}
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

export const fullScreenContext = React.createContext<{fullScreenMode: boolean; setFullScreenModeContext: (fullScreenMode: boolean) => void}>({
  fullScreenMode: false,
  setFullScreenModeContext: (fullScreenMode) => undefined
});

export type TopicsState = { topics: Topic[]; topicIndex: number };
export const topicsContext = React.createContext<{topicsState: TopicsState; setTopicsContext: (topics: Topic[], topicIndex: number) => void}>({
  topicsState: { topics: [], topicIndex: 0 },
  setTopicsContext: (topics, topicIndex) => undefined
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

export interface AnalyticsGraph {
  interval: string, 
  numIntervals: number, 
  halalCounts: number[],
  haramCounts: number[]
}
export type AnalyticsState = { [topicTitle: string]: {graph: AnalyticsGraph, creationTime: number} }
export const analyticsContext = React.createContext<{analyticsState: AnalyticsState; setAnalyticsContext: (topicTitle: string, graph: AnalyticsGraph) => void}>({
  analyticsState: { },
  setAnalyticsContext: () => undefined
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