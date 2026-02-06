"use client";

import { useParams } from "next/navigation";
import { getWikiContent } from "@/lib/wiki";
import MdReader from "@/components/common/MdReader";

export default function WikiDetailPage() {
  const params = useParams();
  const gameType = params.gameType as string;
  
  const content = getWikiContent(gameType);

  if (!content) {
    return <div>위키를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <MdReader content={content} />
    </div>
  );
}