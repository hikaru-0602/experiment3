"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QuerySet, Answer } from "./types/survey";

// サンプルデータ（実際は公開データから読み込む）
const sampleQuerySet: QuerySet = {
  id: 1,
  query_text: "自然",
  query_image_url: "/query/1.jpg",
  text_100_image_0: {
    id: "8175109496",
    name: "ひらたないスキー場",
    location: "八雲町熊石鮎川町",
    text_similarity: 0.7821022272109985,
    image_similarity: 0.598229169845581,
    integrated_score: 0.7821022272109985,
  },
  text_50_image_50: {
    id: "46871837265",
    name: "本茅部町",
    location: "森町字本茅部町",
    text_similarity: 0.7706266641616821,
    image_similarity: 0.7692999839782715,
    integrated_score: 0.7699633240699768,
  },
  text_0_image_100: {
    id: "48140966237",
    name: "かもめ島",
    location: "江差町字鴎島",
    text_similarity: 0.7016736268997192,
    image_similarity: 0.8289120197296143,
    integrated_score: 0.8289120197296143,
  },
};

const resultTypes = [
  { key: "text_100_image_0" as const, label: "テキスト100% / 画像0%" },
  { key: "text_50_image_50" as const, label: "テキスト50% / 画像50%" },
  { key: "text_0_image_100" as const, label: "テキスト0% / 画像100%" },
];

// Fisher-Yatesシャッフルアルゴリズム
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    text_100_image_0: { relevance: 0, dominantInfo: null },
    text_50_image_50: { relevance: 0, dominantInfo: null },
    text_0_image_100: { relevance: 0, dominantInfo: null },
  });
  const [randomizedResultTypes, setRandomizedResultTypes] = useState(resultTypes);

  // クライアント側でのみランダム化を実行（ハイドレーションエラー回避）
  useEffect(() => {
    setRandomizedResultTypes(shuffleArray(resultTypes));
  }, [currentQueryIndex]); // currentQueryIndexが変わるたびに新しい順序を生成

  const querySet = sampleQuerySet; // 後で動的に変更

  const handleRelevanceChange = (resultKey: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [resultKey]: { ...prev[resultKey], relevance: value },
    }));
  };

  const handleDominantInfoChange = (
    resultKey: string,
    value: "text" | "image" | "both"
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [resultKey]: { ...prev[resultKey], dominantInfo: value },
    }));
  };

  const handleNext = () => {
    // 次のクエリセットに進む（後で実装）
    setCurrentQueryIndex((prev) => prev + 1);
    // 回答をリセット
    setAnswers({
      text_100_image_0: { relevance: 0, dominantInfo: null },
      text_50_image_50: { relevance: 0, dominantInfo: null },
      text_0_image_100: { relevance: 0, dominantInfo: null },
    });
  };

  return (
    <div className="h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* ヘッダー */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900">
            観光地検索結果アンケート
          </h1>
          <p className="text-sm text-gray-600">
            クエリセット {querySet.id} / 50
          </p>
        </div>

        {/* クエリ表示 */}
        <div className="bg-white rounded shadow p-3 mb-3">
          <h2 className="text-sm font-semibold mb-2 text-gray-800">クエリ</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">テキスト:</span>
              <span className="text-sm font-medium text-gray-900">
                {querySet.query_text}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">画像:</span>
              <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden">
                <Image
                  src={querySet.query_image_url}
                  alt="クエリ画像"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 検索結果と質問 */}
        <div className="flex-1 grid grid-cols-3 gap-3 overflow-hidden">
          {randomizedResultTypes.map(({ key }) => {
            const result = querySet[key];
            const answer = answers[key];

            return (
              <div
                key={key}
                className="bg-white rounded shadow p-3 flex flex-col"
              >
                {/* 結果情報 */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">{result.name}</p>
                    <p className="text-xs text-gray-500">{result.location}</p>
                  </div>
                  <div className="relative w-20 h-20 bg-gray-100 rounded shrink-0 overflow-hidden">
                    <Image
                      src={`/result/${result.id}.jpg`}
                      alt={result.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <hr className="my-2" />

                {/* Q1: 関連度 */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    Q1: クエリとの一致度
                  </p>
                  <div className="flex gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`relevance-${key}`}
                          value={value}
                          checked={answer.relevance === value}
                          onChange={() => handleRelevanceChange(key, value)}
                          className="mr-1 w-3 h-3"
                        />
                        <span className="text-xs text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>低</span>
                    <span>高</span>
                  </div>
                </div>

                {/* Q2: 情報の反映 */}
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    Q2: 反映されている情報
                  </p>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`dominant-${key}`}
                        value="text"
                        checked={answer.dominantInfo === "text"}
                        onChange={() => handleDominantInfoChange(key, "text")}
                        className="mr-1 w-3 h-3"
                      />
                      <span className="text-xs text-gray-700">テキスト</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`dominant-${key}`}
                        value="both"
                        checked={answer.dominantInfo === "both"}
                        onChange={() => handleDominantInfoChange(key, "both")}
                        className="mr-1 w-3 h-3"
                      />
                      <span className="text-xs text-gray-700">両方同程度</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`dominant-${key}`}
                        value="image"
                        checked={answer.dominantInfo === "image"}
                        onChange={() => handleDominantInfoChange(key, "image")}
                        className="mr-1 w-3 h-3"
                      />
                      <span className="text-xs text-gray-700">画像</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 次へボタン */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition-colors"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
