import { DndContext, DragOverEvent } from '@dnd-kit/core';
import { useRummikubStore } from '@/store/useRummikubStore';

export default function RummikubBoard() {
    const { boardTiles, handTiles, moveTile } = useRummikubStore();

    // 드래그 종료 핸들러
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        // over.id 예시: "cell-board-5-2" (보드의 5열 2행)
        const [type, area, x, y] = over.id.split('-'); 
        moveTile(active.id, area as 'board' | 'hand', Number(x), Number(y));
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-8 p-4 bg-slate-950">
                {/* 1. 공용 바닥 (Table) */}
                <div className="grid grid-cols-20 grid-rows-8 gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    {/* 격자 Cell 렌더링 루프... */}
                </div>

                {/* 2. 내 손패 (Rack) */}
                <div className="grid grid-cols-20 grid-rows-2 gap-1 bg-blue-900/20 p-2 rounded-xl border border-blue-500/30">
                    {/* 내 타일 렌더링... */}
                </div>
            </div>
        </DndContext>
    );
}