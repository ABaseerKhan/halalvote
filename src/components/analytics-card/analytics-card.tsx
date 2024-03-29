import React, { useRef, useEffect, useContext, useState, useMemo } from 'react';
import { Chart } from "chart.js";
import { topicsContext, analyticsContext, AnalyticsGraph } from '../app-shell';
import { topicsAPIConfig } from '../../https-client/config';
import { AnalyticCounts } from '../../types';
import { authenticatedGetDataContext } from '../app-shell';

// type imports

// styles
import './analytics-card.css';

export enum Interval {
    WEEK,
    MONTH,
    YEAR,
    ALL
};

interface AnalyticsCardComponentProps {
    id: string,
    topicIndexOverride?: number
};

export const AnalyticsCardComponent = (props: AnalyticsCardComponentProps) => {
    const { id } = props;

    const [displayNumbers, setDisplayNumbers] = useState({ halalNumber: 0, haramNumber: 0});

    const { topicsState: { topics, topicIndex } } = useContext(topicsContext);
    const { analyticsState, setAnalyticsContext } = useContext(analyticsContext);
    const { authenticatedGetData } = useContext(authenticatedGetDataContext);
    
    const topic = topics?.length ? topics[topicIndex] : undefined;

    const interval = analyticsState.interval;
    const graph = topic?.topicTitle !== undefined ? analyticsState.topicAnalyticsMap[topic?.topicTitle]?.graph : undefined;

    const myChart = useRef<Chart|null>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (topic?.topicTitle && (analyticsState.topicAnalyticsMap[topic.topicTitle]?.graph?.interval !== interval)) {
            fetchAnalytics(interval);
        } // eslint-disable-next-line
    }, [topic?.topicTitle]);

    useEffect(() => {
        if (graph) {
            setDisplayNumbers({ halalNumber: graph && graph.halalCounts ? graph.halalCounts[graph.halalCounts.length-1] : 0, haramNumber: graph && graph.haramCounts ? graph.haramCounts[graph.haramCounts.length-1] : 0 });
            createGraph();
        } // eslint-disable-next-line
    }, [graph]);

    const fetchAnalytics = async (newInterval: Interval) => {
        let intervalOverride = newInterval === Interval.ALL ? "a" : "D";

        if (topic?.topicTitle !== undefined) {
            let queryParams: any = { 
                "topicTitle": topic.topicTitle,
                "interval": intervalOverride,
                "numIntervals": getNumIntervals(newInterval)
            };
            let additionalHeaders: any = {};
    
            const { data }: { data: AnalyticCounts } = await authenticatedGetData({ 
                baseUrl: topicsAPIConfig.url,
                path: 'get-topic-analytics',
                queryParams: queryParams,
                additionalHeaders: additionalHeaders,
            }, true);
            
            const newGraph: AnalyticsGraph = {
                interval: newInterval,
                numIntervals: data.halalCounts?.length || 0,
                halalCounts: data.halalCounts,
                haramCounts: data.haramCounts
            }
            setAnalyticsContext(topic.topicTitle, newGraph, newInterval);
        }
    }

    const dates = useMemo(() => {
        if (graph) {
            let dates: number[] = [];
            const today = new Date();
            for (let i = graph.numIntervals-1; i >= 0; i--) {
                dates.push(new Date().setDate(today.getDate()-i));
            };
            return dates;
        } else return [];
    }, [graph]);

    const createGraph = () => {
        if (myChart.current) {
            myChart.current.destroy();
        };
        const myChartRef = chartRef.current?.getContext("2d");
        const halalCounts = graph?.halalCounts ? graph.halalCounts : [];
        const haramCounts = graph?.haramCounts ? graph.haramCounts : [];

        Chart.defaults.LineWithLine = Chart.defaults.line;
        Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw: function(ease: any) {
            Chart.controllers.line.prototype.draw.call(this, ease);

            if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                var activePoint = this.chart.tooltip._active[0],
                    ctx: CanvasRenderingContext2D = this.chart.ctx,
                    x = activePoint.tooltipPosition().x,
                    topY = this.chart.chartArea.bottom - this.chart.chartArea.top,
                    bottomY = 20;

                const dateDisplay = new Date(dates[this.chart.tooltip._active[0]._index]).toLocaleString(undefined, { month: 'short', day: 'numeric'});
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgb(124, 124, 124)';
                ctx.fillText(dateDisplay, x, bottomY-10);
                // draw line
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY+20);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(124, 124, 124)';
                ctx.stroke();
                ctx.restore();
            }
        }
        });
        
        myChart.current = new Chart(myChartRef, {
            type: 'LineWithLine',
            data: {
                labels: new Array(halalCounts.length).fill(''),
                datasets: [{
                    label: 'Halal Votes',
                    data: halalCounts,
                    fill: false,
                    borderColor: [
                        '#A9DDD6',
                    ],
                    borderWidth: 2,
                    pointHoverRadius: 0,
                },
                {
                    label: 'Haram Votes',
                    data: haramCounts,
                    fill: false,
                    borderColor: [
                        '#D0ADEB',
                    ],
                    borderWidth: 2,
                    pointHoverRadius: 0,
                }
            ]
            },
            options: {
                responsive: true,
                aspectRatio: 1.75,
                events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
                hover: {
                    mode: 'x-axis',
                    animationDuration: 0,
                    onHover: (event, activeElements: any) => {
                        if (event.type === 'touchmove' || event.type === 'touchstart') { event.stopPropagation(); };
                        if (event.type === 'touchend' || event.type === 'mouseout') {
                            setDisplayNumbers({ halalNumber: graph && graph.halalCounts ? graph.halalCounts[graph.halalCounts.length-1] : 0, haramNumber: graph && graph.haramCounts ? graph.haramCounts[graph.haramCounts.length-1] : 0 });
                        }
                        if (activeElements.length) { 
                            setDisplayNumbers({ halalNumber: halalCounts[activeElements[0]._index], haramNumber: haramCounts[activeElements[1]._index] });  
                        } },
                    intersect: false,
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    intersect: false,
                    axis: 'x',
                },
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        display: false,
                        gridLines: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            fontColor: 'rgb(197, 197, 197)',
                            callback: (value: number) => { if (Number.isInteger(value)) { return value; } },
                            stepSize: 1,
                            beginAtZero: true,
                        },
                    }],
                    xAxes: [{
                        display: false,
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
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20,
                    }
                }
            }
        });
    }

    const changeInterval = (newInterval: Interval) => {
        fetchAnalytics(newInterval);
    };

    return (
    <div id={id} className={"analytics"}>
        <div className={"numeric-display"}>
            <div className="numeric-display-title">Votes</div>
            <div className="numeric-display-body">
                <div className="numeric-display-haram"><span className="numeric-display-label">Haram</span><span className="numeric-display-value">{displayNumbers.haramNumber}</span></div>
                <div className="numeric-display-separator">::</div>
                <div className="numeric-display-halal"><span className="numeric-display-label">Halal</span><span className="numeric-display-value">{displayNumbers.halalNumber}</span></div>
            </div>
        </div>
        <div className={'canvas-container'}>
            <canvas 
                ref={chartRef}
                className="chart" 
                id="myChart"
            />
            <div className={'interval-selector-container'}>
                <div onClick={() => changeInterval(Interval.ALL)} className={interval === Interval.ALL ? 'interval-selector-selected' : 'interval-selector'}>All</div>
                <div onClick={() => changeInterval(Interval.WEEK)} className={interval === Interval.WEEK ? 'interval-selector-selected' : 'interval-selector'}>1W</div>
                <div onClick={() => changeInterval(Interval.MONTH)} className={interval === Interval.MONTH ? 'interval-selector-selected' : 'interval-selector'}>1M</div>
                <div onClick={() => changeInterval(Interval.YEAR)} className={interval === Interval.YEAR ? 'interval-selector-selected' : 'interval-selector'}>1Y</div>
            </div>
        </div>
    </div>
    );
}

const getNumIntervals = (interval: Interval) => {
    switch(interval) {
        case Interval.WEEK:
            return 7;
        case Interval.MONTH:
            return 30;
        case Interval.YEAR:
            return 365;
        case Interval.ALL:
            return -1;
    }
}