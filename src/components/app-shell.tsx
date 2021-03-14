import React, { useState, useEffect } from 'react';
import {TopicCarouselComponent } from './topic-carousel/topic-carousel';
import { SearchComponent } from './search/search';
import { AnalyticsCardComponent } from './analytics-card/analytics-card';
import { MenuComponent } from './menu/menu';
import { Topic, Comment, TopicMedia } from '../types';
import { postData, getData } from '../https-client/client';
import { topicsAPIConfig } from '../https-client/config';
import { arrayMove, formatTopicTitle, isMobile, modifyTopicQueryParam, replaceHistory } from "../utils";
import { useCookies } from 'react-cookie';
import { TopicContainerComponent } from './topic-container/topic-container';
import { CommentsCardComponent } from './comments/comments-card';
import {
  useHistory,
} from "react-router-dom";
import { useQuery } from '../hooks/useQuery';
import { TopicMediaComponent } from './topic-media/topic-media';
import { TopicContainerMobileComponent } from './topic-container-mobile/topic-container-mobile';
import { TopicNavigatorComponent } from './topic-navigator/topic-navigator';
import ReactGA from 'react-ga';


// type imports
import { Response } from '../https-client/client';

// style imports
import './app-shell.css';

// initialize google analytics in prod
if (window.location.hostname.includes('halalvote.com')) {
  process.env.REACT_APP_GA_TRACKING_ID_HALAL && ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID_HALAL!);
} else if (window.location.hostname.includes('haramvote.com')) {
  process.env.REACT_APP_GA_TRACKING_ID_HARAM && ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID_HARAM!);
};

enum IncomingDirection {
  LEFT,
  RIGHT,
  NONE
}

const maxTopicsDataCacheSize = 3;

const appShellId = "app-shell";
const topicCarouselId = "topicCarousel";

const getAppShell = () => { return document.getElementById(appShellId); }
const getTitleTag = (): HTMLElement | null => { return document.getElementById("halal-vote-title"); }
const getDescriptionTag = (): HTMLElement | null => { return document.getElementById("halal-vote-description"); }
const getKeywordsTag = (): HTMLElement | null => { return document.getElementById("halal-vote-keywords"); }
const getCanonicalLinkTag = (): HTMLElement | null => { return document.getElementById("halal-vote-canonical-link"); }

