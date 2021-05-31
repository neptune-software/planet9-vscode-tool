import { Options } from 'http-proxy-middleware/dist/types';
declare type Proxy = {
    [route: string]: Options;
};
export declare function planet9Proxy(): Promise<Proxy>;
export declare function getProjectName(): Promise<any>;
export {};
