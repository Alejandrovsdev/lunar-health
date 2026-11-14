/** API pública del módulo de esclusa (check-out para salir y check-in para entrar). */
export type { AirlockRecord, AirlockVerdict, CheckInForm, CheckOutForm } from "./domain/types";
export { evaluateCheckIn, evaluateCheckOut } from "./domain/rules";
export { AirlockHome } from "./ui/airlock-home";
export { CheckOutWizard } from "./ui/check-out-wizard";
export { CheckInWizard } from "./ui/check-in-wizard";
