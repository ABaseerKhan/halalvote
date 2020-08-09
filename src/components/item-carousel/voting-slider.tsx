import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import { ReactComponent as VoteSVG } from '../../icons/vote-icon.svg';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '50%',
        minWidth: '300px',
    },
    margin: {
        height: theme.spacing(3),
    },
}));

type ValueLabelComponentProps = {
    children: JSX.Element,
    open: boolean,
    value: number,
};
function ValueLabelComponent(props: ValueLabelComponentProps) {
    const { children, open, value } = props;

    return (
        <Tooltip open={open} enterTouchDelay={0} placement={"bottom"} title={value}>
            {children}
        </Tooltip>
    );
}

function ThumbComponent(props: any) {
    return (
        <span {...props}>
            <VoteSVG/>
        </span>
    );
}

const PrettoSlider = withStyles({
    root: {
        color: 'gray',
        height: 8,
    },
    thumb: {
        height: 'min-content',
        width: 'min-content',
        backgroundColor: 'transparent',
        marginTop: -23,
        marginLeft: -30,
        borderRadius: '10px',
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
        '& .vote-text': {
            // display: inline-block !important;
            fontSize: '32px',
            color: 'var(--gray)',
            padding: '5px',
            marginLeft: 1,
            marginRight: 1,
        },
    },
    active: {
    },
    valueLabel: {
        left: 'calc(-50% + 4px)',
        '& *': {
            color: 'gray',
            background: '#fff',
        },
    },
    track: {
        height: 8,
        borderRadius: 4,
        background: 'transparent',
    },
    rail: {
        height: '50%',
        borderRadius: 10,
        background: 'linear-gradient(90deg, var(--haram-compliment-color), var(--haram-color), var(--halal-color), var(--halal-compliment-color))',
        opacity: 'unset',
    },
    mark: {
        height: '50%',
        borderRadius: '0',
        backgroundColor: "black",
    }
})(Slider);


type VotingSliderProps = {
    submitVote: (event: Object, value: number | number[]) => void,
    userVote: number | null | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};
export const VotingSlider = (props: VotingSliderProps) => {
    const classes = useStyles();

    const { userVote, halalPoints, haramPoints, numVotes } = props;
    const marks = [
        {
            value: ((halalPoints - haramPoints) / (numVotes)),
            label: ((halalPoints - haramPoints) / (numVotes)).toString(),
        },
    ];
    return (
        <div className={classes.root}>
            {userVote && <PrettoSlider 
                ValueLabelComponent={ValueLabelComponent} 
                ThumbComponent={ThumbComponent}
                marks={numVotes > 0 ? marks : undefined}
                aria-label="pretto slider"
                defaultValue={userVote}
                min={-100}
                max={100}
                onChangeCommitted={props.submitVote}
            />}
            {!userVote && <PrettoSlider 
                ValueLabelComponent={ValueLabelComponent} 
                ThumbComponent={ThumbComponent}
                marks={numVotes > 0 ? marks : undefined}
                aria-label="pretto slider"
                defaultValue={0}
                min={-100}
                max={100}
                onChangeCommitted={props.submitVote}
            />}
        </div>
    )
}