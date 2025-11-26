"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  QuerySet,
  Answer,
  Results,
  SurveyData,
  QuerySetResult,
} from "@/app/types/survey";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SurveyContent() {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // 現在選択中のカード (0〜4)
  const [currentQuestion, setCurrentQuestion] = useState<"Q1" | "Q2">("Q1"); // 現在回答中の質問
  const [allQuerySets, setAllQuerySets] = useState<QuerySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, Answer>>({
    0: { relevance: 0, dominantInfo: 0 },
    1: { relevance: 0, dominantInfo: 0 },
    2: { relevance: 0, dominantInfo: 0 },
    3: { relevance: 0, dominantInfo: 0 },
    4: { relevance: 0, dominantInfo: 0 },
  });
  const [surveyData, setSurveyData] = useState<SurveyData>({
    timestamp: new Date().toISOString(),
    querySets: [],
  });
  const [isCompleted, setIsCompleted] = useState(false); // 全完了フラグ
  const [userId, setUserId] = useState(""); // ユーザーID
  const [isTransitioning, setIsTransitioning] = useState(false); // 遷移中フラグ

  const handleRelevanceChange = useCallback((index: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { ...prev[index], relevance: value },
    }));
  }, []);

  const handleDominantInfoChange = useCallback(
    (index: number, value: number) => {
      setAnswers((prev) => ({
        ...prev,
        [index]: { ...prev[index], dominantInfo: value },
      }));
    },
    []
  );

  const handleNext = useCallback(
    (lastAnswers?: Record<number, Answer>) => {
      // 現在のクエリセットのIDを取得
      const currentQuerySet = allQuerySets[currentQueryIndex];
      if (!currentQuerySet) return;

      // 最新の回答を使用（引数で渡された場合はそれを使用）
      const answersToSave = lastAnswers || answers;

      // answersToSaveが正しい形式でない場合は初期値を使用
      const getAnswer = (index: number): Answer => {
        return answersToSave[index] || { relevance: 0, dominantInfo: 0 };
      };

      // 現在のクエリセットの回答を保存
      const querySetResult: QuerySetResult = {
        querySetId: currentQuerySet.id, // final_results.jsonのIDを使用
        q1Answers: [
          getAnswer(0).relevance,
          getAnswer(1).relevance,
          getAnswer(2).relevance,
          getAnswer(3).relevance,
          getAnswer(4).relevance,
        ],
        q2Answers: [
          getAnswer(0).dominantInfo,
          getAnswer(1).dominantInfo,
          getAnswer(2).dominantInfo,
          getAnswer(3).dominantInfo,
          getAnswer(4).dominantInfo,
        ],
      };

      // 同じquerySetIdが既に存在する場合は上書き、なければ追加
      const existingIndex = surveyData.querySets.findIndex(
        (qs) => qs.querySetId === querySetResult.querySetId
      );

      let updatedQuerySets;
      if (existingIndex !== -1) {
        // 既存のデータを上書き
        updatedQuerySets = [...surveyData.querySets];
        updatedQuerySets[existingIndex] = querySetResult;
      } else {
        // 新規追加
        updatedQuerySets = [...surveyData.querySets, querySetResult];
      }

      const updatedSurveyData = {
        ...surveyData,
        querySets: updatedQuerySets,
      };

      // 同期的に保存処理を実行
      try {
        // 遷移中フラグを立てる
        setIsTransitioning(true);

        // stateを更新
        setSurveyData(updatedSurveyData);

        // ローカルストレージに自動保存（同期処理）
        localStorage.setItem(
          "survey_incomplete",
          JSON.stringify(updatedSurveyData)
        );

        // 保存完了後に次のクエリセットに進む
        if (currentQueryIndex < allQuerySets.length - 1) {
          setCurrentQueryIndex((prev) => prev + 1);
          setCurrentCardIndex(0); // カードインデックスをリセット
          setCurrentQuestion("Q1"); // Q1から開始
          // 回答をリセット
          setAnswers({
            0: { relevance: 0, dominantInfo: 0 },
            1: { relevance: 0, dominantInfo: 0 },
            2: { relevance: 0, dominantInfo: 0 },
            3: { relevance: 0, dominantInfo: 0 },
            4: { relevance: 0, dominantInfo: 0 },
          });

          // 500ms後にキーボード入力を再開
          setTimeout(() => setIsTransitioning(false), 500);
        } else {
          // 全て完了
          setIsCompleted(true);
          setIsTransitioning(false);
        }
      } catch (error) {
        console.error("保存エラー:", error);
        alert("保存に失敗しました。もう一度お試しください。");
        setIsTransitioning(false);
      }
    },
    [currentQueryIndex, allQuerySets, answers, surveyData]
  );

  const handlePrevious = useCallback(() => {
    // 前のクエリセットに戻る
    if (currentQueryIndex > 0) {
      setCurrentQueryIndex((prev) => prev - 1);
      setCurrentCardIndex(0); // カードインデックスをリセット
      setCurrentQuestion("Q1"); // Q1から開始
      // 回答をリセット
      setAnswers({
        0: { relevance: 0, dominantInfo: 0 },
        1: { relevance: 0, dominantInfo: 0 },
        2: { relevance: 0, dominantInfo: 0 },
        3: { relevance: 0, dominantInfo: 0 },
        4: { relevance: 0, dominantInfo: 0 },
      });
    }
  }, [currentQueryIndex]);

  const handleFinalSave = useCallback(() => {
    if (!userId.trim()) {
      alert("ユーザーIDを入力してください");
      return;
    }

    // 最終保存
    localStorage.setItem(`survey_${userId}`, JSON.stringify(surveyData));

    // 未完了データを削除
    localStorage.removeItem("survey_incomplete");

    alert("保存が完了しました！ご協力ありがとうございました。");
  }, [userId, surveyData]);

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

  // 起動時に未完了データを読み込む
  useEffect(() => {
    const savedData = localStorage.getItem("survey_incomplete");
    if (savedData) {
      try {
        const parsedData: SurveyData = JSON.parse(savedData);
        setSurveyData(parsedData);
        // 次に回答するクエリセットのインデックスを設定
        setCurrentQueryIndex(parsedData.querySets.length);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // currentQueryIndexが変わったときに、保存済みの回答を復元
  useEffect(() => {
    if (!allQuerySets.length || !allQuerySets[currentQueryIndex]) return;

    const currentQuerySetId = allQuerySets[currentQueryIndex].id;
    const savedQuerySet = surveyData.querySets.find(
      (qs) => qs.querySetId === currentQuerySetId
    );

    if (savedQuerySet) {
      // 保存済みの回答を復元
      setAnswers({
        0: {
          relevance: savedQuerySet.q1Answers[0] || 0,
          dominantInfo: savedQuerySet.q2Answers[0] || 0,
        },
        1: {
          relevance: savedQuerySet.q1Answers[1] || 0,
          dominantInfo: savedQuerySet.q2Answers[1] || 0,
        },
        2: {
          relevance: savedQuerySet.q1Answers[2] || 0,
          dominantInfo: savedQuerySet.q2Answers[2] || 0,
        },
        3: {
          relevance: savedQuerySet.q1Answers[3] || 0,
          dominantInfo: savedQuerySet.q2Answers[3] || 0,
        },
        4: {
          relevance: savedQuerySet.q1Answers[4] || 0,
          dominantInfo: savedQuerySet.q2Answers[4] || 0,
        },
      });
    } else {
      // 保存済みデータがない場合は初期化
      setAnswers({
        0: { relevance: 0, dominantInfo: 0 },
        1: { relevance: 0, dominantInfo: 0 },
        2: { relevance: 0, dominantInfo: 0 },
        3: { relevance: 0, dominantInfo: 0 },
        4: { relevance: 0, dominantInfo: 0 },
      });
    }
  }, [currentQueryIndex, allQuerySets, surveyData.querySets]);

  // キーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 遷移中は入力を受け付けない
      if (isTransitioning) return;

      // 1〜4の数字キー（Q1）、または1〜5の数字キー（Q2）
      const maxKey = currentQuestion === "Q1" ? "4" : "5";
      if (e.key >= "1" && e.key <= maxKey) {
        const value = parseInt(e.key);

        if (currentQuestion === "Q1") {
          // Q1に値を設定
          handleRelevanceChange(currentCardIndex, value);

          // 次のカードのQ1へ、または全部終わったらQ2の最初へ
          if (currentCardIndex < 4) {
            setCurrentCardIndex((prev) => prev + 1);
            // Q1のまま
          } else {
            // 全部のQ1が終わったので、Q2の最初のカードへ
            setCurrentCardIndex(0);
            setCurrentQuestion("Q2");
          }
        } else {
          // Q2に値を設定
          handleDominantInfoChange(currentCardIndex, value);

          // 次のカードのQ2へ、または次のクエリセットへ
          if (currentCardIndex < 4) {
            setCurrentCardIndex((prev) => prev + 1);
            // Q2のまま
          } else {
            // 全部のQ2が終わったので、次のクエリセットへ
            // 即座に遷移フラグを立てる
            setIsTransitioning(true);

            // 最新の回答を作成して渡す
            const updatedAnswers = {
              ...answers,
              [currentCardIndex]: {
                ...answers[currentCardIndex],
                dominantInfo: value,
              },
            };
            setTimeout(() => handleNext(updatedAnswers), 200);
          }
        }
      } else if (e.key === "ArrowUp") {
        if (currentCardIndex > 0) {
          setCurrentCardIndex((prev) => prev - 1);
        } else if (currentCardIndex == 0) {
          setCurrentCardIndex(4);
        }
      } else if (e.key === "ArrowDown") {
        if (currentCardIndex < 4) {
          setCurrentCardIndex((prev) => prev + 1);
        } else if (currentCardIndex == 4) {
          setCurrentCardIndex(0);
        }
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (currentQuestion == "Q1") {
          setCurrentQuestion("Q2");
        } else {
          setCurrentQuestion("Q1");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentCardIndex,
    currentQuestion,
    isTransitioning,
    handleNext,
    handleRelevanceChange,
    handleDominantInfoChange,
  ]);

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

  // 全完了画面
  if (isCompleted) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">お疲れ様でした！</h1>
            <p className="text-muted-foreground">
              全てのアンケートが完了しました
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="userId" className="text-lg">
                ユーザーIDを入力してください
              </Label>
              <Input
                id="userId"
                type="text"
                placeholder="例: 12345 または user@example.com"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button onClick={handleFinalSave} className="w-full" size="lg">
              保存する
            </Button>
          </div>
        </div>
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
              onClick={() => handleNext()}
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
          <div className="w-[60%] flex flex-col gap-4">
            {/* ヘッダー行 */}
            <div className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-10 pb-2">
              <div className="font-medium text-lg"></div>
              <div
                className={`text-lg text-center transition-all ${
                  currentQuestion === "Q1"
                    ? "font-bold text-foreground"
                    : "font-normal text-muted-foreground"
                }`}
              >
                Q1: クエリとどの程度一致していると思いますか？
              </div>
              <div
                className={`text-lg text-center transition-all ${
                  currentQuestion === "Q2"
                    ? "font-bold text-foreground"
                    : "font-normal text-muted-foreground"
                }`}
              >
                Q2: どの割合で統合した結果だと思いますか？
              </div>
            </div>

            {/* データ行 */}
            <div className="flex flex-col gap-6">
              {querySet.result.map((result, index) => {
                const answer = answers[index];

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-10 p-3 transition-all"
                  >
                    {/* 結果情報 */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-24 h-24 bg-muted rounded shrink-0 overflow-hidden">
                        <Image
                          src={`/result/${result.id}.jpg`}
                          alt={result.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {result.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.location}
                        </p>
                      </div>
                    </div>

                    {/* Q1回答欄 */}
                    <div
                      className={`flex flex-col items-center justify-center gap-2 transition-all ${
                        currentCardIndex === index && currentQuestion === "Q1"
                          ? "opacity-100"
                          : "opacity-30"
                      }`}
                    >
                      <RadioGroup
                        value={answer.relevance.toString()}
                        onValueChange={(value) =>
                          handleRelevanceChange(index, parseInt(value))
                        }
                      >
                        <div className="flex gap-3">
                          {[1, 2, 3, 4].map((value) => (
                            <div
                              key={value}
                              className="flex flex-col items-center gap-1"
                            >
                              <RadioGroupItem
                                value={value.toString()}
                                id={`relevance-${index}-${value}`}
                                className="size-5 pointer-events-none"
                              />
                              <Label
                                htmlFor={`relevance-${index}-${value}`}
                                className="text-xs pointer-events-none"
                              >
                                {value}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      <div className="flex justify-between text-ml text-muted-foreground w-full px-1">
                        <span>全く</span>
                        <span>かなり</span>
                      </div>
                    </div>

                    {/* Q2回答欄 */}
                    <div
                      className={`flex flex-col items-center justify-center gap-2 transition-all ${
                        currentCardIndex === index && currentQuestion === "Q2"
                          ? "opacity-100"
                          : "opacity-30"
                      }`}
                    >
                      <RadioGroup
                        value={answer.dominantInfo.toString()}
                        onValueChange={(value) =>
                          handleDominantInfoChange(index, parseInt(value))
                        }
                      >
                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <div
                              key={value}
                              className="flex flex-col items-center gap-1"
                            >
                              <RadioGroupItem
                                value={value.toString()}
                                id={`dominant-${index}-${value}`}
                                className="size-5 pointer-events-none"
                              />
                              <Label
                                htmlFor={`dominant-${index}-${value}`}
                                className="text-xs pointer-events-none"
                              >
                                {value}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      <div className="flex justify-between text-ml text-muted-foreground w-full px-1">
                        <span>テキスト</span>
                        <span>画像</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
