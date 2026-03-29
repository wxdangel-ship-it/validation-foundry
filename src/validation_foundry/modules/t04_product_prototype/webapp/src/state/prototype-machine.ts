import { assign, setup, type SnapshotFrom } from "xstate";

export type PrototypeMode = "platform" | "imported" | "explore";
export type WarningLevel = 1 | 2 | 3 | 4;
export type SummaryStatus = "completed" | "aborted" | "retreated";
export type GpsStatus = "good" | "limited";
export type RecordingStatus = "recording" | "paused";
export type SatelliteStatus = "standby" | "ready" | "linked";

export type PrototypeContext = {
  mode: PrototypeMode;
  startPointName: string;
  routeStartConfirmed: boolean;
  safetyAnchorCount: number;
  rangeConfirmed: boolean;
  rangeLimitExceeded: boolean;
  highlightedPointId: string | null;
  warningLevel: WarningLevel;
  summaryStatus: SummaryStatus;
  gpsStatus: GpsStatus;
  recordingStatus: RecordingStatus;
  satelliteStatus: SatelliteStatus;
};

export type PrototypeEvent =
  | { type: "OPEN_PLATFORM" }
  | { type: "OPEN_IMPORTED" }
  | { type: "OPEN_EXPLORE" }
  | { type: "GO_LAUNCHER" }
  | { type: "GO_OFFROAD_MAP" }
  | { type: "GO_TRIP_SUMMARY" }
  | { type: "BACK_TO_ROUTE_DETAIL" }
  | { type: "START_DOWNLOAD" }
  | { type: "REMOVE_OFFLINE" }
  | { type: "TOGGLE_MAP_VIEW" }
  | { type: "OPEN_SAFETY_DRAWER" }
  | { type: "CLOSE_SAFETY_DRAWER" }
  | { type: "MARK_DEMO_RUNNING" }
  | { type: "MARK_DEMO_COMPLETE" }
  | { type: "RESET_DEMO" }
  | { type: "SET_ROUTE_START_POINT"; name: string }
  | { type: "SET_EXPLORE_START_POINT"; name: string }
  | { type: "ADD_SAFETY_ANCHOR" }
  | { type: "RESET_SAFETY_ANCHORS" }
  | { type: "CONFIRM_RANGE" }
  | { type: "TOGGLE_RANGE_LIMIT" }
  | { type: "HIGHLIGHT_POINT"; pointId: string | null }
  | { type: "ENTER_FREE_EXPLORE" }
  | { type: "SET_WARNING_LEVEL"; level: WarningLevel }
  | { type: "SET_SUMMARY_STATUS"; status: SummaryStatus }
  | { type: "SET_GPS_STATUS"; status: GpsStatus }
  | { type: "SET_RECORDING_STATUS"; status: RecordingStatus }
  | { type: "SET_SATELLITE_STATUS"; status: SatelliteStatus };

const initialContext: PrototypeContext = {
  mode: "platform",
  startPointName: "新闯路起点",
  routeStartConfirmed: true,
  safetyAnchorCount: 0,
  rangeConfirmed: false,
  rangeLimitExceeded: false,
  highlightedPointId: null,
  warningLevel: 1,
  summaryStatus: "completed",
  gpsStatus: "good",
  recordingStatus: "recording",
  satelliteStatus: "standby",
};

