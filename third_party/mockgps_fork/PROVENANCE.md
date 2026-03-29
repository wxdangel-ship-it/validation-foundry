# MockGps Fork Provenance

## 来源

- 上游历史工作区：`C:\Users\admin\MockGps-src`
- 仓库侧落点：`third_party/mockgps_fork/`

## 当前内容

- `MockGps-src/`
  - 受控源代码快照
- `apk/app-debug.apk`
  - 当前调试 APK
- 根目录关键文件：
  - `README.md`
  - `build.gradle.kts`
  - `settings.gradle.kts`
  - `app/build.gradle.kts`
  - `app/src/main/AndroidManifest.xml`
  - `app/src/main/java/com/lilstiffy/mockgps/service/MockLocationService.kt`
  - `app/src/main/java/com/lilstiffy/mockgps/storage/StorageManager.kt`

## 不迁入范围

- `.gradle/`
- `.idea/`
- build cache
- IDE 私有状态

## 说明

这不是新的业务实现入口，而是受控 fork 存档区。

后续若继续修改 `MockGps`，必须只在仓库侧进行，不再回到 `C:\Users\admin\MockGps-src`。