type AppShellState = { 
  topicsState: TopicsState; 
  topicMedia: TopicImagesState,
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
    topicMedia: { },
    comments: { },
    specificComment: undefined,
    incomingDirection: IncomingDirection.NONE,
    muted: true,
    analytics: { }
  });

  const [cookies] = useCookies(['username', 'sessiontoken']);
  const { username, sessiontoken } = cookies;

  const query = useQuery();
  const history = useHistory();

  let topicTitle = query.get("topic") || undefined;
  topicTitle = topicTitle?.replace(/_/g, ' ').replace(/%2F/g, '/');

  // context-setters (they also serve as application cache)
  const setMutedContext = (mute: boolean) => { setState(prevState => ({ ...prevState, muted: mute })); };
  const setTopicsContext = (topics: Topic[], index: number) => {
    setState(prevState => ({ ...prevState, topicsState: { topics: topics, topicIndex: index }}));
  };
  const setTopicMediaContext = (topicTitle: string, topicMedia: TopicMedia[], index: number, doneLoading?: boolean) => setState(prevState => { 
    prevState.topicMedia[topicTitle] = { images: topicMedia, index: index, doneLoading: doneLoading || false, creationTime: Date.now() };
    limitCacheSize(prevState.topicMedia);
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
    const { topics, topicIndex } = state.topicsState;
    if (topics[topicIndex] && topics[topicIndex].topicTitle) {
      modifyTopicQueryParam(query, topics[topicIndex].topicTitle);
      replaceHistory(history, query);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.topicsState]);

  useEffect(() => {
    const titleTag = getTitleTag();
    const descriptionTag = getDescriptionTag();
    const keywordsTag = getKeywordsTag();
    const canonicalLinkTag = getCanonicalLinkTag();
    const url = document.URL;

    if (titleTag && descriptionTag && keywordsTag && canonicalLinkTag) {
      const isHalalVoteSite = url.includes("halal") || url.includes("localhost");
      let title = isHalalVoteSite ? "Halal Vote" : "Haram Vote";
      let description = "Your source for everything halal and haram!";
      description += ` ${title} is a platform for muslims to get a community sentiment on whether various topics are viewed as halal or haram.`;
      let keywords = ['halal', 'haram', 'vote', 'arguments', 'analytics', 'media'];
      let canonicalLink = isHalalVoteSite ? "https://halalvote.com/" : "https://haramvote.com/";
      
      const topic = state.topicsState.topics[state.topicsState.topicIndex];
      if (topic) {
        title += ` - ${topic.topicTitle}`;
        description += ` Is ${topic.topicTitle} ${isHalalVoteSite ? "halal" : "haram"}?`;
        const halalPercentage = Math.round(((topic.halalPoints) * 100) / (topic.halalPoints + topic.haramPoints));
        const haramPercentage = 100 - halalPercentage;
        description += ` ${halalPercentage}% of users think ${topic.topicTitle} is halal and ${haramPercentage}% of users think ${topic.topicTitle} is haram.`;
        keywords = keywords.concat(topic.topicTitle.split(" "));
        canonicalLink += `?topic=${encodeURIComponent(formatTopicTitle(topic.topicTitle))}`
      }

      titleTag.innerText = title;
      descriptionTag.setAttribute("name", "description");
      descriptionTag.setAttribute("content", description);
      keywordsTag.setAttribute("name", "keywords");
      keywordsTag.setAttribute("content", keywords.join(", "));
      canonicalLinkTag.setAttribute("rel",  "canonical");
      canonicalLinkTag.setAttribute("href", canonicalLink);
    } // eslint-disable-next-line
  }, [query]);

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

    const { status, data }: { status: number, data: Topic[] } = await authenticatedPostData({ baseUrl: topicsAPIConfig.url, path: 'get-topics', data: body, additionalHeaders: additionalHeaders, }, true);
    if (status !== 200) {
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

  const iterateTopic = (iteration: number) => () => {
    const incomingDirection = iteration === 0 ? IncomingDirection.NONE : iteration > 0 ? IncomingDirection.RIGHT : IncomingDirection.LEFT;

    setState((prevState: AppShellState) => ({ ...prevState, incomingDirection: incomingDirection, muted: true }));

    if (((state.topicsState.topicIndex + iteration) < state.topicsState.topics.length) && ((state.topicsState.topicIndex + iteration) >= 0)) {
      if ((state.topicsState.topicIndex + iteration) >= (state.topicsState.topics.length - 2)) {
        fetchTopics(undefined, state.topicsState.topicIndex + iteration);
      } else {
        setTopicsContext(state.topicsState.topics, state.topicsState.topicIndex+iteration);
      }
    }

  };

  const showSpecificComment = (comment: Comment) => {
    setCommentsContext(topic?.topicTitle!, state.comments[topic?.topicTitle!].comments, comment);
  };

  const topic = state.topicsState.topics.length > 0 ? state.topicsState.topics[state.topicsState.topicIndex] : undefined;

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
    replaceHistory(history, query);
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
              <topicMediaContext.Provider value={{ topicMediaState: state.topicMedia, setTopicMediaContext: setTopicMediaContext }}>
                <commentsContext.Provider value={{ commentsState: state.comments, setCommentsContext: setCommentsContext }}>
                  <analyticsContext.Provider value={{ analyticsState: state.analytics, setAnalyticsContext: setAnalyticsContext }}>
                    <div id={appShellId} className={appShellId} style={{ overflowY: isMobile ? 'hidden' : 'scroll' }} >
                      <SearchComponent onSuggestionClick={searchTopic} />
                      <div className="topic-content">
                      {
                        isMobile ?
                        <TopicContainerMobileComponent
                          fetchTopics={fetchTopics}
                          CommentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                          AnalyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
                          TopicCarousel={<TopicCarouselComponent id={topicCarouselId} fetchTopics={fetchTopics} />}
                          TopicNavigator={<TopicNavigatorComponent iterateTopic={iterateTopic}/>}
                        /> :
                        <TopicContainerComponent
                          mediaCard={<TopicMediaComponent /> }
                          commentsCard={<CommentsCardComponent refreshTopic={fetchTopics} switchCards={() => {}}/>} 
                          analyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
                          TopicCarousel={<TopicCarouselComponent id={topicCarouselId} fetchTopics={fetchTopics} />}
                          TopicNavigator={<TopicNavigatorComponent iterateTopic={iterateTopic}/>}
                        />
                      }
                      </div>
                      <div className="fixed-content">
                        <MenuComponent fetchTopics={searchTopic} showSpecificComment={showSpecificComment} />
                      </div>
                    </div>
                  </analyticsContext.Provider>
                </commentsContext.Provider>
              </topicMediaContext.Provider>
            </topicsContext.Provider>
          </muteContext.Provider>
        </authenticatedGetDataContext.Provider>
      </authenticatedPostDataContext.Provider>
  )
}

const authenticatedPostData = async (request: any, willRetry: boolean): Promise<Response> => {
  return await postData(request)
};
export const authenticatedPostDataContext = React.createContext<{authenticatedPostData: (request: any, willRetry: boolean) => Promise<Response>; setAuthenticatedPostData: (postData: (request: any, willRetry: boolean) => Promise<any>) => void}>({
  authenticatedPostData: authenticatedPostData,
  setAuthenticatedPostData: (postData) => undefined
});

const authenticatedGetData = async (request: any, willRetry: boolean): Promise<Response> => {
  return await getData(request)
};
export const authenticatedGetDataContext = React.createContext<{authenticatedGetData: (request: any, willRetry: boolean) => Promise<Response>; setAuthenticatedGetData: (getData: (request: any, willRetry: boolean) => Promise<any>) => void}>({
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

export type TopicImagesState = { [topicTitle: string]: { images: TopicMedia[], index: number, doneLoading: boolean, creationTime: number } };
export const topicMediaContext = React.createContext<{topicMediaState: TopicImagesState; setTopicMediaContext: (topicTitle: string, topicMedia: TopicMedia[], index: number, doneLoading?: boolean) => void}>({
  topicMediaState: { },
  setTopicMediaContext: (topicTitle, topicMedia, index, doneLoading) => undefined
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