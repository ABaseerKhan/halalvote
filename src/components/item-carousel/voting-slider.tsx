import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '50%',
        minWidth: '350px',
    },
    margin: {
        height: theme.spacing(3),
    },
}));

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
            color: 'var(--site-background-color)',
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
        display: 'none'
    },
    markLabel: {
        top: 'unset',
        fontSize: '16px',
        lineHeight: 'unset',
        fontWeight: 600,
    }
})(Slider);


type VotingSliderProps = {
    submitVote: (value: number) => void,
    userVote: number | undefined,
    halalPoints: number,
    haramPoints: number,
    numVotes: number,
};
export const VotingSlider = (props: VotingSliderProps) => {
    const classes = useStyles();
    const { userVote, halalPoints, haramPoints, numVotes } = props;

    const [state, setState] = useState<{ value: number | undefined }>({ value: 0 });

    useEffect(() => {
        if (userVote !== undefined) {
            setState({ value: userVote });
        };
    }, [userVote]);

    const marks = [
        {
            value: numVotes > 0 ? ((halalPoints - haramPoints) / (numVotes)) : 0,
            label: (
                <span {...props}>
                    <div className="average-votes-mark"></div>
                </span>
            ),
        },
        {
            value: -99,
            label: <span style={{ color: '#401d5a', position: 'absolute', transform: 'translate(0%, -95%)' }}>{'haram (حرام)'}</span>
        },
        {
            value: 99,
            label: <span style={{ color: '#1c4d44', position: 'absolute', transform: 'translate(-100%, -95%)' }}>{'halal (حلال)'}</span>
        },
    ];

    const onChangeCommitted = (event: Object, value: number | number[]) => {
        if (value < 10 && value > -10) {
            setState({ value: 0 });
            props.submitVote(0);
        } else {
            props.submitVote(value as number);
        }
    };

    const onChange = (event: Object, value: number | number[]) => {
        setState({ value: value as number });
    };
    
    return (
        <div className={classes.root}>
            <PrettoSlider 
                ThumbComponent={ThumbComponent}
                marks={marks}
                aria-label="pretto slider"
                value={state.value}
                min={-100}
                max={100}
                onChangeCommitted={onChangeCommitted}
                onChange={onChange}
            />
        </div>
    )
}