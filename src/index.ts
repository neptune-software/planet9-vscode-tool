import { Options, Request, Response } from 'http-proxy-middleware/dist/types'
import * as http from 'http';
import { join } from 'path';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';

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

const errorFile = join(process.cwd(), ".planet9", "routeErrors.json");
const errorHandlePromise = fs.open(errorFile, 'w');

export async function planet9Proxy(): Promise<Proxy> {

    const cwd = process.cwd();
    const configPath = join(cwd, ".planet9", "config.json")
    const config = <Config>JSON.parse((await fs.readFile(configPath)).toString());

    const obj: Proxy = {};
    const { cookie, url: server } = await getSession();

    config.routes.forEach(route => {
        obj[route.path] = {
            target: server,
            secure: false,
            changeOrigin: true,
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

export async function getProjectName() {
    const cwd = process.cwd();
    const packagePath = join(cwd, "package.json");

    const pkg = await fs.readFile(packagePath);
    const json = JSON.parse(pkg.toString());
    if (!json?.planet9?.projectName) throw Error('Unable to read planet9.projectName from package.json');
    return json.planet9.projectName;
}

async function writeError(url: string, error: Error) {
    const errorFile = await errorHandlePromise;

    await errorFile.appendFile(`{"url": "${url}", "error": "${error.message}"},\n`);
}

async function getSession(): Promise<{ cookie: string, url: string }> {
    try {
        const storagePath = join(tmpdir(), 'ns-temp-storage');
        const b64 = await fs.readFile(storagePath);
        return JSON.parse(Buffer.from(b64.toString(), 'base64').toString('ascii'));
    } catch (e) {
        throw "Unable to read/decode session file";
    }
}
