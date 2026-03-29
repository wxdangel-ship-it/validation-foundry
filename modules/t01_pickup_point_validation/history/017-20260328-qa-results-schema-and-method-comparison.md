# 017 - 2026-03-28 - QA Results Schema and Method Comparison

## Scope

- This is a read-only QA review.
- Inputs reviewed:
  - `outputs/_work/20260327_t01_amap_batch_final/results.csv`
  - `outputs/_work/20260327_t01_amap_batch_final/summary.json`
  - `outputs/_work/20260327_t01_amap_recheck_10/summary.json`
  - `docs/ARTIFACT_PROTOCOL.md`
  - `modules/t01_pickup_point_validation/INTERFACE_CONTRACT.md`
  - existing T01 history
- No runtime or provider experiment was rerun for this review.

## Bottom Line

- The current AMap batch is still the strongest fully materialized batch artifact in the repo.
- It is now path-corrected to repo-local evidence roots.
- It is still not contract-complete under the reopened T01 standard, because it does not yet prove an explicit pickup-tip / marker-tip extraction path.

## Current QA Findings

- `outputs/_work/20260327_t01_amap_batch_final/results.csv` still uses the legacy schema:
  - `id,name,input_x,input_y,output_x,output_y,status,app,reason,evidence_dir`
- The current gap is no longer path hygiene.
- The current gap is contract completeness:
  - missing `provider`
  - missing `method`
  - missing `confidence`
  - missing explicit pickup-tip proof
- Batch-level `run_manifest.json` is still absent from the legacy AMap batch.

## Unified Result Table

Recommended authoritative fields:

- `id`
- `name`
- `input_x`
- `input_y`
- `output_x`
- `output_y`
- `provider`
- `method`
- `status`
- `confidence`
- `reason`
- `evidence_dir`

Key rules:

- `provider` must be `didi`, `amap`, or `other-approved-provider`
- `method` must be `mock_direct`, `visual_tip`, `drag_map`, `hybrid`, or `blocked`
- `status` must be `SUCCESS`, `FAIL`, or `BLOCKED`
- `confidence` should be `high`, `medium`, or `low`
- `app` should be treated as legacy metadata only

## Evidence Dir Norm

- Canonical evidence roots must live under repo truth on E 盘
- Historical C 盘 evidence may remain archived, but only through imported or archived repo paths
- Minimum batch-level files:
  - `results.csv`
  - `summary.json`
  - `run_manifest.json`

## Golden Set Evaluation

Per-sample `SUCCESS` requires:

- intended provider reached
- target pickup point explicit and reproducible
- stable window satisfied
- output coordinate is `GCJ-02`
- sample can be rechecked from `evidence_dir`

Current QA read on the existing AMap batch:

- It is stronger than a raw smoke test because it has `10/10` batch success and recheck pass
- It is still not full `high` confidence under the reopened contract because explicit pickup-tip proof is missing
- Without new evidence, it should be treated as a legacy / medium-confidence batch, not final-contract-complete success

## Provider + Method Comparison

Current ranking from strongest evidence to weakest:

1. `amap + hybrid`
2. `amap + visual_tip`
3. `amap + mock_direct`
4. `didi + mock_direct`
5. `drag_map` as a refinement technique, not a standalone confidence anchor

## Current Recommendation

- Keep the current AMap batch as a legacy success artifact
- Do not promote it to final contract success until explicit pickup-tip proof is attached
- For the next mainline attempt, compare `amap + hybrid` against `amap + visual_tip` first
- Keep `didi + mock_direct` as a secondary exploratory track
