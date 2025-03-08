import { readFile } from "fs/promises";

import {createServer} from "http";
import path from "path";
const PORT=3000;
const server=createServer(async (req,res)=>{
    console.log(req.url);
    if(req.method==="GET"){
        if(req.url==="/"){
            try {
                const data=await readFile(path.join("public","index.html"));
                res.writeHead(200,{"Content-Type": "text/html"});
                res.end(data);
            } catch (error) {
                res.writeHead(404,{"Content-Type": "text/html"});
                res.end("404 page not found");
            }
        }
    }
});
server.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});
