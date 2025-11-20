'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QuerySet, Answer } from './types/survey';

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
    integrated_score: 0.7821022272109985
  },
  text_50_image_50: {
    id: "46871837265",
    name: "本茅部町",
    location: "森町字本茅部町",
    text_similarity: 0.7706266641616821,
    image_similarity: 0.7692999839782715,
    integrated_score: 0.7699633240699768
  },
  text_0_image_100: {
    id: "48140966237",
    name: "かもめ島",
    location: "江差町字鴎島",
    text_similarity: 0.7016736268997192,
    image_similarity: 0.8289120197296143,
    integrated_score: 0.8289120197296143
  }
};

const resultTypes = [
  { key: 'text_100_image_0' as const, label: 'テキスト100% / 画像0%' },
  { key: 'text_50_image_50' as const, label: 'テキスト50% / 画像50%' },
  { key: 'text_0_image_100' as const, label: 'テキスト0% / 画像100%' }
];

export default function Home() {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({
    text_100_image_0: { relevance: 0, dominantInfo: null },
    text_50_image_50: { relevance: 0, dominantInfo: null },
    text_0_image_100: { relevance: 0, dominantInfo: null }
  });

  const querySet = sampleQuerySet; // 後で動的に変更

  const handleRelevanceChange = (resultKey: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [resultKey]: { ...prev[resultKey], relevance: value }
    }));
  };

  const handleDominantInfoChange = (resultKey: string, value: 'text' | 'image' | 'both') => {
    setAnswers(prev => ({
      ...prev,
      [resultKey]: { ...prev[resultKey], dominantInfo: value }
    }));
  };

  const handleNext = () => {
    // 次のクエリセットに進む（後で実装）
    setCurrentQueryIndex(prev => prev + 1);
    // 回答をリセット
    setAnswers({
      text_100_image_0: { relevance: 0, dominantInfo: null },
      text_50_image_50: { relevance: 0, dominantInfo: null },
      text_0_image_100: { relevance: 0, dominantInfo: null }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">観光地検索結果アンケート</h1>
          <p className="text-gray-600">クエリセット {querySet.id} / 50</p>
        </div>

        {/* クエリ表示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">クエリ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">テキスト:</p>
              <p className="text-lg font-medium text-gray-900">{querySet.query_text}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">画像:</p>
              <div className="relative w-full h-48 bg-gray-100 rounded">
                <Image
                  src={querySet.query_image_url}
                  alt="クエリ画像"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 検索結果と質問 */}
        <div className="space-y-8">
          {resultTypes.map(({ key, label }) => {
            const result = querySet[key];
            const answer = answers[key];

            return (
              <div key={key} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">観光地名: <span className="font-medium text-gray-900">{result.name}</span></p>
                      <p className="text-sm text-gray-600">場所: <span className="font-medium text-gray-900">{result.location}</span></p>
                    </div>
                    <div className="relative w-full h-48 bg-gray-100 rounded">
                      <Image
                        src={`/result/${result.id}.jpg`}
                        alt={result.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-6" />

                {/* Q1: 関連度 */}
                <div className="mb-6">
                  <p className="font-medium text-gray-900 mb-3">
                    Q1: 提示された検索結果は、クエリの内容にどの程度沿っていると感じましたか？
                  </p>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`relevance-${key}`}
                          value={value}
                          checked={answer.relevance === value}
                          onChange={() => handleRelevanceChange(key, value)}
                          className="mr-2 w-4 h-4"
                        />
                        <span className="text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    <span>全く沿っていない</span>
                    <span>非常に沿っている</span>
                  </div>
                </div>

                {/* Q2: 情報の反映 */}
                <div>
                  <p className="font-medium text-gray-900 mb-3">
                    Q2: この検索結果は、どの情報（テキストまたは画像）がより強く反映されていると感じましたか？
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`dominant-${key}`}
                        value="text"
                        checked={answer.dominantInfo === 'text'}
                        onChange={() => handleDominantInfoChange(key, 'text')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-gray-700">テキスト</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`dominant-${key}`}
                        value="both"
                        checked={answer.dominantInfo === 'both'}
                        onChange={() => handleDominantInfoChange(key, 'both')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-gray-700">両方同程度</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`dominant-${key}`}
                        value="image"
                        checked={answer.dominantInfo === 'image'}
                        onChange={() => handleDominantInfoChange(key, 'image')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-gray-700">画像</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 次へボタン */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
