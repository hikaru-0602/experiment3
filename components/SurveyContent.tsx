"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { QuerySet, Answer, Results } from "@/app/types/survey";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function SurveyContent() {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // 現在選択中のカード (0〜4)
  const [allQuerySets, setAllQuerySets] = useState<QuerySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, Answer>>({
    0: { relevance: 0, dominantInfo: null },
    1: { relevance: 0, dominantInfo: null },
    2: { relevance: 0, dominantInfo: null },
    3: { relevance: 0, dominantInfo: null },
    4: { relevance: 0, dominantInfo: null },
  });

  const handleRelevanceChange = useCallback((index: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { ...prev[index], relevance: value },
    }));
  }, []);

  const handleDominantInfoChange = useCallback(
    (index: number, value: "text" | "image" | "both") => {
      setAnswers((prev) => ({
        ...prev,
        [index]: { ...prev[index], dominantInfo: value },
      }));
    },
    []
  );

  const handleNext = useCallback(() => {
    // 次のクエリセットに進む
    if (currentQueryIndex < allQuerySets.length - 1) {
      setCurrentQueryIndex((prev) => prev + 1);
      setCurrentCardIndex(0); // カードインデックスをリセット
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
  }, [currentQueryIndex, allQuerySets.length]);

  const handlePrevious = useCallback(() => {
    // 前のクエリセットに戻る
    if (currentQueryIndex > 0) {
      setCurrentQueryIndex((prev) => prev - 1);
      setCurrentCardIndex(0); // カードインデックスをリセット
      // 回答をリセット
      setAnswers({
        0: { relevance: 0, dominantInfo: null },
        1: { relevance: 0, dominantInfo: null },
        2: { relevance: 0, dominantInfo: null },
        3: { relevance: 0, dominantInfo: null },
        4: { relevance: 0, dominantInfo: null },
      });
    }
  }, [currentQueryIndex]);

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

  // キーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1〜5の数字キー
      if (e.key >= "1" && e.key <= "5") {
        const value = parseInt(e.key);
        // 現在のカードに値を設定
        handleRelevanceChange(currentCardIndex, value);

        // 次のカードに進む、または次のクエリセットに進む
        if (currentCardIndex < 4) {
          setCurrentCardIndex((prev) => prev + 1);
        } else {
          // 5つ目のカードの場合、次のクエリセットに進む
          setTimeout(() => handleNext(), 200); // 少し遅延させて視覚的フィードバックを提供
        }
      } else if (e.key === "ArrowUp") {
        if (currentCardIndex > 0) {
          setCurrentCardIndex((prev) => prev - 1);
        }
      } else if (e.key === "ArrowDown") {
        if (currentCardIndex < 4) {
          setCurrentCardIndex((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCardIndex, handleNext, handleRelevanceChange]);

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

  const isLastQuery = currentQueryIndex === allQuerySets.length - 1;

  return (
    <div className="h-screen bg-background p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* ヘッダー */}
        <div className="mb-3 flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {currentQueryIndex + 1} / {allQuerySets.length}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              size="sm"
              variant="outline"
              disabled={currentQueryIndex === 0}
            >
              {"<"}
            </Button>
            <Button
              onClick={handleNext}
              size="sm"
              variant="outline"
              disabled={isLastQuery}
            >
              {">"}
            </Button>
          </div>
        </div>

        {/* クエリ表示 */}
        <div className="flex flex-row gap-16">
          <div className="flex justify-center items-start pb-4 w-[20%]">
            <div className="flex items-center w-full">
              <div className="flex flex-col items-center gap-6 p-3 rounded-2xl w-full">
                <div className="relative w-24 h-24 bg-muted rounded overflow-hidden">
                  <Image
                    src={querySet.query_image_url}
                    alt="クエリ画像"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-muted flex justify-center items-center w-[80%]">
                  <span className="text-2xl font-medium text-center">
                    {querySet.query_text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 検索結果と質問 */}
          <div className="grid grid-rows-5 gap-3 w-[60%]">
            {querySet.result.map((result, index) => {
              const answer = answers[index];

              return (
                <Card
                  key={index}
                  className={`p-3 flex flex-row justify-between h-full transition-all border-2 ${
                    currentCardIndex === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
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
      </div>
    </div>
  );
}
