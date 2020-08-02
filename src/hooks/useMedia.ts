import { useState, useEffect } from "react";


export const useMedia = (queries: [string], values: Array<any>, defaultValue: any) => {
    // Array containing a media query list for each query
    const mediaQueryLists = queries.map((q: any) => window.matchMedia(q));

    // Function that gets value based on matching media query
    const getValue = () => {
        // Get index of first media query that matches
        const index = mediaQueryLists.findIndex((mql: any) => mql.matches);
        // Return related value or defaultValue if none
        return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
    };

    // State and setter for matched value
    const [value, setValue] = useState(getValue);

    useEffect(
        () => {
            // Event listener callback
            // Note: By defining getValue outside of useEffect we ensure that it has ...
            // ... current values of hook args (as this hook callback is created once on mount).
            const handler = () => setValue(getValue);
            // Set a listener for each media query with above handler as callback.
            mediaQueryLists.forEach((mql: any) => mql.addListener(handler));
            // Remove listeners on cleanup
            return () => mediaQueryLists.forEach((mql: any) => mql.removeListener(handler));
        }, // eslint-disable-next-line
        [] // Empty array ensures effect is only run on mount and unmount
    );

    return value;
}