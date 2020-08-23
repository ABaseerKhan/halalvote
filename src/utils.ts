import { Judgment } from "./types";

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

export const vhToPixelsWithMax = (vh: number, max: number) => {
    return Math.min((vh / 100.0) * window.innerHeight, max);
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