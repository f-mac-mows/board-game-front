import fs from 'fs';
import path from 'path';

export function getWikiContent(gameType: string): string | null {
  try {
    // 빌드 타임에는 process.cwd()가 프로젝트 루트를 정확히 가리킵니다.
    const filePath = path.join(process.cwd(), 'src/content/wiki', `${gameType.toLowerCase()}.md`);
    
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Wiki file read error: ${gameType}`, error);
    return null;
  }
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