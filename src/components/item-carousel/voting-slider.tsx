import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

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
        <Tooltip open={open} enterTouchDelay={0} placement={"top"} title={value}>
            {children}
        </Tooltip>
    );
}

function ThumbComponent(props: any) {
    return (
        <span {...props}>
            <div className="voter">vote</div>
        </span>
    );
}

const PrettoSlider = withStyles({
    root: {
        color: 'gray',
        height: 8,
    },
    thumb: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        marginTop: -17,
        marginLeft: -25,
        '&:focus, &:hover, &$active': {
            boxShadow: '#ccc 3px',
        },
        '& .voter': {
            display: 'table',
            lineHeight: '2.3',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            fontSize: '20px',
            color: '#d4d4d4',
            textAlign: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--neutral-color)',
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
        width: '3px',
        borderRadius: '0',
        backgroundColor: "black",
    },
    markLabel: {
        wordWrap: 'break-word',
        display: 'block',
        top: '-20%',
        fontSize: '14px',
        color: 'var(--neutral-color)',
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
            label: `${numVotes} votes`,
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