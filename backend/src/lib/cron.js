import https from "node:https";

//every 14 minutes, send a GET request to the frontend health endpoint to keep the app awake
const job = new CronJob("*/14 * * * * *",function(){
    const base = process.env.FRONTEND_URL;
    if (!base) return;
    const url = new URL("/health", base).href;
    const client = url.startsWith("https") ? https : http;
    
    client.get(url,(res) => {
        if (res.statusCode === 200) console.log("GET request sent successfully");
        else console.log("GET request failed", res.statusCode);
    })
    .on("error",(e) => console.log("Error while sending GET request", e));
});

export default job;