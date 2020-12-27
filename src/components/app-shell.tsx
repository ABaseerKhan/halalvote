import React, { useState, useEffect } from 'react';
import { PageScrollerComponent } from './page-scroller/page-scroller';
import {TopicCarouselComponent } from './topic-carousel/topic-carousel';
import { SearchComponent, SearchComponentMobile } from './search/search';
import { AnalyticsCardComponent } from './analytics-card/analytics-card';
import { MenuComponent } from './menu/menu';
import { Topic, Comment, TopicImages } from '../types';
import { postData, getData } from '../https-client/client';
import { topicsConfig } from '../https-client/config';
import { arrayMove, isMobile } from "../utils";
import { useCookies } from 'react-cookie';
import { TopicContainerComponent } from './topic-container/topic-container';
import { CommentsCardComponent } from './comments/comments-card';
import {
  useHistory,
  useParams,
  generatePath
} from "react-router-dom";
import { useQuery } from '../hooks/useQuery';
import { TopicImagesComponent } from './topic-images/topic-images';
import { TopicContainerMobileComponent } from './topic-container-mobile/topic-container-mobile';


// type imports

// style imports
import './app-shell.css';
import { TopicNavigatorComponent } from './topic-navigator/topic-navigator';

enum IncomingDirection {
  LEFT,
  RIGHT,
  NONE
}

const maxTopicsDataCacheSize = 20;

const appShellId = "app-shell";
const movingTopicContentId = "moving-topic-content";
const topicCarouselId = "topicCarousel";
const pageZeroId = "Search";
const pageOneId = "Topics";

const getAppShell = () => { return document.getElementById(appShellId); }
const getTopicCarousel = () => { return document.getElementById(topicCarouselId); }
const getPageZero = () => { return document.getElementById(pageZeroId); }
const getPageOne = () => { return document.getElementById(pageOneId); }
const getMovingTopicContent = () => { return document.getElementById(movingTopicContentId); }

