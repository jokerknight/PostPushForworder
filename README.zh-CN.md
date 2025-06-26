[英文](README.md)|中文
# PostPushForworder

支持将 Halo 或 WordPress 博客的文章发布事件自动推送到多个平台：  
**Telegram、Slack、Discord、企业微信机器人、微信公众号**

---

## 功能亮点

- 多平台推送支持
- 支持 Markdown 消息格式
- 日志输出
- 环境变量配置简单灵活
- 支持 Docker 容器部署
- ✅ 支持同时推送到多个渠道（`CHANNEL=telegram,slack,...`）
- 支持 Halo(WebHook 插件) 和 WordPress（WP Webhooks Pro 插件）

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/halo-webhook-forwarder.git
cd halo-webhook-forwarder
```

### 2. 配置 `.env`

复制 `.env.example`：

```bash
cp .env.example .env
```

编辑 `.env`（多渠道示例）：

```env
CHANNEL=telegram,slack,discord

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# 企业微信机器人
WECHATWORK_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...

# 微信公众号
WECHAT_APPID=your_appid
WECHAT_APPSECRET=your_appsecret
WECHAT_TEMPLATE_ID=your_template_id
WECHAT_USER_OPENID=user_openid_to_send

PORT=3000
LOG_FILE=forwarder.log
```

### 3. 使用 Docker 启动

```bash
docker-compose up -d
```

---

## Halo 配置

- 插件：Webhook
- 事件：文章发布 `post_published`
- 请求地址：`http://你的服务器地址:3000/webhook`
- 方法：POST
- 内容类型：application/json

---

## 支持平台

| 平台            | 说明                                | 所需环境变量                    |
|----------------|-------------------------------------|---------------------------------|
| Halo           | 官方 Webhook 插件触发文章事件         | 根据 CHANNEL 自动判断           |
| WordPress      | WP Webhooks Pro 插件触发文章事件     | 根据 CHANNEL 自动判断           |

---

## WordPress 支持说明

兼容插件：[WP Webhooks Pro](https://wp-webhooks.com/)

示例 Payload：

```json
{
  "post": {
    "ID": 123,
    "post_title": "示例文章",
    "post_url": "https://example.com/sample-post"
  }
}
```

请将 Webhook 地址配置为：`http://your-server:3000/webhook`

---

## 本地开发

```bash
npm install
npm start
```

---

## 许可证

MIT