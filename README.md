
# FluxETL: Low-code Pipeline Builder

## Setup Guide

### 1. Install Vite & Vue Globally

```sh
npm install -g vite vue
```

### 2. Install TypeScript

Install locally:

```sh
npm install typescript --save-dev
```

Or globally:

```sh
npm install -g typescript
```

### 3. Run the Dev Server

```sh
npm run dev
```

### 4. Start Docker Services

From the ETL-Project root directory (make sure Docker Desktop is running):

```sh
docker compose -f docker-compose.yml up -d
```

Wait 5–10 seconds.

### 5. Create a Topic

```sh
.\create-topics.ps1
```

### 6. (Optional) Start the Test Source API

You can use any API that returns JSON. The test API just makes it easier:

```sh
TestSourceApi
```

### 7. Run Backend Services

Start the following backend services:

- `ExtractAPI`
- `Transform`
- `Load`
- `ETLConfigAPI`
