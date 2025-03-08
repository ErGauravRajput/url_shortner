
import { readFile ,writeFile} from "fs/promises";
import crypto from "crypto";
import {createServer} from "http";
import path from "path";
import { fileURLToPath } from "url";

const PORT=3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const data_file=path.join("data","links.json");
const DATA_FILE=path.join(__dirname,"data","links.json");

const serverFile=async(res,pathFile,type )=>{
    try {
        const fullPath = path.join(__dirname, pathFile);
        const data=await readFile(fullPath,"utf-8");
        res.writeHead(200,{"Content-Type": type});
        res.end(data);
    } catch (error) {
        res.writeHead(404,{"Content-Type": type});
        res.end("404 page not found");
    }
};
const loadLinks=async ()=>{
    try {
        const data=await readFile(DATA_FILE,"utf-8");
        return JSON.parse(data);
    } catch (error) {
        if(error.code==="ENOENT"){
            await writeFile(DATA_FILE,JSON.stringify({}));
        return {};
        }
        throw error;
    }
};
const saveLinks=async(links)=>{
    await writeFile(DATA_FILE,JSON.stringify(links));
}
const server=createServer(async (req,res)=>{
    // console.log(req.url);
    if(req.method==="GET"){
        if(req.url==="/"){
            return serverFile(res,path.join("public","index.html"),"text/html");
        }
        else if(req.url==="/style.css"){
            return serverFile(res,path.join("public","style.css"), "text/css");
        }
        else if(req.url==="/links"){
            const links=await loadLinks();
            res.writeHead(200,{"Content-Type": "application/json"});
            return res.end(JSON.stringify(links));
        }
        else{
            const links=await loadLinks();
            const shortCode=req.url.slice(1);
            console.log(req.url);
            if(links[shortCode])
            {
                res.writeHead(302,{location :links[shortCode]});
                return res.end();
            }
            res.writeHead(404,{"Content-Type": "text/plain"});
            return res.end("shortened URL is Not Found");
        }
    }
    if(req.method==="POST" && req.url==="/shorten"){
        const links=await loadLinks();
        let body="";
        req.on("data",(chunks)=>body+=chunks);
        req.on("end",async()=>{
            console.log(body);
            const {url,shortCode}=JSON.parse(body);
            if(!url)
            {
                res.writeHead(400,{"Content-Type": "text/plain"});
                return res.end("URL is required");
            }
            const finalShortCode=shortCode || crypto.randomBytes(4).toString("hex");
            if(links[finalShortCode]){
                res.writeHead(400,{"Content-Type": "text/plain"});
                return res.end("short code already present");
            }
            links[finalShortCode]=url;
            await saveLinks(links);

             res.writeHead(200,{"Content-Type": "application/json"});
             res.end(JSON.stringify({success:true,shortCode:finalShortCode}))
        });
    }
});
server.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});
