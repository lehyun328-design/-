// index.js
import fetch from "node-fetch";

const twitterBearer = process.env.TWITTER_BEARER_TOKEN;
const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

// @username만 입력
const username = "kr_pjsekai";

async function getUserId(username) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}`,
    {
      headers: { Authorization: `Bearer ${twitterBearer}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Twitter API Error: ${res.status}`);
  }

  const data = await res.json();
  return data?.data?.id;
}

async function main() {
  try {
    const userId = await getUserId(username);

    const res = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at`,
      {
        headers: { Authorization: `Bearer ${twitterBearer}` },
      }
    );

    if (!res.ok) {
      throw new Error(`Twitter API Error: ${res.status}`);
    }

    const data = await res.json();
    const latest = data?.data?.[0];

    if (!latest) {
      console.log("🚫 트윗 없음");
      return;
    }

    // 디스코드 전송
    await fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🐦 새 트윗!\nhttps://twitter.com/i/web/status/${latest.id}`,
      }),
    });

    console.log("✅ 디스코드 전송 완료:", latest.id);
  } catch (err) {
    console.error("에러 발생:", err.message);
  }
}

main();
