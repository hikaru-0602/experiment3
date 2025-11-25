"use client";

import dynamic from "next/dynamic";

const SurveyContent = dynamic(() => import("@/components/SurveyContent"), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-background flex items-center justify-center">
      <p className="text-lg">読み込み中...</p>
    </div>
  ),
});

export default function Home() {
  return <SurveyContent />;
}
