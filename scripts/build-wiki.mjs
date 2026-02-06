import fs from 'fs';
import path from 'path';

const WIKI_DIR = path.join(process.cwd(), 'src/content/wiki');
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/wiki-data.ts');

async function buildWiki() {
  const files = fs.readdirSync(WIKI_DIR).filter(f => f.endsWith('.md'));
  const registry = {};

  for (const file of files) {
    const slug = file.replace('.md', '').toLowerCase();
    const content = fs.readFileSync(path.join(WIKI_DIR, file), 'utf8');
    // Base64로 인코딩하여 백틱/수식 충돌을 원천 차단
    registry[slug] = Buffer.from(content).toString('base64');
  }

  const fileContent = `// ✅ 자동 생성된 파일입니다. 직접 수정하지 마세요.
export const WIKI_REGISTRY_ENCODED: Record<string, string> = ${JSON.stringify(registry, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`✅ Wiki Registry 생성 완료: ${OUTPUT_FILE}`);
}

buildWiki();