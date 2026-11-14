"use client";

import { useState, type ComponentType } from "react";
import type { AssessmentResult, TestId } from "../domain/types";
import { ResultPanel } from "./result-panel";
import { PvtTest } from "./tests/pvt-test";
import { BalanceTest } from "./tests/balance-test";
import { DailyCheckInTest } from "./tests/daily-check-in";
import { WeeklyQuestionnaire } from "./tests/weekly-questionnaire";

export interface TestComponentProps {
  astronautId: string;
  onDone: (r: AssessmentResult) => void;
}

/** Registro de tests: un id → un componente. Agregar tests nuevos acá. */
export const TEST_COMPONENTS: Record<TestId, ComponentType<TestComponentProps>> = {
  daily: DailyCheckInTest,
  pvt: PvtTest,
  balance: BalanceTest,
  weekly: WeeklyQuestionnaire,
};

export function TestRunner({ astronautId, testId }: { astronautId: string; testId: TestId }) {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const Test = TEST_COMPONENTS[testId];
  if (result) return <ResultPanel result={result} astronautId={astronautId} />;
  return <Test astronautId={astronautId} onDone={setResult} />;
}
