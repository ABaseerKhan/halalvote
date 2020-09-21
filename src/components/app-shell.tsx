import React, { useState, useEffect } from 'react';
import { PageScrollerComponent } from './page-scroller/page-scroller';
import { TopicCarouselComponent } from './topic-carousel/topic-carousel';
import { SearchComponent } from './search/search';
import { AnalyticsCardComponent } from './analytics-card/analytics-card';
import { MenuComponent } from './menu/menu';
import { Topic, Comment, Judgment } from '../types';
import { postData } from '../https-client/client';
import { topicsConfig } from '../https-client/config';
import { vhToPixelsWithMax, arrayMove, vhToPixels, vwToPixels } from "../utils";
import { elementStyles } from "../index";
import { useCookies } from 'react-cookie';
import { CardsShellComponent } from './cards-shell/cards-shell';
import { CommentsCardComponent } from './comments/comments-card';

// type imports

// style imports
import './app-shell.css';
import { TopicImagesComponent } from './topic-images/topic-images';
import { useMedia } from '../hooks/useMedia';

export const AppShellComponent = (props: any) => {
  const [state, setState] = useState<{ topicDetails: {topics: Topic[]; topicIndex: number}; scrollPosition: number, specificComment?: Comment }>({
    topicDetails: {
      topics: [],
      topicIndex: 0
    },
    scrollPosition: window.innerHeight,
    specificComment: undefined,
  });

  const isMobile = useMedia(
    // Media queries
    ['(max-width: 600px)'],
    [true],
    // default value
    false
  );

  const [cookies, setCookie, removeCookie] = useCookies(['username', 'sessiontoken', 'topicTitle']);
  const { username, sessiontoken } = cookies;

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('app-shell')?.scrollTo(0, window.innerHeight);
    }, 500) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const indexOfTopicToFetch = state.topicDetails.topics.findIndex(i => i.topicTitle === cookies.topicTitle);
    if (indexOfTopicToFetch >= 0) {
      state.topicDetails.topics = [state.topicDetails.topics[indexOfTopicToFetch]];
      state.topicDetails.topicIndex = 0;
    }
    fetchTopics(cookies.topicTitle || undefined);// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessiontoken]);

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
    if (data && data.length) setCookie('topicTitle', data[0].topicTitle);
    else {
      removeCookie("topicTitle");
    }
  }

  const appShellId = "app-shell";
  const topicCarouselId = "topicCarousel";
  const pageZeroId = "Search";
  const pageOneId = "Topics";
  const cardsShellId = "cards-shell";

  const appShell = document.getElementById(appShellId);
  const topicCarousel = document.getElementById(topicCarouselId);
  const pageZero = document.getElementById(pageZeroId);
  const pageOne = document.getElementById(pageOneId);
  const cardsShell = document.getElementById(cardsShellId);

  const iterateTopic = (iteration: number) => () => {
    const animationCallback = (state: any, iteration: any, setState: any, setCookie: any, fetchTopics: any) => () => {
      if ((state.topicDetails.topicIndex + iteration) < state.topicDetails.topics.length && (state.topicDetails.topicIndex + iteration) >= 0) {
        setState({ ...state, topicDetails: {...state.topicDetails, topicIndex: state.topicDetails.topicIndex + iteration }});
        setCookie("topicTitle", state.topicDetails.topics[state.topicDetails.topicIndex + iteration].topicTitle);
      } else if ((state.topicDetails.topicIndex + iteration) === state.topicDetails.topics.length) {
        fetchTopics();
        setState({ ...state, topicDetails: {...state.topicDetails, topicIndex: state.topicDetails.topicIndex + iteration }});
      }
    };
    if (iteration === 1) {
      animateNextTopic(cardsShell, animationCallback(state, iteration, setState, setCookie, fetchTopics));
    }
    if (iteration === -1) {
      animatePrevTopic(cardsShell, animationCallback(state, iteration, setState, setCookie, fetchTopics));
    }
  };

  const showSpecificComment = (comment: Comment) => {
    setState(prevState => ({ ...prevState, specificComment: comment }));
  };

  const topic = state.topicDetails.topics.length > 0 ? state.topicDetails.topics[state.topicDetails.topicIndex] : undefined;
  const nextTopic = (state.topicDetails.topics.length > 0) && (state.topicDetails.topicIndex < state.topicDetails.topics.length) ? state.topicDetails.topics[state.topicDetails.topicIndex + 1] : undefined;
  const prevTopic = (state.topicDetails.topics.length > 0) && (state.topicDetails.topicIndex >= 0) ? state.topicDetails.topics[state.topicDetails.topicIndex - 1] : undefined;
  const topicTitle = topic?.topicTitle !== undefined ? topic.topicTitle : "";
  const halalPoints = topic?.halalPoints !== undefined ? topic.halalPoints : 0;
  const haramPoints = topic?.haramPoints !== undefined ? topic.haramPoints : 0;
  const numTopicVotes = topic?.numVotes !== undefined ? topic.numVotes : 0;
  const numHalalComments = topic?.numHalalComments !== undefined ? topic.numHalalComments : 0;
  const numHaramComments = topic?.numHaramComments !== undefined ? topic.numHaramComments : 0;

  if (appShell && topicCarousel) {
    appShell.onscroll = () => {
      const { topicCarouselHeightVh, maxTopicCarouselHeightPx } = elementStyles;
      const topicCarouselHeightPx = vhToPixelsWithMax(topicCarouselHeightVh, maxTopicCarouselHeightPx);
      const halfWindowHeight = window.innerHeight / 2.0;
  
      if (appShell.scrollTop > halfWindowHeight) {
        topicCarousel.style.visibility = "visible";
        topicCarousel.style.opacity = "1.0";
      } else if (appShell.scrollTop > topicCarouselHeightPx) {
        topicCarousel.style.visibility = "visible";
        topicCarousel.style.opacity = ((appShell.scrollTop - topicCarouselHeightPx)/(halfWindowHeight - topicCarouselHeightPx)).toString();
      } else {
        topicCarousel.style.opacity = "0.0";
        topicCarousel.style.visibility = "hidden";
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
    if (pageZero && pageOne) {
      pageZero.className = page === 0 ? 'page-scroller-button-selected' : 'page-scroller-button'
      pageOne.className = page === 1 ? 'page-scroller-button-selected' : 'page-scroller-button'
    }
  }

  const cardShellHeight = vhToPixels(75);
  const cardShellWidth = isMobile ? vwToPixels(75) : vwToPixels(45);
  return (
      <div id={appShellId} className={appShellId} >
        <SearchComponent onSuggestionClick={fetchTopics} />
        <CardsShellComponent id={cardsShellId}
          mediaCard={<TopicImagesComponent topicTitle={topicTitle} maxHeight={cardShellHeight} maxWidth={cardShellWidth}/> }
          commentsCard={<CommentsCardComponent judgment={Judgment.HALAL} topicTitle={topicTitle} numHalalComments={numHalalComments} numHaramComments={numHaramComments} specificComment={state.specificComment} refreshTopic={fetchTopics} switchCards={() => {}}/>} 
          analyticsCard={<AnalyticsCardComponent id={"analytics"}/>}
        />
        <div className="fixed-content">
          <TopicCarouselComponent id={topicCarouselId} iterateTopic={iterateTopic} topicTitle={topicTitle} nextTopicTitle={nextTopic?.topicTitle} prevTopicTitle={prevTopic?.topicTitle} userVote={topic?.vote} halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numTopicVotes} />
          <MenuComponent fetchTopics={fetchTopics} showSpecificComment={showSpecificComment} />
          <PageScrollerComponent pageZeroId={pageZeroId} pageOneId={pageOneId} scrollToPage={scrollToPage} />
        </div>
      </div>
  )
}

