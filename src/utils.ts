import { Judgment } from "./types";
import imageCompression from 'browser-image-compression';
import ReactGA from 'react-ga';

const dateTimeOptions = { year: 'numeric', month: 'numeric', day: '2-digit', hour: 'numeric', minute:'2-digit'};

export const convertUTCDateToLocalDate = (dateString: string): string => {
    const date = new Date(dateString.replace(/-/g, "/"));
    var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000).toLocaleString([], dateTimeOptions);
    return newDate;
}

export const timeSince = (timeStampString: string) => {
    const timeStamp = new Date(timeStampString.replace(/-/g, "/") + " UTC");
    const now = new Date();
    const elapsed = now.getTime() - timeStamp.getTime()

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerYear = msPerDay * 365;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed/1000) + 's';   
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + 'm';   
    }

    else if (elapsed < msPerDay ) {
        return Math.round(elapsed/msPerHour ) + 'h';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerDay) + 'd';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years';   
    }
}

export const vhToPixels = (vh: number) => {
    return (vh / 100.0) * window.innerHeight;
}

export const vwToPixels = (vw: number) => {
    return (vw / 100.0) * window.innerWidth;
}

export const vhToPixelsWithMax = (vh: number, max: number) => {
    return Math.min((vh / 100.0) * window.innerHeight, max);
}

export const vwToPixelsWithMax = (vw: number, max: number) => {
    return Math.min((vw / 100.0) * window.innerWidth, max);
}

// Move array element from an old_index to a new_index+1 and return the new_index+1
// Note that this mutates the array (in place operation)
export const arrayMove = (arr: Array<any>, old_index: number, new_index: number): number => {
    if (old_index === new_index) return old_index;
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index+1, 0, arr.splice(old_index, 1)[0]);
    return new_index+1;
};

export const getRandomJudment = (): Judgment => {
    return Math.floor(Math.random() * 2);
};

export var isMobile = window.matchMedia("(max-width: 600px)").matches;

export function getCookie(cname: string) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function getImageDimensionsFromSource(src: string) {
    return new Promise<{ height: number, width: number }>((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve({ height: img.height, width: img.width });
        img.onerror = reject
        img.src = src
    })
}

/**
    Returns the dimensions of a video asynchrounsly.
    @param {String} url Url of the video to get dimensions from.
    @return {Promise} Promise which returns the dimensions of the video in 'width' and 'height' properties.
 */
export function getVideoDimensionsOf(url: string){
	return new Promise<{ height: number, width: number }>(function(resolve){
		// create the video element
		let video = document.createElement('video');

		// place a listener on it
		video.addEventListener( "loadedmetadata", function () {
			// retrieve dimensions
			let height = this.videoHeight;
			let width = this.videoWidth;
			// send back result
			resolve({
				height : height,
				width : width
			});
		}, false );

		// start download meta-datas
		video.src = url;
	});
}

export async function resizeImage(file: File) {
    const options = { 
        maxSizeMB: 1,
        fileType: file.type
    }
    
    const compressedImage = await imageCompression(file, options);
    return imageCompression.getDataUrlFromFile(compressedImage);
}

export const replaceHistory = async (history: any, query: URLSearchParams) => {
    await history.replace({
        search: "?" + query.toString()
    });
    if (process.env.REACT_APP_GA_TRACKING_ID_HALAL || process.env.REACT_APP_GA_TRACKING_ID_HARAM) {
        ReactGA.pageview(query.toString());
    };
};

export const setCardQueryParam = async (history: any, query: URLSearchParams, cardId: string) => {
    if (query.has('card')) {
        query.set('card', cardId);
    } else {
        query.append('card', cardId);
    };
    await replaceHistory(history, query);
};

export const deleteUserProfileQueryParam = async (history: any, query: URLSearchParams) => {
    if (query.has('userProfile')) {
        query.delete('userProfile');
        
        history.replace({
            search: "?" + query.toString()
        });
    }
}

export const formatTopicTitle = (topicTitle: string): string => {
    return topicTitle.replace(/ /g,"_");
}

export const modifyTopicQueryParam = async (query: URLSearchParams, topicTitle: string) => {
    const formattedTopicTitle = formatTopicTitle(topicTitle);
    if (query.has('topic')) {
        query.set('topic', formattedTopicTitle);
      } else {
          query.append('topic', formattedTopicTitle);
      };
}

export const nFormatter = (num: number, digits: number) => {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "B" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}