// lib/wiki.ts
import fs from 'fs';
import path from 'path';

export function getWikiContent(gameType: string): string | null {
  try {
    // content/wiki/yacht.md 같은 파일을 찾습니다.
    const filePath = path.join(process.cwd(), 'src/content/wiki', `${gameType.toLowerCase()}.md`);
    console.log(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    console.error(`Wiki file not found: ${gameType}`);
    return null;
  }
}