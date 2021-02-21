import React, { useState, useEffect, useContext } from 'react';
import { ReactComponent as HeartButtonSVG } from '../../icons/heart-icon.svg';
import { Comment } from '../../types';
import { timeSince, vhToPixels, setCardQueryParam } from '../../utils';
import { modalHeightVh } from '../..';
import { commentsCardId } from '../topic-container/topic-container';
import { useQuery } from '../../hooks/useQuery';
import { 
    useHistory,
} from "react-router-dom";
import { authenticatedGetDataContext } from '../app-shell';
import CommentIcon from '@material-ui/icons/Comment';
import ImageIcon from '@material-ui/icons/Image';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { UserCreatedMedia } from './user-media';
import { usersConfig } from '../../https-client/config';

// styles
import './profile.css';
import { UserTopics } from './user-topics';

enum Tab {
    CREATEDTOPICS,
    VOTEDTOPICS,
    ARGUMENTS,
    CREATEDMEDIA
};

interface ProfileComponentProps {
    username: string,
    fetchTopics: (topicTofetch?: string) => Promise<void>;
    showSpecificComment: any;
    closeModal: any;
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
                {state.selectedTab===Tab.CREATEDTOPICS && <UserTopics profileUsername={props.username} fetchTopics={props.fetchTopics} closeModal={props.closeModal} />}
                {state.selectedTab===Tab.ARGUMENTS && <UserComments profileUsername={props.username} showSpecificComment={props.showSpecificComment} fetchTopics={props.fetchTopics} closeModal={props.closeModal} />}
                {state.selectedTab===Tab.CREATEDMEDIA && <UserCreatedMedia profileUsername={props.username} fetchTopics={props.fetchTopics} closeModal={props.closeModal} />}
            </div>
        </div>
    );
}
interface UserCommentProps {
    profileUsername: string,
    showSpecificComment: any,
    fetchTopics: (topicTofetch?: string) => Promise<void>,
    closeModal: any,
}

interface UserCommentState {
    userComments: Comment[];
}
const UserComments = (props: UserCommentProps) => {
    const { profileUsername, showSpecificComment, fetchTopics, closeModal } = props;

    const { authenticatedGetData } = useContext(authenticatedGetDataContext);

    const query = useQuery();
    const history = useHistory();

    const [state, setState] = useState<UserCommentState>({
        userComments: [],
    });

    useEffect(() => {
        fetchUserComments(); // eslint-disable-next-line
    }, []);

    const fetchUserComments = async () => {
        const { data }: { data: Comment[]} = await authenticatedGetData({ 
            baseUrl: usersConfig.url,
            path: 'user-comments', 
            queryParams: {
                "username": profileUsername,
            },
            additionalHeaders: { },
        }, true);
        setState(prevState => ({ ...prevState, userComments: data }));
    }

    const UserComment = (comment: Comment) => (
        <div id={`comment-${comment.id}`} className={"user-comment-container"} >
            <div className="comment-bubble-container">
                <div className={`comment-bubble-${comment.commentType.toLowerCase()}`}></div>
            </div>
            <div className="comment-body">
                <div 
                    className={"comment-content"}
                    onClick={async (e) => { setCardQueryParam(history, query, commentsCardId.toLowerCase()); await fetchTopics(comment.topicTitle); showSpecificComment(comment); closeModal(); }}
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
                <HeartButtonSVG className={"user-heart"} />
                <div className={"likes"} >{comment.upVotes}</div>
            </div>
        </div>
    );

    return (
        <div className="comments-section-container">
            {state.userComments?.sort((a, b) => { return (new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())}).map((comment) => (
                UserComment(comment)
            ))}
        </div>
    )
}