export const prototypeMachine = setup({
  types: {
    context: {} as PrototypeContext,
    events: {} as PrototypeEvent,
  },
  actions: {
    loadPlatformScenario: assign({
      mode: "platform",
      startPointName: "新闯路起点",
      routeStartConfirmed: true,
      safetyAnchorCount: 0,
      rangeConfirmed: false,
      rangeLimitExceeded: false,
      highlightedPointId: null,
      warningLevel: 1,
      summaryStatus: "completed",
      gpsStatus: "good",
      recordingStatus: "recording",
      satelliteStatus: "ready",
    }),
    loadImportedScenario: assign({
      mode: "imported",
      startPointName: "新闯路起点",
      routeStartConfirmed: true,
      safetyAnchorCount: 0,
      rangeConfirmed: false,
      rangeLimitExceeded: false,
      highlightedPointId: null,
      warningLevel: 2,
      summaryStatus: "completed",
      gpsStatus: "good",
      recordingStatus: "recording",
      satelliteStatus: "standby",
    }),
    loadExploreScenario: assign({
      mode: "explore",
      startPointName: "未确认起点",
      routeStartConfirmed: false,
      safetyAnchorCount: 0,
      rangeConfirmed: false,
      rangeLimitExceeded: false,
      highlightedPointId: null,
      warningLevel: 1,
      summaryStatus: "retreated",
      gpsStatus: "good",
      recordingStatus: "recording",
      satelliteStatus: "standby",
    }),
    setRouteStartPoint: assign({
      routeStartConfirmed: true,
      startPointName: ({ event }) =>
        event.type === "SET_ROUTE_START_POINT" ? event.name : "新闯路起点",
    }),
    setExploreStartPoint: assign({
      routeStartConfirmed: true,
      startPointName: ({ event }) =>
        event.type === "SET_EXPLORE_START_POINT" ? event.name : "自由探索起点",
    }),
    addSafetyAnchor: assign({
      safetyAnchorCount: ({ context }) => context.safetyAnchorCount + 1,
      warningLevel: ({ context }) => (context.safetyAnchorCount >= 0 ? 1 : context.warningLevel),
    }),
    resetSafetyAnchors: assign({
      safetyAnchorCount: 0,
    }),
    confirmRange: assign({
      rangeConfirmed: true,
      rangeLimitExceeded: false,
      warningLevel: ({ context }) => (context.mode === "explore" ? 1 : context.warningLevel),
    }),
    toggleRangeLimit: assign({
      rangeLimitExceeded: ({ context }) => !context.rangeLimitExceeded,
      rangeConfirmed: ({ context }) => (context.rangeLimitExceeded ? context.rangeConfirmed : false),
      warningLevel: ({ context }) => (context.rangeLimitExceeded ? 2 : 3),
    }),
    highlightPoint: assign({
      highlightedPointId: ({ event }) =>
        event.type === "HIGHLIGHT_POINT" ? event.pointId : null,
    }),
    setWarningLevel: assign({
      warningLevel: ({ event, context }) =>
        event.type === "SET_WARNING_LEVEL" ? event.level : context.warningLevel,
    }),
    setSummaryStatus: assign({
      summaryStatus: ({ event, context }) =>
        event.type === "SET_SUMMARY_STATUS" ? event.status : context.summaryStatus,
    }),
    setGpsStatus: assign({
      gpsStatus: ({ event, context }) =>
        event.type === "SET_GPS_STATUS" ? event.status : context.gpsStatus,
    }),
    setRecordingStatus: assign({
      recordingStatus: ({ event, context }) =>
        event.type === "SET_RECORDING_STATUS" ? event.status : context.recordingStatus,
    }),
    setSatelliteStatus: assign({
      satelliteStatus: ({ event, context }) =>
        event.type === "SET_SATELLITE_STATUS" ? event.status : context.satelliteStatus,
    }),
  },
}).createMachine({
  id: "t04Prototype",
  type: "parallel",
  context: initialContext,
  on: {
    SET_ROUTE_START_POINT: {
      actions: "setRouteStartPoint",
    },
    SET_EXPLORE_START_POINT: {
      actions: "setExploreStartPoint",
    },
    ADD_SAFETY_ANCHOR: {
      actions: "addSafetyAnchor",
    },
    RESET_SAFETY_ANCHORS: {
      actions: "resetSafetyAnchors",
    },
    CONFIRM_RANGE: {
      actions: "confirmRange",
    },
    TOGGLE_RANGE_LIMIT: {
      actions: "toggleRangeLimit",
    },
    HIGHLIGHT_POINT: {
      actions: "highlightPoint",
    },
    ENTER_FREE_EXPLORE: {
      actions: "loadExploreScenario",
      target: ".navigation.explorePlan",
    },
    SET_WARNING_LEVEL: {
      actions: "setWarningLevel",
    },
    SET_SUMMARY_STATUS: {
      actions: "setSummaryStatus",
    },
    SET_GPS_STATUS: {
      actions: "setGpsStatus",
    },
    SET_RECORDING_STATUS: {
      actions: "setRecordingStatus",
    },
    SET_SATELLITE_STATUS: {
      actions: "setSatelliteStatus",
    },
  },
  states: {
    navigation: {
      initial: "launcher",
      states: {
        launcher: {
          on: {
            OPEN_PLATFORM: {
              target: "routeDetail",
              actions: "loadPlatformScenario",
            },
            OPEN_IMPORTED: {
              target: "routeDetail",
              actions: "loadImportedScenario",
            },
            OPEN_EXPLORE: {
              target: "explorePlan",
              actions: "loadExploreScenario",
            },
          },
        },
        routeDetail: {
          on: {
            GO_LAUNCHER: "launcher",
            GO_OFFROAD_MAP: "offroadMap",
            OPEN_PLATFORM: {
              target: "routeDetail",
              actions: "loadPlatformScenario",
            },
            OPEN_IMPORTED: {
              target: "routeDetail",
              actions: "loadImportedScenario",
            },
            ENTER_FREE_EXPLORE: {
              target: "explorePlan",
              actions: "loadExploreScenario",
            },
          },
        },
        explorePlan: {
          on: {
            GO_LAUNCHER: "launcher",
            GO_OFFROAD_MAP: "offroadMap",
            OPEN_PLATFORM: {
              target: "routeDetail",
              actions: "loadPlatformScenario",
            },
            OPEN_IMPORTED: {
              target: "routeDetail",
              actions: "loadImportedScenario",
            },
            OPEN_EXPLORE: {
              target: "explorePlan",
              actions: "loadExploreScenario",
            },
          },
        },
        offroadMap: {
          on: {
            GO_TRIP_SUMMARY: "tripSummary",
            BACK_TO_ROUTE_DETAIL: [
              {
                target: "explorePlan",
                guard: ({ context }) => context.mode === "explore",
              },
              {
                target: "routeDetail",
              },
            ],
            GO_LAUNCHER: "launcher",
          },
        },
        tripSummary: {
          on: {
            GO_LAUNCHER: "launcher",
            GO_OFFROAD_MAP: "offroadMap",
            BACK_TO_ROUTE_DETAIL: [
              {
                target: "explorePlan",
                guard: ({ context }) => context.mode === "explore",
              },
              {
                target: "routeDetail",
              },
            ],
          },
        },
      },
    },
    download: {
      initial: "notDownloaded",
      states: {
        notDownloaded: {
          on: {
            START_DOWNLOAD: "downloading",
          },
        },
        downloading: {
          after: {
            1200: "downloaded",
          },
        },
        downloaded: {
          on: {
            REMOVE_OFFLINE: "notDownloaded",
          },
        },
      },
    },
    mapView: {
      initial: "map2d",
      states: {
        map2d: {
          on: {
            TOGGLE_MAP_VIEW: "map3d",
          },
        },
        map3d: {
          on: {
            TOGGLE_MAP_VIEW: "map2d",
          },
        },
      },
    },
    overlay: {
      initial: "closed",
      states: {
        closed: {
          on: {
            OPEN_SAFETY_DRAWER: "open",
          },
        },
        open: {
          on: {
            CLOSE_SAFETY_DRAWER: "closed",
          },
        },
      },
    },
    demo: {
      initial: "idle",
      states: {
        idle: {
          on: {
            MARK_DEMO_RUNNING: "running",
          },
        },
        running: {
          on: {
            MARK_DEMO_COMPLETE: "completed",
            RESET_DEMO: "idle",
          },
        },
        completed: {
          on: {
            RESET_DEMO: "idle",
          },
        },
      },
    },
  },
});

