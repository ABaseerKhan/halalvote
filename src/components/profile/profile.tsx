import React, { useState, useEffect, useContext } from 'react';
import { Comment } from '../../types';
import { timeSince, vhToPixels, setCardQueryParam, modifyTopicQueryParam, deleteUserProfileQueryParam } from '../../utils';
import { modalHeightVh } from '../..';
import { commentsCardId } from '../topic-container/topic-container';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { authenticatedGetDataContext, commentsContext } from '../app-shell';
import CommentIcon from '@material-ui/icons/Comment';
import ImageIcon from '@material-ui/icons/Image';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { UserCreatedMedia } from './user-media';
import { usersAPIConfig } from '../../https-client/config';
import { UserTopics } from './user-topics';
import { HeartLike } from '../heart-like/heart-like';
import { SkeletonComponent } from "../comments/comments-skeleton";

// styles
import './profile.css';
import { closeModalContext } from '../modal/modal';

enum Tab {
    CREATEDTOPICS,
    VOTEDTOPICS,
    ARGUMENTS,
    CREATEDMEDIA
};

interface ProfileComponentProps {
    username: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>;
};
interface State {
    selectedTab: Tab | undefined;
}

export const ProfileComponent = (props: ProfileComponentProps) => {
    const [state, setState] = useState<State>({ 
        selectedTab: Tab.CREATEDTOPICS,
    });

    useEffect(() => {
        onCreatedTopicsTab(); // eslint-disable-next-line
    }, []);

    const onCreatedTopicsTab = () => {
        setState({ ...state, selectedTab: Tab.CREATEDTOPICS });
    }

    const onArgumentsTab = () => {
        setState({ ...state, selectedTab: Tab.ARGUMENTS });
    }

    const onCreatedMediaTab = () => {
        setState({ ...state, selectedTab: Tab.CREATEDMEDIA });
    }

    return (
        <div className="profile-container" style={{ height: `${vhToPixels(modalHeightVh)}px`}}>
            <div className="profile-header-section">
                <div className="profile-title">{`${props.username}`}</div> 
                <div className="profile-tabs">
                    <div className={state.selectedTab===Tab.CREATEDTOPICS ? "profile-tab-selected" : "profile-tab"} onClick={onCreatedTopicsTab} ><AssignmentIcon/></div>
                    <div className={state.selectedTab===Tab.ARGUMENTS ? "profile-tab-selected" : "profile-tab"} onClick={onArgumentsTab} ><CommentIcon/></div>
                    <div className={state.selectedTab===Tab.CREATEDMEDIA ? "profile-tab-selected" : "profile-tab"} onClick={onCreatedMediaTab} ><ImageIcon/></div> 
                </div>
            </div>

            <div className="profile-body">
                {state.selectedTab===Tab.CREATEDTOPICS && <UserTopics profileUsername={props.username} fetchTopics={props.fetchTopics} />}
                {state.selectedTab===Tab.ARGUMENTS && <UserComments profileUsername={props.username} fetchTopics={props.fetchTopics} />}
                {state.selectedTab===Tab.CREATEDMEDIA && <UserCreatedMedia profileUsername={props.username} fetchTopics={props.fetchTopics} />}
            </div>
        </div>
    );
}
interface UserCommentProps {
    profileUsername: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
}

interface UserCommentState {
    userComments: Comment[];
    loading: boolean;
}
const UserComments = (props: UserCommentProps) => {
    const { profileUsername, fetchTopics } = props;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    const { closeModal } = useContext(closeModalContext);
    const { setCommentsContext } = useContext(commentsContext);

    const query = useQuery();
    const history = useHistory();

    const [state, setState] = useState<UserCommentState>({
        userComments: [],
        loading: true,
    });

    useEffect(() => {
        fetchUserComments(); // eslint-disable-next-line
    }, []);

    const fetchUserComments = async () => {
        const { data }: { data: Comment[]} = await authenticatedGetData({ 
            baseUrl: usersAPIConfig.url,
            path: 'user-comments',
            queryParams: {
                "username": profileUsername,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userComments: data, loading: false }));
    }

    const selectCommentHandler = async (comment: Comment) => {
        deleteUserProfileQueryParam(history, query);
        await fetchTopics(comment.topicTitle);
        modifyTopicQueryParam(query, comment.topicTitle!);
        setCardQueryParam(history, query, commentsCardId.toLowerCase());
        setCommentsContext(comment.topicTitle!, [], comment);
    }

    const UserComment = (comment: Comment) => (
        <div key={`comment-${comment.id}`} id={`comment-${comment.id}`} className={"user-comment-container"} >
            <div className="comment-bubble-container">
                <div className={`comment-bubble-${comment.commentType.toLowerCase()}`}></div>
            </div>
            <div className="comment-body"> 
                <div 
                className={"comment-content"}
                onClick={() => { closeModal(async () => { selectCommentHandler(comment); }); }}
                >
                    <div className="topic-header">{comment.topicTitle}</div>
                    <div className="user-comment">
                        <div style={{ maxWidth: 'calc(100% - 50px)' }} dangerouslySetInnerHTML={{__html: comment.comment}}/>
                    </div>
                    <div>
                        <span className={"time-stamp"} style={{ color: 'var(--dark-mode-secondary-text-color)' }} >{timeSince(comment.timeStamp)}</span>
                    </div>
                </div>
            </div>  
            <div className="user-likes-container">
                <HeartLike liked={!!comment.userVote} numLikes={comment.upVotes} onClickCallback={() => {}} />
            </div>
        </div>
    );

    return (
        state.loading ? <SkeletonComponent /> : 
            <div className="comments-section-container">
                {state.userComments?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((comment) => (
                    UserComment(comment)
                ))}
            </div>
    )
}
