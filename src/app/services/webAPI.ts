import { SecurityAPI, UserAPI, ProfileAPI,RecyclingbankAPI, DeviceAPI, ManufacturerAPI, ConnectAPI, LikeAPI } from "./settings/wrappers";
import { baseURL } from "./settings/base.url";
import { FetchProxy } from "./settings/fetch.proxy";
import { StorageKeys } from "./../settings/constats";
import { StorageService } from "./clients/storage.service";

export module WebAPI
{
    const storageService: StorageService = new StorageService();

    const proxy = new FetchProxy();
    proxy.bearerToken = getToken()!;

    let signOutCallback: (() => void) | null = null;

    export const Security: SecurityAPI = new SecurityAPI(baseURL, proxy);
    export const RecyclingBank: RecyclingbankAPI = new RecyclingbankAPI(baseURL, proxy);
    export const User: UserAPI = new UserAPI(baseURL, proxy);
    export const Profile: ProfileAPI = new ProfileAPI(baseURL, proxy);
    export const Device: DeviceAPI = new DeviceAPI(baseURL, proxy);
    export const Manufacturer: ManufacturerAPI = new ManufacturerAPI(baseURL, proxy);
    export const Connect: ConnectAPI = new ConnectAPI(baseURL, proxy);
    export const Like: LikeAPI = new LikeAPI(baseURL, proxy);

    export function attachToConnectionCallback(callback: (res: Response) => void)
    {
        proxy.attachToConnectionCallback(callback);
    }

    export function clearConnectionCallback()
    {
        proxy.clearConnectionCallback();
    }

    export function IsTokenAssigned() : boolean
    {
        const token = getToken();
        return  token != null &&  token !== undefined;
    }

    export function getToken() : string | undefined
    {
        const token: string | undefined = storageService.read<string>(StorageKeys.JWT);
        return token;
    }
    export function setToken(value: string) {
        storageService.write(StorageKeys.JWT, value);
        proxy.bearerToken = value;
    } 
}