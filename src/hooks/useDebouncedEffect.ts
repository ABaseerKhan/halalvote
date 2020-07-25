import { useCallback, useEffect, useState } from "react";
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';
import { useAsync } from 'react-async-hook';

export const useDebouncedEffect = (effect: any, delay: any, deps: any) => {
    const callback = useCallback(effect, deps);
    const [state] = useState<any>({ pendingCalls: false });

    useEffect(() => {

        const pendingCallsMemo = state.pendingCalls;
        const handler = setTimeout(() => {
            if (pendingCallsMemo) callback();
            state.pendingCalls = false;
        }, delay);

        if (!state.pendingCalls) callback();

        state.pendingCalls = true;

        return () => {
            clearTimeout(handler);
        };

    }, [callback, delay]);
}

export const useDebouncedSearch = (searchFunction: any) => {

    // Handle the input text state
    const [inputText, setInputText] = useState('');

    // Debounce the original search async function
    const debouncedSearchFunction = useConstant(() =>
        AwesomeDebouncePromise(searchFunction, 300)
    );

    // The async callback is run each time the text changes,
    // but as the search function is debounced, it does not
    // fire a new request on each keystroke
    const searchResults = useAsync(
        async () => {
            if (inputText.length === 0) {
            return [];
            } else {
            return debouncedSearchFunction(inputText);
            }
        },
        [debouncedSearchFunction, inputText]
    );

    // Return everything needed for the hook consumer
    return {
        inputText,
        setInputText,
        searchResults,
    };
};