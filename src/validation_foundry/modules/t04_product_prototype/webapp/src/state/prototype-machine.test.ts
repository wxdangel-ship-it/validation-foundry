import { describe, expect, it } from "vitest";
import { isExploreReady, isRouteReady, type PrototypeSnapshot } from "./prototype-machine";

describe("prototype ready gate", () => {
  it("allows route modes only after download completes", () => {
    const notReady = {
      context: {
        mode: "platform",
        routeStartConfirmed: true,
      },
      matches: () => false,
    } as unknown as PrototypeSnapshot;
    const ready = {
      context: {
        mode: "platform",
        routeStartConfirmed: true,
      },
      matches: (value: unknown) => JSON.stringify(value) === JSON.stringify({ download: "downloaded" }),
    } as unknown as PrototypeSnapshot;

    expect(isRouteReady(notReady)).toBe(false);
    expect(isRouteReady(ready)).toBe(true);
  });

  it("requires all free explore constraints", () => {
    const base = {
      context: {
        mode: "explore",
        routeStartConfirmed: true,
        safetyAnchorCount: 1,
        rangeConfirmed: true,
        rangeLimitExceeded: false,
      },
      matches: (value: unknown) => JSON.stringify(value) === JSON.stringify({ download: "downloaded" }),
    } as unknown as PrototypeSnapshot;
    const overflow = {
      ...base,
      context: {
        ...base.context,
        rangeLimitExceeded: true,
      },
    } as unknown as PrototypeSnapshot;

    expect(isExploreReady(base)).toBe(true);
    expect(isExploreReady(overflow)).toBe(false);
  });
});