type AppShellState = { 
  topicsState: TopicsState; 
  topicImages: TopicImagesState,
  comments: CommentsState,
  specificComment?: Comment, 
  incomingDirection: IncomingDirection,
  muted: boolean,
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
    specificComment: undefined,
    incomingDirection: IncomingDirection.NONE,
    muted: true,
    analytics: { }
  });
  

  let { topicTitle } = useParams<any>();
  topicTitle = topicTitle?.replace(/_/g, ' ').replace(/%2F/g, '/');

  const [cookies] = useCookies(['username', 'sessiontoken']);
  const { username, sessiontoken } = cookies;

  const query = useQuery();
  const history = useHistory();

  // context-setters (they also serve as application cache)
  const setMutedContext = (mute: boolean) => { setState(prevState => ({ ...prevState, muted: mute })); };
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
  const setAuthenticatedPostData = (postData: (request: Request, willRetry: boolean) => void) => {}
  const setAuthenticatedGetData = (getData: (request: Request, willRetry: boolean) => void) => {}

  useEffect(() => {
    setTimeout(() => {
      const appShell = getAppShell();

      if (appShell) {
        appShell.scrollTo(0, window.innerHeight);
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
    if (state.topicsState.topics.length === 1) {
      fetchTopics();
    }; // eslint-disable-next-line
  }, [state.topicsState]);

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
    if (topics[topicIndex] && topics[topicIndex].topicTitle) {
      if (props.match.path === "/") {
        props.history.replace(`${topics[topicIndex].topicTitle.replace(/ /g,"_")}`);
      } else {
        props.history.replace({
          pathname: generatePath(props.match.path, { topicTitle: topics[topicIndex].topicTitle.replace(/ /g,"_") }),
          search: window.location.search
        });
      }
    }

    const appShell = getAppShell();
    const movingTopicContent = getMovingTopicContent();

    if (appShell && movingTopicContent && state.incomingDirection !== IncomingDirection.NONE) {
        movingTopicContent.style.marginLeft = state.incomingDirection === IncomingDirection.RIGHT ? "100%" : "-100%";
        movingTopicContent.animate([
          {
            marginLeft: '0',
          }
        ], {
          duration: prevNextTopicAnimationDuration,
          easing: 'ease-out',
        }).onfinish = () => {
          movingTopicContent.style.marginLeft = "0";
          setState(prevState => ({ ...prevState, incomingDirection: IncomingDirection.NONE }));
        }
    } else if (movingTopicContent && state.incomingDirection !== IncomingDirection.NONE) {
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

    const { status, data }: { status: number, data: Topic[] } = await authenticatedPostData({ baseUrl: topicsConfig.url, path: 'get-topics', data: body, additionalHeaders: additionalHeaders, }, true);
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
        setTopicsContext([...state.topicsState.topics.slice(0, state.topicsState.topicIndex+1), ...data, ...state.topicsState.topics.slice(state.topicsState.topicIndex+1)], state.topicsState.topics.length >= 1 ? state.topicsState.topicIndex+1 : 0);
      }
    } else {
      setTopicsContext([...state.topicsState.topics, ...data], newIndex!==undefined ? newIndex : state.topicsState.topicIndex);
    }
  }

  const searchTopic = async (topicTofetch?: string) => {
    await fetchTopics(topicTofetch);
    const appShell = getAppShell();
    
    if (appShell) {
      appShell.scrollTo(0, window.innerHeight);
    }
  }

  const animationCallback = (iteration: number) => () => {
    const incomingDirection = iteration === 0 ? IncomingDirection.NONE : iteration > 0 ? IncomingDirection.RIGHT : IncomingDirection.LEFT;

    setState((prevState: AppShellState) => ({ ...prevState, incomingDirection: incomingDirection, muted: true }));

    if ((state.topicsState.topicIndex + iteration) >= (state.topicsState.topics.length - 2)) {
      fetchTopics(undefined, state.topicsState.topicIndex + iteration);
    } else if ((state.topicsState.topicIndex + iteration) >= 0) {
      setTopicsContext(state.topicsState.topics, state.topicsState.topicIndex+iteration);
    }

  };

  const iterateTopic = (iteration: number) => () => {
    const movingTopicContent = getMovingTopicContent();

    if (movingTopicContent) {
      if (iteration === 1) {
        animateNextTopic(movingTopicContent, animationCallback(iteration));
      }
      if (iteration === -1) {
        if ((state.topicsState.topicIndex + iteration) >= 0) {
          animatePrevTopic(movingTopicContent, animationCallback(iteration));
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

  const handle401 = async ({ data, additionalHeaders }: any) => {
    document.cookie = "username= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sessiontoken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    delete additionalHeaders.sessiontoken;
    delete additionalHeaders.username;
    if (data) delete data.username;
  }
  
  const handle400 = () => {
    if (query.has('loginScreen')) {
        query.set('loginScreen', 'login');
    } else {
        query.append('loginScreen', 'login');
    };
    history.replace({
      search: "?" + query.toString()
    });
  }

  const authenticatedPostData = async (request: any, willRetry: boolean): Promise<any> => {
    const response: any = await postData(request)
    if(response.status === 401) {
      handle401(request);
      if (willRetry) {
          return await postData(request);
      }
    }
    if(response.status === 400) {
        handle400();
    }
    return response;
  };

  const authenticatedGetData = async (request: any, willRetry: boolean): Promise<any> => {
    const response: any = await getData(request)
    if(response.status === 401) {
      handle401(request);
      if (willRetry) {
          return await getData(request);
      }
    }
    if(response.status === 400) {
        handle400();
    }
    return response;
  };

  return (
    <authenticatedPostDataContext.Provider value={{authenticatedPostData: authenticatedPostData, setAuthenticatedPostData: setAuthenticatedPostData}}>
        <authenticatedGetDataContext.Provider value={{authenticatedGetData: authenticatedGetData, setAuthenticatedGetData: setAuthenticatedGetData}}>
          <muteContext.Provider value={{ muted: state.muted, setMuted: setMutedContext }}>
            <topicsContext.Provider value={{ topicsState: state.topicsState, setTopicsContext: setTopicsContext }}>
              <topicImagesContext.Provider value={{ topicImagesState: state.topicImages, setTopicImagesContext: setTopicImagesContext }}>
                <commentsContext.Provider value={{ commentsState: state.comments, setCommentsContext: setCommentsContext }}>
                  <analyticsContext.Provider value={{ analyticsState: state.analytics, setAnalyticsContext: setAnalyticsContext }}>
                    <div id={appShellId} className={appShellId} style={{ overflowY: isMobile ? 'hidden' : 'scroll' }} >
                      {isMobile ? <SearchComponentMobile onSuggestionClick={searchTopic} /> : <SearchComponent onSuggestionClick={searchTopic} />}
                      <div className="topic-content">
                        {
                          isMobile ?
                          <TopicContainerMobileComponent
                            movingTopicContentId={movingTopicContentId}
                            fetchTopics={fetchTopics}
                            MediaCard={<TopicImagesComponent /> }
                            CommentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                            AnalyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
                            TopicCarousel={<TopicCarouselComponent id={topicCarouselId} fetchTopics={fetchTopics} />}
                            TopicNavigator={<TopicNavigatorComponent iterateTopic={iterateTopic}/>}
                          /> :
                          <TopicContainerComponent
                            movingTopicContentId={movingTopicContentId}
                            mediaCard={<TopicImagesComponent /> }
                            commentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                            analyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
                            TopicCarousel={<TopicCarouselComponent id={topicCarouselId} fetchTopics={fetchTopics} />}
                            TopicNavigator={<TopicNavigatorComponent iterateTopic={iterateTopic}/>}
                          />
                        }
                      </div>
                      <div className="fixed-content">
                        {!isMobile && <PageScrollerComponent pageZeroId={pageZeroId} pageOneId={pageOneId} scrollToPage={scrollToPage} />}
                        <MenuComponent fetchTopics={searchTopic} showSpecificComment={showSpecificComment} />
                      </div>
                    </div>
                  </analyticsContext.Provider>
                </commentsContext.Provider>
              </topicImagesContext.Provider>
            </topicsContext.Provider>
          </muteContext.Provider>
        </authenticatedGetDataContext.Provider>
      </authenticatedPostDataContext.Provider>
  )
}

const prevNextTopicAnimationDuration = 300;
const animateNextTopic = (movingTopicContent: HTMLElement | null, callback: () => void) => {
  if(movingTopicContent) {
    movingTopicContent.style.marginLeft = "0";
    movingTopicContent.animate([
      {
        marginLeft: '-100%'
      }
    ], {
      duration: prevNextTopicAnimationDuration,
      easing: 'ease-in',
    }).onfinish = () => {
      movingTopicContent.style.marginLeft = "-100%";
      callback();
    }
  };
}

const animatePrevTopic = (movingTopicContent: any, callback: () => void) => {
  if(movingTopicContent) {
    movingTopicContent.style.marginLeft = "0";
    movingTopicContent.animate([
      {
        marginLeft: '100%'
      }
    ], {
      duration: prevNextTopicAnimationDuration,
      easing: 'ease-in',
    }).onfinish = () => {
      movingTopicContent.style.marginLeft = "100%";
      callback();
    }
  };
}

const authenticatedPostData = async (request: any, willRetry: boolean): Promise<any> => {
  return await postData(request)
};
export const authenticatedPostDataContext = React.createContext<{authenticatedPostData: (request: any, willRetry: boolean) => Promise<any>; setAuthenticatedPostData: (postData: (request: any, willRetry: boolean) => Promise<any>) => void}>({
  authenticatedPostData: authenticatedPostData,
  setAuthenticatedPostData: (postData) => undefined
});

const authenticatedGetData = async (request: any, willRetry: boolean): Promise<any> => {
  return await getData(request)
};
export const authenticatedGetDataContext = React.createContext<{authenticatedGetData: (request: any, willRetry: boolean) => Promise<any>; setAuthenticatedGetData: (getData: (request: any, willRetry: boolean) => Promise<any>) => void}>({
  authenticatedGetData: authenticatedGetData,
  setAuthenticatedGetData: (getData) => undefined
});

export const fullScreenContext = React.createContext<{fullScreenMode: boolean; setFullScreenModeContext: (fullScreenMode: boolean) => void}>({
  fullScreenMode: false,
  setFullScreenModeContext: (fullScreenMode) => undefined
});

export const muteContext = React.createContext<{muted: boolean; setMuted: (mute: boolean) => void}>({
  muted: true,
  setMuted: (mute) => undefined
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