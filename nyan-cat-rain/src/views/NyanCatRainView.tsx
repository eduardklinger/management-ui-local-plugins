import React, { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components";

interface NyanCat {
  id: number;
  topPercent: number;
  durationMs: number;
  sizePx: number;
}

const MAX_CATS = 28;

export const NyanCatRainView: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [cats, setCats] = useState<NyanCat[]>([]);

  useEffect(() => {
    if (!started) {
      return;
    }

    const interval = window.setInterval(() => {
      setCats((previous) => {
        const next: NyanCat = {
          id: Date.now() + Math.floor(Math.random() * 10_000),
          topPercent: 5 + Math.random() * 85,
          durationMs: 3200 + Math.round(Math.random() * 3000),
          sizePx: 24 + Math.round(Math.random() * 26),
        };

        return [...previous, next].slice(-MAX_CATS);
      });
    }, 420);

    return () => {
      window.clearInterval(interval);
    };
  }, [started]);

  return (
    <div className="nyan-screen">
      <div className="nyan-bg-grid" />
      <div className="nyan-bg-glow nyan-bg-glow--one" />
      <div className="nyan-bg-glow nyan-bg-glow--two" />

      {!started ? (
        <div className="nyan-start-wrap">
          <Button size="lg" className="nyan-start-btn" onClick={() => setStarted(true)}>
            Start Nyan Cats
          </Button>
        </div>
      ) : null}

      <div className="nyan-stage" aria-hidden="true">
        {cats.map((cat) => (
          <div
            key={cat.id}
            className="nyan-cat-row"
            style={
              {
                top: `${cat.topPercent}%`,
                animationDuration: `${cat.durationMs}ms`,
                fontSize: `${cat.sizePx}px`,
              } as React.CSSProperties
            }
          >
            <span className="nyan-trail" />
            <span className="nyan-cat">🐱</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NyanCatRainView;
