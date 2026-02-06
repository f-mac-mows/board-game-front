import fs from 'fs';
import path from 'path';

export function getWikiContent(gameType: string): string | null {
  const fileName = `${gameType.toLowerCase()}.md`;
  
  // 탐색할 후보 경로들
  const lookups = [
    { name: 'CWD_SRC', path: path.join(process.cwd(), 'src/content/wiki', fileName) },
    { name: 'CWD_CONTENT', path: path.join(process.cwd(), 'content/wiki', fileName) },
    { name: 'DIRNAME_PARENT', path: path.join(__dirname, '..', 'content/wiki', fileName) },
    { name: 'DOT_NEXT', path: path.join(process.cwd(), '.next/server/app/wiki', fileName) }
  ];

  for (const lookup of lookups) {
    if (fs.existsSync(lookup.path)) {
      console.log(`✅ Success! Found in ${lookup.name}: ${lookup.path}`);
      return fs.readFileSync(lookup.path, 'utf8');
    }
  }

  // 실패 시 로그 출력 (배포 환경 콘솔에서 확인 가능)
  console.error(`❌ Wiki file not found: ${gameType}`);
  console.error(`Current Working Directory (CWD): ${process.cwd()}`);
  console.error(`Looked in: ${JSON.stringify(lookups, null, 2)}`);
  
  return null;
}

// 모든 위키 게임 목록을 가져오는 함수 추가 (SSG용)
export function getAllWikiSlugs(): string[] {
  const wikiDir = path.join(process.cwd(), 'src/content/wiki');
  try {
    return fs.readdirSync(wikiDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch {
    return [];
  }
}