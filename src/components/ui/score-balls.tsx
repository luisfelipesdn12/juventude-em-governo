interface ScoreBallsProps {
  score: number;
  maxScore?: number;
  showNumericScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBalls({ 
  score, 
  maxScore = 5, 
  showNumericScore = true,
  size = 'md' 
}: ScoreBallsProps) {
  const sizeClasses = {
    sm: 'max-w-xs text-4xl',
    md: 'max-w-sm text-6xl',
    lg: 'max-w-md text-8xl'
  };

  return (
    <div className={`flex flex-row items-center gap-2 ${sizeClasses[size]} py-2`}>
      {Array.from({ length: maxScore }).map((_, index) => {
        const percentageFill =
          (index + 1) < score
            ? 100
            : (index) > score
              ? 0
              : ((score % 1) * 100);
        
        return (
          <div key={index} className="aspect-square relative w-full bg-primary/30 rounded-full">
            <div className="absolute top-0 left-0 h-full" style={{
              width: `${percentageFill}%`
            }}>
              <div className="h-full w-full rounded-full bg-primary"></div>
            </div>
          </div>
        );
      })}
      {showNumericScore && (
        <div className={`font-bold text-primary ml-5 ${sizeClasses[size].split(' ')[1]}`}>
          {score.toFixed(1)}
        </div>
      )}
    </div>
  );
} 