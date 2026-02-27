import { CloudRain, Palette, RotateCcw, Zap } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components";

interface CatDrop {
  id: number;
  bornAt: number;
  lifetimeMs: number;
  leftPercent: number;
  driftPx: number;
  spinDeg: number;
  sizePx: number;
  emoji: string;
}

const CAT_POOL = ["🐱", "😺", "😸", "😻", "😹", "🐈"];
const MAX_ACTIVE_CATS = 120;
const BURST_COUNT = 24;
const RAIN_INTERVAL_MS = 260;

export const MyPluginView: React.FC = () => {
  const [isRaining, setIsRaining] = useState(false);
  const [cyanMode, setCyanMode] = useState(true);
  const [cats, setCats] = useState<CatDrop[]>([]);
  const [totalSpawned, setTotalSpawned] = useState(0);

  const addCats = (count: number) => {
    const now = Date.now();
    const batch = Array.from({ length: count }, (_, index) => {
      const lifetimeMs = 2600 + Math.round(Math.random() * 2200);
      return {
        id: now + index + Math.round(Math.random() * 1000),
        bornAt: now,
        lifetimeMs,
        leftPercent: 2 + Math.random() * 96,
        driftPx: -90 + Math.random() * 180,
        spinDeg: -200 + Math.random() * 400,
        sizePx: 24 + Math.round(Math.random() * 26),
        emoji: CAT_POOL[Math.floor(Math.random() * CAT_POOL.length)],
      } satisfies CatDrop;
    });

    setCats((previous) => [...previous, ...batch].slice(-MAX_ACTIVE_CATS));
    setTotalSpawned((previous) => previous + count);
  };

  useEffect(() => {
    if (!isRaining) {
      return;
    }

    addCats(12);
    const interval = window.setInterval(() => {
      addCats(6);
    }, RAIN_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRaining]);

  useEffect(() => {
    const cleanup = window.setInterval(() => {
      const now = Date.now();
      setCats((previous) =>
        previous.filter((cat) => now - cat.bornAt < cat.lifetimeMs + 400),
      );
    }, 220);

    return () => {
      window.clearInterval(cleanup);
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (isRaining && cyanMode) {
      return "Cyan mode active";
    }
    if (isRaining) {
      return "Classic cat rain active";
    }
    return "Rain paused";
  }, [cyanMode, isRaining]);

  const resetRain = () => {
    setIsRaining(false);
    setCyanMode(true);
    setCats([]);
    setTotalSpawned(0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 text-slate-900">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cyan Cat Rain</h1>
        <p className="text-muted-foreground">
          Demo plugin for the full workflow: local build, testing, production packaging, and
          registry publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-cyan-700" />
              Cat Rain Stage
            </CardTitle>
            <CardDescription>
              Press the buttons and verify the interaction in Marketplace Developer Mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="cat-demo-controls">
              <Button
                onClick={() => setIsRaining((running) => !running)}
                variant={isRaining ? "secondary" : "default"}
              >
                {isRaining ? "Pause Rain" : "Start Cat Rain"}
              </Button>
              <Button onClick={() => addCats(BURST_COUNT)} variant="outline">
                <Zap className="h-4 w-4" />
                Burst +{BURST_COUNT}
              </Button>
              <Button
                onClick={() => setCyanMode((enabled) => !enabled)}
                variant={cyanMode ? "secondary" : "outline"}
              >
                <Palette className="h-4 w-4" />
                {cyanMode ? "Disable Cyan Mode" : "Enable Cyan Mode"}
              </Button>
              <Button onClick={resetRain} variant="ghost">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className={`cat-rain-stage ${cyanMode ? "cat-rain-stage--cyan" : ""}`}>
              {cats.map((cat) => (
                <span
                  key={cat.id}
                  className="cat-drop"
                  style={
                    {
                      left: `${cat.leftPercent}%`,
                      animationDuration: `${cat.lifetimeMs}ms`,
                      fontSize: `${cat.sizePx}px`,
                      "--cat-drift": `${cat.driftPx}px`,
                      "--cat-spin": `${cat.spinDeg}deg`,
                    } as React.CSSProperties
                  }
                >
                  {cat.emoji}
                </span>
              ))}
              <div className="cat-stage-overlay">
                <span className="cat-status-pill">{statusLabel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Stats</CardTitle>
            <CardDescription>
              Keep this tiny so the workflow is easy to explain live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Active cats</span>
                <strong>{cats.length}</strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Total spawned</span>
                <strong>{totalSpawned}</strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Mode</span>
                <strong>{cyanMode ? "Cyan" : "Classic"}</strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto rain</span>
                <strong>{isRaining ? "Running" : "Stopped"}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What this demonstrates</CardTitle>
          <CardDescription>
            Minimal, visual functionality with no backend dependency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>The plugin registers an app route and sidebar item.</li>
            <li>The UI interaction is obvious: click and see cats immediately.</li>
            <li>Build output is deterministic: `dist/cyan-cat-rain.mjs` and `dist/cyan-cat-rain.css`.</li>
            <li>Same artifact can be tested locally, packed into a JAR, or published via jsDelivr.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPluginView;
