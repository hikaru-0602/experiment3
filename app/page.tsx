"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QuerySet, Answer } from "./types/survey";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    explain: "花がきれい 自然豊か",
    word: ["そして", "公孫樹", "八雲", "彩る", "一杯", "きれい", "楓", "木々"],
    caption_ja: "青空に彩る木々のグループ",
  },
  text_50_image_50: {
    id: "46871837265",
    name: "本茅部町",
    location: "森町字本茅部町",
    text_similarity: 0.7706266641616821,
    image_similarity: 0.7692999839782715,
    integrated_score: 0.7699633240699768,
    explain: "テトラポットが最高 田舎を感じる 海がきれい 奥に見える山が最高",
    word: ["ジークロス", "海", "奥", "きれい", "山", "丘", "田舎", "ポット"],
    caption_ja: "丘から海を眺める",
  },
  text_0_image_100: {
    id: "48140966237",
    name: "かもめ島",
    location: "江差町字鴎島",
    text_similarity: 0.7016736268997192,
    image_similarity: 0.8289120197296143,
    integrated_score: 0.8289120197296143,
    explain: "最高すぎる 海の中の鳥居がきれい 海が綺麗すぎる 自然豊か",
    word: ["海", "きれい", "鳥居", "綺麗", "登っ", "自然", "味わえる"],
    caption_ja: "海に設置されたベンチに座っている人",
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
  const [randomizedResultTypes, setRandomizedResultTypes] =
    useState(resultTypes);

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
    <div className="h-screen bg-background p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* ヘッダー */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">{querySet.id} / 50</p>
        </div>

        {/* クエリ表示 */}
        <div className="flex items-center gap-8 justify-center pb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-medium">クエリ：</span>
            </div>
            <div className="bg-muted flex flex-row items-center gap-6 p-3 rounded-2xl">
              <div className="relative w-24 h-24 bg-muted rounded overflow-hidden">
                <Image
                  src={querySet.query_image_url}
                  alt="クエリ画像"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="justify-center items-center">
                <span className="text-4xl font-medium">
                  ＋「{querySet.query_text}」
                </span>
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
              <Card key={key} className="p-5 flex flex-col overflow-y-auto">
                {/* 結果情報 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-24 h-24 bg-muted rounded shrink-0 overflow-hidden">
                      <Image
                        src={`/result/${result.id}.jpg`}
                        alt={result.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-foreground">
                        {result.name}
                      </p>
                      <p className="text-ml text-muted-foreground">
                        {result.location}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div>
                      <p className="text-ml font-semibold text-foreground">
                        {result.caption_ja}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Q1: 関連度 */}
                <div className="mb-3 pt-3">
                  <Label className="text-ml font-medium mb-4 block">
                    Q1: クエリとどの程度一致していると思いますか？
                  </Label>
                  <RadioGroup
                    value={answer.relevance.toString()}
                    onValueChange={(value) =>
                      handleRelevanceChange(key, parseInt(value))
                    }
                  >
                    <div className="flex justify-between mb-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div
                          key={value}
                          className="flex items-center space-x-1"
                        >
                          <RadioGroupItem
                            value={value.toString()}
                            id={`relevance-${key}-${value}`}
                            className="size-6"
                          />
                          <Label
                            htmlFor={`relevance-${key}-${value}`}
                            className="text-xs cursor-pointer"
                          >
                            {value}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>全く一致していない</span>
                    <span>かなり一致している</span>
                  </div>
                </div>

                {/* Q2: 情報の反映 */}
                <div>
                  <Label className="text-ml font-medium mb-4 block">
                    Q2: どの割合で統合した結果だと思いますか？
                  </Label>
                  <RadioGroup
                    value={answer.dominantInfo || ""}
                    onValueChange={(value) =>
                      handleDominantInfoChange(
                        key,
                        value as "text" | "image" | "both"
                      )
                    }
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="text"
                          id={`dominant-${key}-text`}
                          className="size-5"
                        />
                        <Label
                          htmlFor={`dominant-${key}-text`}
                          className="text-ml cursor-pointer"
                        >
                          テキストのみ
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="both"
                          id={`dominant-${key}-both`}
                          className="size-5"
                        />
                        <Label
                          htmlFor={`dominant-${key}-both`}
                          className="text-ml cursor-pointer"
                        >
                          1：1 で統合
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="image"
                          id={`dominant-${key}-image`}
                          className="size-5"
                        />
                        <Label
                          htmlFor={`dominant-${key}-image`}
                          className="text-ml cursor-pointer"
                        >
                          画像のみ
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 次へボタン */}
        <div className="mt-3 flex justify-center">
          <Button onClick={handleNext} size="lg">
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}
