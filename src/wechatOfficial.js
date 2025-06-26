const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APPID = process.env.WECHAT_APPID;
const APPSECRET = process.env.WECHAT_APPSECRET;
const TEMPLATE_ID = process.env.WECHAT_TEMPLATE_ID;
const TOKEN_CACHE_FILE = path.resolve(__dirname, 'wechat_access_token.json');

if (!APPID || !APPSECRET || !TEMPLATE_ID) {
  console.error('请在环境变量中配置 WECHAT_APPID、WECHAT_APPSECRET 和 WECHAT_TEMPLATE_ID');
  process.exit(1);
}

// 获取AccessToken，带本地缓存机制
async function getAccessToken() {
  if (fs.existsSync(TOKEN_CACHE_FILE)) {
    const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE));
    if (data.expireTime > Date.now()) {
      return data.access_token;
    }
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
  const res = await axios.get(url);

  if (res.data.access_token) {
    const expireTime = Date.now() + (res.data.expires_in - 300) * 1000; // 提前5分钟过期
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify({
      access_token: res.data.access_token,
      expireTime
    }));
    return res.data.access_token;
  }

  throw new Error('获取微信公众号AccessToken失败: ' + JSON.stringify(res.data));
}

// 发送模板消息给指定openid
async function sendTemplateMessage(openid, data) {
  const token = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`;

  const body = {
    touser: openid,
    template_id: TEMPLATE_ID,
    data,
  };

  const res = await axios.post(url, body);

  if (res.data.errcode !== 0) {
    throw new Error('发送模板消息失败: ' + JSON.stringify(res.data));
  }

  return res.data;
}

module.exports = {
  sendTemplateMessage,
};