export type PrototypeSnapshot = SnapshotFrom<typeof prototypeMachine>;

export function getActivePage(state: PrototypeSnapshot) {
  if (state.matches({ navigation: "routeDetail" })) {
    return "route_detail";
  }
  if (state.matches({ navigation: "explorePlan" })) {
    return "explore_plan";
  }
  if (state.matches({ navigation: "offroadMap" })) {
    return "offroad_map";
  }
  if (state.matches({ navigation: "tripSummary" })) {
    return "trip_summary";
  }
  return "launcher";
}

export function getDownloadState(state: PrototypeSnapshot) {
  if (state.matches({ download: "downloading" })) {
    return "downloading" as const;
  }
  if (state.matches({ download: "downloaded" })) {
    return "downloaded" as const;
  }
  return "not_downloaded" as const;
}

export function getMapView(state: PrototypeSnapshot) {
  return state.matches({ mapView: "map3d" }) ? ("map_3d" as const) : ("map_2d" as const);
}

export function isOverlayOpen(state: PrototypeSnapshot) {
  return state.matches({ overlay: "open" });
}

export function getWarningLevel(state: PrototypeSnapshot) {
  return state.context.warningLevel;
}

export function getSummaryStatus(state: PrototypeSnapshot) {
  return state.context.summaryStatus;
}

export function isRouteReady(state: PrototypeSnapshot) {
  return (
    state.context.routeStartConfirmed &&
    getDownloadState(state) === "downloaded"
  );
}

export function isExploreReady(state: PrototypeSnapshot) {
  return (
    state.context.routeStartConfirmed &&
    state.context.safetyAnchorCount > 0 &&
    state.context.rangeConfirmed &&
    !state.context.rangeLimitExceeded &&
    getDownloadState(state) === "downloaded"
  );
}
