// PostPushForworder - 支持多平台推送（多渠道版本）
// Multi-platform webhook forwarder for Halo blog or Wordpress (Telegram, Slack, Discord, 企业微信, 公众号)
// 支持同时推送到多个渠道，CHANNEL 环境变量用逗号分隔

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const wechatOfficial = require('./wechatOfficial');

const app = express();
app.use(express.json());

const SUPPORTED_CHANNELS = ['telegram', 'slack', 'discord', 'wechatwork', 'wechatofficial'];

const CHANNELS = process.env.CHANNEL
  ? process.env.CHANNEL.split(',').map(c => c.trim().toLowerCase())
  : [];

const LOG_FILE = process.env.LOG_FILE || 'forwarder.log';

// 检查渠道合法性
for (const ch of CHANNELS) {
  if (!SUPPORTED_CHANNELS.includes(ch)) {
    log(`❌ 不支持的 CHANNEL 类型：${ch}`);
    process.exit(1);
  }
}

const port = process.env.PORT || 3000;

// 日志辅助函数
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(path.resolve(__dirname, LOG_FILE), line + '\n');
}

// Webhook 接收接口
// 兼容 Halo 和 WordPress (WP Webhooks Pro) 的文章发布事件
app.post('/webhook', async (req, res) => {
  // Halo 格式处理
  if (req.body.event === 'post_published' && req.body.data) {
    const title = req.body.data.title || '无标题';
    const fullPath = req.body.data.fullPath || '#';

    const markdownText = `📢 **新文章发布啦！**\n\n**标题**：${title}\n**链接**：[点击阅读](${fullPath})`;
    const plainText = `📢 新文章发布啦！\n标题：${title}\n链接：${fullPath}`;

    try {
      await handleSend({ plainText, markdownText });
      log(`✅ 已推送 Halo 文章：${title}`);
      res.sendStatus(200);
      return;
    } catch (err) {
      log('❌ 推送失败：' + (err.response?.data || err.message));
      res.sendStatus(500);
      return;
    }
  }

  // WordPress WP Webhooks Pro 格式处理
  if (req.body.post && req.body.post.post_title && req.body.post.post_url) {
    const title = req.body.post.post_title;
    const fullPath = req.body.post.post_url;

    const markdownText = `📢 **新文章发布啦！**\n\n**标题**：${title}\n**链接**：[点击阅读](${fullPath})`;
    const plainText = `📢 新文章发布啦！\n标题：${title}\n链接：${fullPath}`;

    try {
      await handleSend({ plainText, markdownText });
      log(`✅ 已推送 WordPress 文章：${title}`);
      res.sendStatus(200);
      return;
    } catch (err) {
      log('❌ 推送失败：' + (err.response?.data || err.message));
      res.sendStatus(500);
      return;
    }
  }

  // 未知格式，返回 204
  res.sendStatus(204);
});

// 多渠道推送
async function handleSend({ plainText, markdownText }) {
  for (const channel of CHANNELS) {
    try {
      switch (channel) {
        case 'telegram':
          await sendToTelegram(plainText);
          break;
        case 'slack':
          await sendToSlack(markdownText);
          break;
        case 'discord':
          await sendToDiscord(markdownText);
          break;
        case 'wechatwork':
          await sendToWechatWork(plainText);
          break;
        case 'wechatofficial':
          await sendToWechatOfficial(plainText);
          break;
        default:
          log(`⚠️ 不支持的渠道: ${channel}`);
      }
      log(`✅ 通过 ${channel} 推送成功`);
    } catch (e) {
      log(`❌ 通过 ${channel} 推送失败: ${e.message}`);
    }
  }
}

// Telegram 推送
async function sendToTelegram(text) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('TELEGRAM_BOT_TOKEN 或 TELEGRAM_CHAT_ID 未配置');
  }
  return axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'Markdown'
  });
}

// Slack 推送
async function sendToSlack(text) {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    throw new Error('SLACK_WEBHOOK_URL 未配置');
  }
  return axios.post(SLACK_WEBHOOK_URL, { text });
}

// Discord 推送
async function sendToDiscord(text) {
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL 未配置');
  }
  return axios.post(DISCORD_WEBHOOK_URL, { content: text });
}

// 企业微信机器人推送
async function sendToWechatWork(text) {
  const WECHATWORK_WEBHOOK_URL = process.env.WECHATWORK_WEBHOOK_URL;
  if (!WECHATWORK_WEBHOOK_URL) {
    throw new Error('WECHATWORK_WEBHOOK_URL 未配置');
  }
  return axios.post(WECHATWORK_WEBHOOK_URL, {
    msgtype: 'text',
    text: { content: text }
  });
}

// 公众号官方推送
async function sendToWechatOfficial(text) {
  const openid = process.env.WECHAT_USER_OPENID;
  if (!openid) {
    throw new Error('WECHAT_USER_OPENID 未配置');
  }
  // 构造模板消息数据
  const data = {
    title: { value: text, color: '#173177' }
  };
  return wechatOfficial.sendTemplateMessage(openid, data);
}

app.listen(port, () => {
  log(`🚀 Webhook Forwarder 运行中，监听端口 ${port}，渠道：${CHANNELS.join(', ')}`);
});