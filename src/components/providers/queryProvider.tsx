"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // 컴포넌트가 리렌더링될 때마다 새로운 클라이언트를 생성하지 않도록 useState 사용
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 전역 설정: 뒤로 가기 시 바로 데이터를 다시 가져오지 않도록 캐시 시간 조절 가능
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}