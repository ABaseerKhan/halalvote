import React, { useRef, useEffect, useContext, useState } from 'react';
import { Chart, ChartTooltipItem, ChartData } from "chart.js";
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

    const [displayNumbers, setDisplayNumbers] = useState({ halalNumber: 0, haramNumber: 0});

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
            setDisplayNumbers({ halalNumber: data.halalCounts[data.halalCounts.length-1], haramNumber: data.haramCounts[data.haramCounts.length-1] });
            setAnalyticsContext(topic.topicTitle, newGraph);
        }
    }

    const createGraph = () => {
        const myChartRef = chartRef.current?.getContext("2d");
        const halalCounts = graph?.halalCounts ? graph.halalCounts : [];
        const haramCounts = graph?.haramCounts ? graph.haramCounts : [];
        const maxY = Math.max(...[...halalCounts, ...haramCounts]);
        console.log(maxY / 5);
        const chartYMax = maxY > 1 ? (Math.ceil(maxY / 5) + maxY) : 2;

        Chart.Tooltip.positioners.custom = function(elements, eventPosition) {
            /** @type {Chart.Tooltip} */
        
            return {
                x: elements[0]._view.x +7,
                y: -5,
            };
        };

        Chart.defaults.LineWithLine = Chart.defaults.line;
        Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw: function(ease: any) {
            Chart.controllers.line.prototype.draw.call(this, ease);

            if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                var activePoint = this.chart.tooltip._active[0],
                    ctx = this.chart.ctx,
                    x = activePoint.tooltipPosition().x,
                    topY = this.chart.chartArea.bottom - this.chart.chartArea.top,
                    bottomY = 20;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.chart.tooltip._active[0]._index, x, bottomY-10);
                // draw line
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY+6);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'gray';
                ctx.stroke();
                ctx.restore();
            }
        }
        });
        
        new Chart(myChartRef, {
            type: 'LineWithLine',
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
                    borderWidth: 2,
                    pointHoverRadius: 0,
                },
                {
                    label: 'Haram Votes',
                    data: haramCounts,
                    fill: false,
                    backgroundColor: '#D0ADEB',
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
                hover: {
                    mode: 'x-axis',
                    animationDuration: 0,
                    onHover: (event, activeElements: any) => {
                        event.stopPropagation();
                        if (activeElements.length) { 
                            setDisplayNumbers({ halalNumber: halalCounts[activeElements[0]._index], haramNumber: haramCounts[activeElements[1]._index] });  
                        } },
                    intersect: false,
                },
                tooltips: {
                    enabled: false,
                    custom: function(tooltip) {
                        if (!tooltip) return;
                        // disable displaying the color box;
                        tooltip.displayColors = false;
                    },
                    mode: 'index',
                    intersect: false,
                    axis: 'x',
                    callbacks: {
                        label: (tooltipItem: ChartTooltipItem, data: ChartData): string | string[] => {
                            return tooltipItem.index!.toString();
                        }
                    },
                    filter: (item: ChartTooltipItem, data: ChartData): boolean => {
                        if (item.datasetIndex === 0) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    position: 'custom',
                    caretSize: 0,
                    backgroundColor: 'transparent',
                    bodyFontColor: 'gray',
                    bodyFontSize: 14,
                    bodyFontStyle: 'bold',
                },
                legend: {
                    display: false,
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
                        display: false,
                        gridLines: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            fontColor: 'rgb(197, 197, 197)',
                            callback: (value: number) => { if (Number.isInteger(value)) { return value; } },
                            stepSize: 1,
                            beginAtZero: true,
                            max: chartYMax,
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
                        top: 5,
                        bottom: 5,
                        left: 5,
                        right: 5,
                    }
                }
            }
        });
    }

    const doubleTap = () => {
        setFullScreenModeContext(!fullScreenMode);
    };

    return (
    <div id={id} className={fullScreenMode ? "analytics-fs" : "analytics"} onDoubleClick={doubleTap}>
        <div className={"numeric-display"}>
            <div className="votes-label">Votes</div>
            <div className="numeric-display-halal"><span className="numeric-display-label">Halal</span><span className="numeric-display-value">{displayNumbers.halalNumber}</span></div>
            <div className="numeric-display-haram"><span className="numeric-display-label">Haram</span><span className="numeric-display-value">{displayNumbers.haramNumber}</span></div>
        </div>
        <div className={'canvas-container'} onMouseOut={() => { 
                    setDisplayNumbers({ halalNumber: graph && graph.halalCounts ? graph.halalCounts[graph.halalCounts.length-1] : 0, haramNumber: graph && graph.haramCounts ? graph.haramCounts[graph.haramCounts.length-1] : 0 }); 
                } 
            } >
            <canvas 
                ref={chartRef}
                className="chart" 
                id="myChart"
            />
        </div>
        <div className={fullScreenMode ? "analytics-footer-fullscreen" : "analytics-footer"}>
        </div>
    </div>
    );
}