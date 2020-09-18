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

// Tune deltaMin according to your needs. Near 0 it will almost
// always trigger, with a big value it can never trigger.
export function detectSwipe(el: any, func: any, deltaMin = 90) {
    const swipe_det = {
      sX: 0,
      sY: 0,
      eX: 0,
      eY: 0
    }
    // Directions enumeration
    const directions = Object.freeze({
      UP: 'up',
      DOWN: 'down',
      RIGHT: 'right',
      LEFT: 'left'
    })
    let direction = null
    el.addEventListener('touchstart', function(e: any) {
      const t = e.touches[0]
      swipe_det.sX = t.screenX;
      swipe_det.sY = t.screenY;
    }, false)
    el.addEventListener('touchmove', function(e: any) {
      // Prevent default will stop user from scrolling, use with care
      const t = e.touches[0]
      if (Math.abs(t.screenX - swipe_det.sX) > (Math.abs(t.screenY - swipe_det.sY))/2) e.preventDefault();
    }, false)
    const touchendCb = function(e: any) {
        const deltaX = swipe_det.eX - swipe_det.sX
        const deltaY = swipe_det.eY - swipe_det.sY
        // Min swipe distance, you could use absolute value rather
        // than square. It just felt better for personnal use
        if (deltaX ** 2 + deltaY ** 2 < deltaMin ** 2) return
        // horizontal
        if (deltaY === 0 || Math.abs(deltaX / deltaY) > 1)
          direction = deltaX > 0 ? directions.RIGHT : directions.LEFT
        else // vertical
          direction = deltaY > 0 ? directions.UP : directions.DOWN
    
        if (direction && typeof func === 'function') { el.removeEventListener('touchend', touchendCb); func(el, direction); console.log('called func') };
        direction = null;
    };
    el.addEventListener('touchend', touchendCb, false);
  }

export function getImageDimensionsFromSource(src: string) {
    return new Promise<{ height: number, width: number }>((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve({ height: img.height, width: img.width });
        img.onerror = reject
        img.src = src
    })
}