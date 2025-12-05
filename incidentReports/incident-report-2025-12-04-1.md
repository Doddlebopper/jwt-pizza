# Incident: 2025-12-04 10-30-00

## Summary

Between the hour of 10:30 and 11:05 on 2025-12-04, 2 users encountered 500 status code errors when ordering pizzas. The event was triggered by a chaos testing endpoint call. The chaos testing endpoint call (to PUT /api/vendor/:vendorToken) modified the vendor that fulfills pizza orders so that the chaos field was changed to some value other than 'false'.

This chaos testing endpoint call caused all pizza orders to fail with a status code of 500. The event was detected by Grafana Metrics and Logging. The team started working on the event by investigating the cause of the 500 status code and checking various metrics and log events. This high priority incident affected 10% of users.

## Detection

This incident was detected within two minutes when the alert of more than 0 500 status code error log events was triggered and I was paged through Grafana OnCall via email.

Next, the team investigated other metrics like request latency and the rate of error log events, as well as the log messages from that time period. Although no other alerts were triggered, the pizza failure rate and the rate of error log events increased slightly, as opposed to its stable rate before the incident began. There was an alert on those metrics, but it didn't trigger because the alert threshold was too high. We could potentially reduce that alert threshold, but need to consider if it would result in too many false positives.

## Impact

For about 35 minutes our users experienced this incident. This incident affected 2 customers (10% of jwt pizza users), who experienced an issue where ordering pizzas failed and returned with 500 status code errors. No support tickets were submitted before the incident was resolved.

## Timeline

All times are in MST

- _10:30_ - Chaos was triggered
- _10:32_ - JWT Pizza DevOps team (Me) was notified
- _10:45_ - I determined the cause of the 500 failure for pizza orders.
- _10:55_ - I navigated to the Pizza Factory Failure Reporting URL and the chaos was stopped.
- _11:05_ - I completed their observation of the systems to confirm incident was resolved. Pizza orders no longer failed

## Response

After receiving the Grafana OnCall email at 10:32, I responsed and determined the cause of the issue by 10:45. I monitored the other alerts and determined if they were alerting what they were meant to, before navigating to the pizza factory to report the issue. I finally observed the system for another 5 minutes to determine the incident was completely resolved.

## Root Cause

The root cause of the incident was a triggering of the netflix chaos testing. It was the result of a call to the factory endpoint PUT /api/vendor/:vendorToken which resulted in the chaos testing being turned on

## Resolution

After reporting the error, the incident was resolved. No more pizza failures were reported, the log events and other metrics returned to typical values, and no more reponses with 500 status codes were encountered. I monitored the pizza ordering services for an additional couple of minutes to ensure that the incident was fully resolved and the system had recovered.