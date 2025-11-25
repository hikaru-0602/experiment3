"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QuerySet, Answer, Results } from "@/app/types/survey";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function SurveyContent() {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [allQuerySets, setAllQuerySets] = useState<QuerySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, Answer>>({
    0: { relevance: 0, dominantInfo: null },
    1: { relevance: 0, dominantInfo: null },
    2: { relevance: 0, dominantInfo: null },
    3: { relevance: 0, dominantInfo: null },
    4: { relevance: 0, dominantInfo: null },
  });

  // final_results.jsonを読み込む
  useEffect(() => {
    fetch("/final_results.json")
      .then((response) => response.json())
      .then((data: Results) => {
        setAllQuerySets(data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading results:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  if (allQuerySets.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-lg">データが見つかりません</p>
      </div>
    );
  }

  const querySet = allQuerySets[currentQueryIndex];

  const handleRelevanceChange = (index: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { ...prev[index], relevance: value },
    }));
  };

  const handleDominantInfoChange = (
    index: number,
    value: "text" | "image" | "both"
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { ...prev[index], dominantInfo: value },
    }));
  };

  const handleNext = () => {
    // 次のクエリセットに進む
    if (currentQueryIndex < allQuerySets.length - 1) {
      setCurrentQueryIndex((prev) => prev + 1);
      // 回答をリセット
      setAnswers({
        0: { relevance: 0, dominantInfo: null },
        1: { relevance: 0, dominantInfo: null },
        2: { relevance: 0, dominantInfo: null },
        3: { relevance: 0, dominantInfo: null },
        4: { relevance: 0, dominantInfo: null },
      });
    } else {
      // 全て完了
      alert("アンケートが完了しました！ご協力ありがとうございました。");
    }
  };

  const isLastQuery = currentQueryIndex === allQuerySets.length - 1;

  return (
    <div className="h-screen bg-background p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* ヘッダー */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            {currentQueryIndex + 1} / {allQuerySets.length}
          </p>
        </div>

        {/* クエリ表示 */}
        <div className="flex flex-row gap-4">
          <div className="flex gap-8 justify-start items-start pb-4">
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
          <div className="grid grid-rows-5 gap-3">
            {querySet.result.map((result, index) => {
              const answer = answers[index];

              return (
                <Card
                  key={index}
                  className="p-3 flex flex-row justify-between h-full"
                >
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
                  </div>

                  {/* Q1: 関連度 */}
                  <div className="mb-3 pt-3">
                    <Label className="text-ml font-medium mb-4 block">
                      Q1: クエリとどの程度一致していると思いますか？
                    </Label>
                    <RadioGroup
                      value={answer.relevance.toString()}
                      onValueChange={(value) =>
                        handleRelevanceChange(index, parseInt(value))
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
                              id={`relevance-${index}-${value}`}
                              className="size-6"
                            />
                            <Label
                              htmlFor={`relevance-${index}-${value}`}
                              className="text-xs cursor-pointer"
                            >
                              {value}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    <div className="flex justify-between text-sm text-foreground">
                      <span>全く一致していない</span>
                      <span>かなり一致している</span>
                    </div>
                  </div>

                  {/* Q2: 情報の反映 */}
                  {/*
                  <div>
                    <Label className="text-ml font-medium mb-4 block">
                      Q2: どの割合で統合した結果だと思いますか？
                    </Label>
                    <RadioGroup
                      value={answer.dominantInfo || ""}
                      onValueChange={(value) =>
                        handleDominantInfoChange(
                          index,
                          value as "text" | "image" | "both"
                        )
                      }
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="text"
                            id={`dominant-${index}-text`}
                            className="size-6"
                          />
                          <Label
                            htmlFor={`dominant-${index}-text`}
                            className="text-ml cursor-pointer"
                          >
                            テキストのみ
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="both"
                            id={`dominant-${index}-both`}
                            className="size-6"
                          />
                          <Label
                            htmlFor={`dominant-${index}-both`}
                            className="text-ml cursor-pointer"
                          >
                            1：1 で統合
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="image"
                            id={`dominant-${index}-image`}
                            className="size-6"
                          />
                          <Label
                            htmlFor={`dominant-${index}-image`}
                            className="text-ml cursor-pointer"
                          >
                            画像のみ
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  */}
                </Card>
              );
            })}
          </div>
        </div>

        {/* 次へボタン */}
        <div className="mt-3 flex justify-center">
          <Button onClick={handleNext} size="lg">
            {isLastQuery ? "完了" : "次へ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
