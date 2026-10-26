import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POST, GET } from '../api/chat.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf'};
const server = createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `127.0.0.1:${port}`}`);
    if (url.pathname.replace(/\/$/,'') === '/api/chat') {
      const request = new Request(url, { method:req.method, headers:req.headers,
        ...(!['GET','HEAD'].includes(req.method) ? {body:Readable.toWeb(req),duplex:'half'} : {}),
      });
      const result = req.method === 'POST' ? await POST(request) : GET();
      res.writeHead(result.status, Object.fromEntries(result.headers));
      return res.end(Buffer.from(await result.arrayBuffer()));
    }
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{Allow:'GET, HEAD'}); return res.end(); }
    let path = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (path !== resolve(root) && !path.startsWith(resolve(root) + sep)) { res.writeHead(403); return res.end(); }
    let info = await stat(path);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(308,{Location:url.pathname + '/' + url.search}); return res.end(); }
      path = resolve(path,'index.html'); info = await stat(path);
    }
    if (!info.isFile() || !(await realpath(path)).startsWith(resolve(root) + sep)) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200,{'Content-Type':types[extname(path).toLowerCase()] || 'application/octet-stream','Content-Length':info.size});
    if (req.method === 'HEAD') return res.end();
    await pipeline(createReadStream(path),res);
  } catch (error) {
    if (res.headersSent) return res.destroy();
    res.writeHead(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400,{'Content-Type':'text/plain'}); res.end('Not found');
  }
});
server.listen(port,'127.0.0.1',() => console.log(`T2T website and chat: http://localhost:${port}`));
