# T01 Real Device Blocker Summary

Date: 2026-03-27
Device: Huawei Mate 20 Pro (`LYA-AL00`, Android 10)
Serial: `S2DGL19C12000860`

## Conclusion

The real-device mock-location baseline is working, but neither application chain currently satisfies the T01 contract under `no-login` constraints.

- `MockGps` is usable on the real device after `map tap -> Start mocking`.
- Didi home opens and requests both `gps` and `network`, but after clicking `定位` and waiting for stability it still stays on a Beijing pickup point (`茉藜园-东北门`) instead of the mocked Shanghai point. The chain is therefore not trustworthy.
- AMap home receives mock GPS updates, but every tested taxi-service entry path hits a phone-login wall. Under the confirmed `no-login` contract, that chain is blocked.

## Evidence Map

- Mock success: `mockgps_running.png`, `mockgps_after_maptap.xml`, `mockgps_after_start.xml`, `mock_and_receivers.txt`
- Didi blocked: `didi_after_locate.png`, `didi_after_locate.raw.xml`, `didi_ui_excerpt.txt`, `didi_location_receivers.txt`
- AMap blocked: `amap_mock_log.txt`, `amap_login_wall.png`, `amap_login_wall.xml`, `amap_login_excerpt.txt`

## Why This Is A Real Blocker

- Input-side mock injection is no longer the blocker; the device is successfully publishing a mock GPS location in Shanghai.
- Didi is actively requesting `gps`, but the user-visible pickup point remains unrelated to the mocked location after an explicit `定位` action and stability wait.
- AMap does observe mock GPS on the home map, but taxi-service entry is gated by login and could not be dismissed in the tested flows.

## Immediate Recovery Options

- Provide a clean secondary Android environment where Didi and/or AMap can be installed without historical account/cache state, if device firmware allows user/profile isolation.
- Accept a logged-in test account for AMap taxi if the business contract changes.
- Replace the target app chain with another ride-hailing app that both honors mock GPS and allows no-login pickup selection.
