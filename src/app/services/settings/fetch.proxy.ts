
// This class is used to inject our custom fetch method
// to swagger generated code that expects fetch function
// that will be used for, you guess, fetch calls, as we
// need to provide it anyway, we also want to handle our
// own logic, for instance, we want to check for failed
// fetch attemps, like 404, and create our custom logic
// for timeout
export class FetchProxy
{
    private connectionCallback: ((res: Response) => void) | null = null;

    bearerToken: string | undefined;

    attachToConnectionCallback(callback: (res: Response) => void)
    {
        this.connectionCallback = callback;
    }

    clearConnectionCallback()
    {
        this.connectionCallback = null;
    }

    async fetch(url: RequestInfo, init?: RequestInit): Promise<Response>
    {

        const newHeaders =
        {
            ...init!.headers,
            ...(this.bearerToken ? { Authorization: "Bearer " + this.bearerToken } : {})
        }

        const newInit =
        {
            ...init!,
            //...{ credentials: "include" as "include" },
            ...{ headers: newHeaders }
        };

        const promise1 = fetch(url, newInit)
        const promise2 = new Promise<Response>((resolve) => setTimeout(() => resolve(undefined), 86400));

        const res = await Promise.race([promise1, promise2])

        if (res === undefined)
        {
               throw new Error(`Timeout expired for url: ${url}`);
        }

        if (this.connectionCallback != null)
        {
               this.connectionCallback(res);
        }

        return res;
    }
}

export class TimeoutError extends Error
{
    constructor(message?: string)
    {
        super(message)
    }

    protected isTimeoutError = true;

    static isTimeoutError(obj: any): obj is TimeoutError
    {
        return obj.isTimeoutError === true;
    }
}

export interface FetchResultCallbacks
{
    success: (res: Response) => void;
    fail: (error: any) => void;
}