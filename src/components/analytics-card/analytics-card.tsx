import React, { useRef, useEffect, useContext } from 'react';
import { Chart } from "chart.js";
import { topicsContext, fullScreenContext, analyticsContext, AnalyticsGraph } from '../app-shell';
import { topicsConfig } from '../../https-client/config';
import { AnalyticCounts } from '../../types';
import { getData } from '../../https-client/client';

// type imports

// styles
import './analytics-card.css';

interface AnalyticsCardComponentProps {
    id: string
};

export const AnalyticsCardComponent = (props: AnalyticsCardComponentProps) => {
    const { id } = props;

    const { fullScreenMode, setFullScreenModeContext } = useContext(fullScreenContext);
    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    const { analyticsState, setAnalyticsContext } = useContext(analyticsContext);
    
    const topic = topics?.length ? topics[topicIndex] : undefined;

    const graph = topic?.topicTitle !== undefined ? analyticsState[topic?.topicTitle]?.graph : undefined;

    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (topic?.topicTitle && !analyticsState[topic.topicTitle]) {
            fetchAnalytics();
        } // eslint-disable-next-line
    }, [topic?.topicTitle]);

    useEffect(() => {
        createGraph(); // eslint-disable-next-line
    }, [graph]);

    const fetchAnalytics = async () => {
        let interval = graph?.interval !== undefined ? graph.interval : "D";
        let numIntervals = graph?.numIntervals !== undefined ? graph.numIntervals : 7;

        if (topic?.topicTitle !== undefined) {
            let queryParams: any = { 
                "topicTitle": topic.topicTitle,
                "interval": interval,
                "numIntervals": numIntervals
            };
            let additionalHeaders: any = {};
    
            const { data }: { data: AnalyticCounts } = await getData({ 
                baseUrl: topicsConfig.url,
                path: 'get-topic-analytics',
                queryParams: queryParams,
                additionalHeaders: additionalHeaders,
            });
            
            const newGraph: AnalyticsGraph = {
                interval: interval,
                numIntervals: numIntervals,
                halalCounts: data.halalCounts,
                haramCounts: data.haramCounts
            }
            setAnalyticsContext(topic.topicTitle, newGraph);
        }
    }

    const createGraph = () => {
        const myChartRef = chartRef.current?.getContext("2d");
        const halalCounts = graph?.halalCounts ? graph.halalCounts : [];
        const haramCounts = graph?.haramCounts ? graph.haramCounts : [];
        
        new Chart(myChartRef, {
            type: 'line',
            data: {
                labels: new Array(halalCounts.length).fill(''),
                datasets: [{
                    label: 'Halal Votes',
                    data: halalCounts,
                    fill: false,
                    backgroundColor: '#A9DDD6',
                    borderColor: [
                        '#A9DDD6',
                    ],
                    borderWidth: 3
                }, 
                {
                    label: 'Haram Votes',
                    data: haramCounts,
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
                responsive: true,
                aspectRatio: 1.25,
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        padding: 20,
                        fontFamily: 'verdana, arial, helvetica, sans-serif',
                        fontColor: 'rgb(197, 197, 197)',
                        fontSize: 10,
                        usePointStyle: true,
                    }
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            fontColor: 'rgb(197, 197, 197)',
                            callback: (value: number) => { if (Number.isInteger(value)) { return value; } },
                            stepSize: 1,
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            fontColor: 'rgb(197, 197, 197)',
                            callback: (value: number) => { if (Number.isInteger(value)) { return value; } },
                            stepSize: 1,
                            beginAtZero: true
                        }
                    }],
                }
            }
        });
    }

    const doubleTap = () => {
        setFullScreenModeContext(!fullScreenMode);
    };

    return (
    <div id={id} className={fullScreenMode ? "analytics-fs" : "analytics"} onDoubleClick={doubleTap}>
        <canvas ref={chartRef} className="chart" id="myChart"></canvas>
        <div className={fullScreenMode ? "analytics-footer-fullscreen" : "analytics-footer"}>
        </div>
    </div>
    );
}