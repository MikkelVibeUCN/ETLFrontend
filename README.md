FluxETL: Low-code pipeline builder

Setup Guide

1. Install Vite & Vue Globally
    npm install -g vite vue

2. Install TypeScript
    npm install typescript --save-dev
Or global
    npm install -g typescript

3. Run the Dev Server
    npm run dev

From the ETL-Project root directory (make sure Docker Desktop is running):

    docker compose -f docker-compose.yml up -d

Wait 5-10 seconds

Create a topic

    .\create-topics.ps1
    
Optional: Start the test source API (you can use any API that returngs JSON, the test API just makes it easier)

    TestSourceApi

Now run the backend

- ExtractAPI
- Transform
- Load
- ETLConfigAPI
