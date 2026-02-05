import confetti from 'canvas-confetti';

export const triggerRewardConfetti = () => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);

        // 왼쪽 사이드 샷 (랜덤 색상)
        confetti({
            particleCount,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#f97316']
        });

        // 오른쪽 사이드 샷
        confetti({
            particleCount,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#f97316']
        });
    }, 250);
};