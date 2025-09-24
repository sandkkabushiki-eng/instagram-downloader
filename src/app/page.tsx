'use client';

import { useState } from 'react';
import { Download, Link, Loader2, CheckCircle, AlertCircle, Instagram } from 'lucide-react';

interface DownloadResult {
  success: boolean;
  url?: string;
  error?: string;
  thumbnail?: string;
  title?: string;
  type?: 'video' | 'image';
}

export default function InstagramDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      setResult({ success: false, error: 'URLを入力してください' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          url: data.url,
          thumbnail: data.thumbnail,
          title: data.title,
          type: data.type
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'ダウンロードに失敗しました'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'ネットワークエラーが発生しました。URLを確認してください。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidInstagramUrl = (url: string) => {
    return url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/') || url.includes('/tv/'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Instagram className="h-12 w-12 text-white mr-3" />
            <h1 className="text-4xl font-bold text-white">Instagram Downloader</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Instagramの動画や写真を簡単にダウンロードできます
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">
                Instagram URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isLoading || !url.trim()}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      ダウンロード
                    </>
                  )}
                </button>
              </div>
              {url && !isValidInstagramUrl(url) && (
                <p className="text-yellow-300 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  有効なInstagram URLを入力してください
                </p>
              )}
            </div>
            {result && (
              <div className="mt-6">
                {result.success ? (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                      <h3 className="text-green-400 font-semibold text-lg">ダウンロード準備完了！</h3>
                    </div>
                    {result.thumbnail && (
                      <div className="mb-4">
                        <img 
                          src={result.thumbnail} 
                          alt="プレビュー" 
                          className="w-full max-w-xs mx-auto rounded-lg"
                        />
                      </div>
                    )}
                    {result.title && (
                      <p className="text-white mb-4">{result.title}</p>
                    )}
                    <a
                      href={result.url}
                      download
                      className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      ダウンロード開始
                    </a>
                  </div>
                ) : (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                      <h3 className="text-red-400 font-semibold text-lg">エラー</h3>
                    </div>
                    <p className="text-white mt-2">{result.error}</p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-white font-semibold mb-3">使用方法</h3>
              <ol className="text-white/80 space-y-2 text-sm">
                <li>1. Instagramで動画や写真のURLをコピー</li>
                <li>2. 上記の入力欄にURLを貼り付け</li>
                <li>3. 「ダウンロード」ボタンをクリック</li>
                <li>4. ダウンロードリンクをクリックして保存</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            © 2024 Instagram Downloader. 利用規約に同意してご利用ください。
          </p>
        </div>
      </div>
    </div>
  );
}
