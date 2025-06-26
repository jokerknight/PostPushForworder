英文|[中文](https://github.com/jokerknight/PostPushForworder/blob/main/README.zh-CN.md)
# PostPushForworder

Automatically forward post-publish events from Halo and WordPress blogs to multiple platforms:  
- ✈️ Telegram
- #️⃣ Slack
- 🎮 Discord
- 💼 WeChat Work Bot
- 🟦 WeChat Public Push
---

## Features

- ✅ Multi-channel support
- ✅ Markdown message formatting
- ✅ Logging support
- ✅ Easy `.env` configuration
- ✅ Dockerized deployment
- ✅ Supports Halo Webhook plugin and WordPress (via WP Webhooks Pro plugin)
- ✅ Supports multiple channels at once via comma-separated `CHANNEL`

---

## Quick Start

### 1. Clone the Project

```bash
git clone https://github.com/jokerknight/PostPushForworder.git
cd PostPushForworder
```

### 2. Configure Environment Variables

Copy the `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
CHANNEL=telegram,slack,discord

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

WECHATWORK_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...

WECHAT_APPID=your_appid
WECHAT_APPSECRET=your_appsecret
WECHAT_TEMPLATE_ID=your_template_id
WECHAT_USER_OPENID=user_openid_to_send

PORT=3000
LOG_FILE=forwarder.log
```

### 3. Run with Docker

```bash
docker-compose up -d
```

---

## Halo Setup

- Plugin: Webhook
- Event: post_published
- Request URL: `http://your-server:3000/webhook`
- Method: POST
- Content-Type: `application/json`

---

## Supported Platforms

| Platform       | Description                              | Required ENV                         |
|----------------|------------------------------------------|--------------------------------------|
| Halo           | Halo official Webhook plugin             | Depends on CHANNEL                   |
| WordPress      | WP Webhooks Pro plugin post publish hook | Depends on CHANNEL                   |

---

## WordPress Compatibility

Compatible with [WP Webhooks Pro](https://wp-webhooks.com/).

Example Payload:

```json
{
  "post": {
    "ID": 123,
    "post_title": "Example Article",
    "post_url": "https://example.com/sample-post"
  }
}
```

---

## Development

```bash
npm install
npm start
```

---

## License

MIT