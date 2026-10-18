import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const name=url.pathname==='/'?'/index.html':url.pathname;if(!['/index.html','/style.css','/app.js','/model.js'].includes(name)){res.writeHead(404);return res.end('Not found');}const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}const data=await readFile(file);res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript'})[file.split('.').pop()]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Ads manager running on port '+(process.env.PORT||3000)));
