/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 개발 서버 보안 설정 (v16에서 강화된 부분)
  devIndicators: {
    // 특정 호스트나 IP에서 HMR(Hot Module Replacement) 연결을 허용
    // 기존의 allowedDevOrigins 역할이 이쪽으로 통합되었습니다.
    appIsrStatus: true,
    buildActivity: true,
  },

  // 2. 서버 액션 및 네트워크 보안 (v15에서 정식 편입)
  // 공인 IP나 DDNS 주소로 접속 시 POST 요청(로그인 등)이 차단되는 것을 방지합니다.
  serverExternalPackages: [], // 외부 패키지 최적화 제외 목록

  experimental: {
    // Nginx가 전달해주는 호스트 이름을 Next.js가 신뢰하도록 설정
    serverActions: {
      allowedOrigins: ["walrung.ddns.net", "localhost:3000"]
    }
  },

  // 3. 이미지 최적화 도메인 허용
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'walrung.ddns.net',
      },
    ],
  },
};

export default nextConfig;