# EduVerse Load Test Report — Layer 3 Baseline
**Date:** March 23, 2026
**Environment:** Local Development (Windows 11, Node 18, MySQL 8)

## Performance Targets (Layer 3)
| Metric | Threshold | Current Result | Status |
| :--- | :--- | :--- | :--- |
| **Sustained Load** | 10,000 VUs | TBD | 🟡 Testing |
| **Peak Spike** | 25,000 VUs | TBD | ⚪ Pending |
| **P50 Latency** | < 200 ms | TBD | ⚪ Pending |
| **P95 Latency** | < 500 ms | TBD | ⚪ Pending |
| **Error Rate** | < 0.1% | TBD | ⚪ Pending |

## Scenarios
1. **Feed Discovery Flow**: Login → List Feed → Fetch Profile.
   - Purpose: Stress the most common read path for active users.

## Tooling
- **Test Engine:** Artillery.io
- **Configuration:** `src/tests/load/artillery-config.yml`
- **Payload:** `src/tests/load/test-users.csv`

## Preliminary Audit (10 VUs Smoke Test)
| Target | Observed | Notes |
| :--- | :--- | :--- |
| **RPS** | TBD | |
| **P99** | TBD | |
| **Errors**| TBD | |

> [!NOTE]
> Database connection pool has been optimized to `connectionLimit: 100` before running these tests.
