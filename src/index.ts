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
        errors: {
            error: string
        }[]
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
            },
            onError: async function onError(err: Error, req: Request, res: Response) {
                const route = config.routes.find(r => r.path === req.url);
                console.log("error", err);
                if (route) {
                    await writeError(req.url, err)
                }
            }
        };

    });

    return obj;

}

const errorFile = path.join(process.cwd(), ".planet9", "routeErrors.json");
const errorHandlePromise = fs.open(errorFile, 'w');

async function writeError(url: string, error: Error) {
    const errorFile = await errorHandlePromise;

    await errorFile.appendFile(`{"url": "${url}", "error": "${error.message}"},\n`);

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
