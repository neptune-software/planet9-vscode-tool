import * as webpack from 'webpack';
import { Options, RequestHandler, Request, Response } from 'http-proxy-middleware/dist/types'
import * as http from 'http';
import * as keytar from 'keytar';
import * as path from 'path';
import { promises as fs } from 'fs';

interface Config {
    routes: {
        sendCookie: boolean;
        path: string;
    }[];
    server: string;
}

type Proxy = { [route: string]: Options }
export async function planet9Proxy(): Promise<Proxy> {

    const cwd = process.cwd();
    const configPath = path.join(cwd, ".planet9", "config.json")
    const config = <Config>JSON.parse((await fs.readFile(configPath)).toString());

    const obj: Proxy = {};
    const cookie = await getCookie();
    const server = await getServer();

    config.routes.forEach(route => {
        obj[route.path] = {
            target: server,
            secure: false,
            onProxyReq: function onProxyReq(proxyReq: http.ClientRequest, req: Request, res: Response) {
                if (route.sendCookie) {
                    proxyReq.setHeader('cookie', cookie);
                }
            },
            onProxyRes: function onProxyRes(proxyRes: http.IncomingMessage, req: Request, res: Response) {
            }
        };

    });

    return obj;

}

function getServer() {
    const service = 'Neptune-Software';
    const account = 'server';
    return keytar.getPassword(service, account);
}

function getCookie() {
    const service = 'Neptune-Software';
    const account = 'cookie';
    return keytar.getPassword(service, account);
}
