# Fork of JoJo Labs

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/kara-ecos-globals-projects/v0-online-store-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/EyrysbhQECD)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/kara-ecos-globals-projects/v0-online-store-design](https://vercel.com/kara-ecos-globals-projects/v0-online-store-design)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/EyrysbhQECD](https://v0.app/chat/EyrysbhQECD)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## iPay (BPC Arca) Integration

Set the following environment variables in Vercel or your local `.env` file:

```
IPAY_BASE_URL=https://ipaytest.arca.am:8445/payment/rest/
IPAY_USERNAME=your-ipay-username
IPAY_PASSWORD=your-ipay-password
```

If `IPAY_BASE_URL` is not set, the integration defaults to the test URL.

Switch between test and production by changing `IPAY_BASE_URL`:

- Test: `https://ipaytest.arca.am:8445/payment/rest/`
- Production: `https://ipay.arca.am/payment/rest/`

The return page verifies payment status against iPay. The demo integration stores the `{orderNumber -> orderId}` mapping in memory, which is not reliable on serverless platforms. Persist this mapping in your database for production use.