const prevNextTopicAnimationDuration = 300;
const animateNextTopic = (cardsShell: HTMLElement | null, callback: () => void) => {
  if(cardsShell) {
    cardsShell.animate([
      {
        transform: 'translate(-100%)'
      }
    ], {
      duration: prevNextTopicAnimationDuration,
      easing: 'ease-in',
      fill: 'forwards',
    }).onfinish = () => {
      callback();
      cardsShell.style.transform = "translate(100%)";
      cardsShell.animate([
        {
          transform: 'translate(100%)'
        }
      ], {
        duration: 0,
        fill: "forwards"
      }).onfinish = () => {
        cardsShell.animate([
          {
            transform: 'translate(0)'
          }
        ], {
          duration: prevNextTopicAnimationDuration,
          easing: 'ease-out',
          fill: "forwards"
        }).onfinish = () => {
          cardsShell.style.transform = "translate(0)";
        }
      }
    }
  };
}

const animatePrevTopic = (cardsShell: any, callback: () => void) => {
  if(cardsShell) {
    cardsShell.animate([
      {
        transform: 'translate(100%)'
      }
    ], {
      duration: prevNextTopicAnimationDuration,
      easing: 'ease-in',
      fill: 'forwards',
    }).onfinish = () => {
      callback();
      cardsShell.style.transform = "translate(-100%)";
      cardsShell.animate([
        {
          transform: 'translate(-100%)'
        }
      ], {
        duration: 0,
        fill: "forwards"
      }).onfinish = () => {
        cardsShell.animate([
          {
            transform: 'translate(0)'
          }
        ], {
          duration: prevNextTopicAnimationDuration,
          easing: 'ease-out',
          fill: "forwards"
        }).onfinish = () => {
          cardsShell.style.transform = "translate(0)";
        }
      }
    }
  };
}