import { useCallback, useEffect, useState } from "react";

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callback, delay]);
}
