import RankingClient from "@/components/ranking/RankingClient";
import RankingTabs from "@/components/ranking/RankingTabs";
import { RankingCriteria } from "@/types/rank";

interface Props {
  // params를 Promise로 정의해야 합니다.
  params: Promise<{
    gameType: string;
    criteria: RankingCriteria;
  }>;
}

export async function generateMetadata({ params }: Props) {
  // 여기서도 await로 풀어줘야 합니다.
  const { gameType, criteria } = await params;
  
  const title = gameType === "user" ? "통합" : gameType;
  return {
    title: `MOWS | ${title} ${criteria?.toUpperCase()} 랭킹`,
  };
}

export default async function Page({ params }: Props) {
  // ✅ 핵심: params를 await로 기다린 후 구조 분해 할당합니다.
  const { gameType, criteria } = await params;

  return (
    <>

        <RankingTabs currentCategory={gameType} currentCriteria={criteria} />

        {/* 데이터를 안전하게 받은 후 Client Component에 전달 */}
        <RankingClient category={gameType} criteria={criteria} />
    </>
  );
}