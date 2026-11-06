import type { ActionState } from "@/app/_actions/auth";

export function ActionFeedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      className={`form-feedback ${state.error ? "form-feedback-error" : "form-feedback-success"}`}
      role={state.error ? "alert" : "status"}
    >
      {state.error ?? state.success}
    </p>
  );
}
