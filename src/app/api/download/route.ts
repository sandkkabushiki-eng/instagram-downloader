import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: "URLが提供されていません" 
      }, { status: 400 });
    }

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      }
    });

    const $ = cheerio.load(data);

    let mediaUrl = "";
    let thumbnailUrl = "";
    let title = "Instagram Media";
    let type: "video" | "image" | "unknown" = "unknown";

    $("meta[property=\"og:video\"]").each((i, el) => {
      const content = $(el).attr("content");
      if (content && content.includes("video")) {
        mediaUrl = content;
        type = "video";
        return false;
      }
    });

    $("meta[property=\"og:image\"]").each((i, el) => {
      const content = $(el).attr("content");
      if (content) {
        thumbnailUrl = content;
        return false;
      }
    });

    $("meta[property=\"og:title\"]").each((i, el) => {
      const content = $(el).attr("content");
      if (content) {
        title = content;
        return false;
      }
    });

    if (!mediaUrl) {
      $("meta[property=\"og:image\"]").each((i, el) => {
        const content = $(el).attr("content");
        if (content && (content.includes(".jpg") || content.includes(".jpeg") || content.includes(".png"))) {
          mediaUrl = content;
          type = "image";
          return false;
        }
      });
    }

    if (mediaUrl) {
      return NextResponse.json({ 
        success: true, 
        url: mediaUrl, 
        thumbnail: thumbnailUrl, 
        title, 
        type 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "動画または画像URLが見つかりませんでした。" 
      }, { status: 404 });
    }

  } catch (error: unknown) {
    console.error("ダウンロードエラー:", error);
    
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number } };
      
      if (axiosError.response?.status === 404) {
        return NextResponse.json({ 
          success: false, 
          error: "投稿が見つかりません。" 
        }, { status: 404 });
      }
      
      if (axiosError.response?.status === 403) {
        return NextResponse.json({ 
          success: false, 
          error: "アクセスが拒否されました。" 
        }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: "メディアの取得中にエラーが発生しました。" 
    }, { status: 500 });
  }
}
