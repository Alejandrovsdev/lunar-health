/** API pública del módulo de tests (fisiológicos, cognitivos, psicológicos y sensoriomotores). */
export type { AssessmentResult, TestId } from "./domain/types";
export { TESTS, getTest, type TestDefinition } from "./domain/catalog";
export { scorePvt, PVT_LAPSE_MS } from "./domain/scoring";
export { useLatestResult, useTestStatuses, usePendingTestsCount } from "./ui/hooks";
export { TestsHub } from "./ui/tests-hub";
export { TestRunner, TEST_COMPONENTS, type TestComponentProps } from "./ui/test-runner";
export { PvtTest } from "./ui/tests/pvt-test";
export { BalanceTest } from "./ui/tests/balance-test";
export { StressTest } from "./ui/tests/stress-test";
