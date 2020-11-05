import React, { useRef, useEffect, useContext } from 'react';
import { VotesBar } from './votes-bar';
import { Chart } from "chart.js";

// type imports

// styles
import './analytics-card.css';
import { fullScreenContext } from '../app-shell';

interface AnalyticsCardComponentProps {
    id: string,
    halalPoints: number,
    haramPoints: number,
    numVotes: number
};

export const AnalyticsCardComponent = (props: AnalyticsCardComponentProps) => {
    const { id, halalPoints, haramPoints, numVotes } = props;

    const { fullScreenMode, setFullScreenModeContext } = useContext(fullScreenContext);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        const myChartRef = chartRef.current?.getContext("2d");
        new Chart(myChartRef, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Aprl', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Halal Votes',
                    data: [5, 11, 12, 15, 24, 25, 30, 35, 46, 47, 50, 59],
                    fill: false,
                    backgroundColor: '#A9DDD6',
                    borderColor: [
                        '#A9DDD6',
                    ],
                    borderWidth: 3
                }, 
                {
                    label: 'Haram Votes',
                    data: [0, 2, 6, 12, 12, 13, 24, 45, 56, 57, 60, 69],
                    fill: false,
                    backgroundColor: '#D0ADEB',
                    borderColor: [
                        '#D0ADEB',
                    ],
                    borderWidth: 3
                }
            ]
            },
            options: {
                legend: {
                    labels: {
                        fontFamily: 'verdana, arial, helvetica, sans-serif',
                        fontColor: 'var(--dark-mode-text-color)',
                        fontSize: 12
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: 'var(--dark-mode-text-color)',
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: 'var(--dark-mode-text-color)',
                        }
                    }],
                }
            }
        });
    }, []);

    const doubleTap = () => {
        setFullScreenModeContext(!fullScreenMode);
    };

    return (
    <div id={id} className={fullScreenMode ? "analytics-fs" : "analytics"} onDoubleClick={doubleTap}>
        <VotesBar halalPoints={halalPoints} haramPoints={haramPoints} numVotes={numVotes}></VotesBar>
        <canvas ref={chartRef} className="chart" id="myChart"></canvas>
        <div className={fullScreenMode ? "analytics-footer-fullscreen" : "analytics-footer"}>
        </div>
    </div>
    );
}