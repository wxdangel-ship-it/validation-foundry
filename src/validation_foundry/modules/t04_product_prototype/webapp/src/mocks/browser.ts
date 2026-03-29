import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

let started = false;

export async function enableMocking() {
  if (typeof window === "undefined" || started) {
    return;
  }
  started = true;
  try {
    const worker = setupWorker(...handlers);
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  } catch (error) {
    console.info("MSW mock worker disabled", error);
  }
}
