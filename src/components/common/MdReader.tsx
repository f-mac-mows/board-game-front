// components/common/MdReader.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // ✨ 수식 스타일 필수 임포트

interface MdReaderProps {
  content: string;
}

export default function MdReader({ content }: MdReaderProps) {
  return (
    <div className="md-content w-full max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]} 
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}