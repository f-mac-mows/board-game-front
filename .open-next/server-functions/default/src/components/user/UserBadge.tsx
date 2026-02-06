export const UserBadge = ({ nickname, title, color }: { nickname: string, title: string | null, color: string | null }) => {
  return (
    <div className="flex flex-col items-center">
      {title && (
        <span 
          className="text-[9px] leading-none mb-1 font-black uppercase tracking-wider"
          style={{ color: color || '#ccc' }}
        >
          {title}
        </span>
      )}
      <span className="font-bold">{nickname}</span>
    </div>
  );
};