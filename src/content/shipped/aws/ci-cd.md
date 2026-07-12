---
title: CI/CD
company: Amazon Web Services · QuickSight
companySlug: aws
visual: pipeline
summary: A multi-month effort to stabilize integration tests and improve multi-region deployment workflows.
order: 4
legacySlug: aws-ci-cd
links: []
---

I led a team of three through a multi-month effort to stabilize our integration tests and improve the operational workflows around deployments.

Our test data sources had previously been concentrated in PDX, so we distributed them across regions to make the deployment path more representative and resilient. We also reduced the size of the datasets and broke the integration test suites down so each one could finish in less than 30 minutes.

I drew a deliberate ownership boundary around the tests as well. Instead of depending on broad integration coverage for systems outside my team's control, I scoped the suites to the behavior our team owned. That made failures more actionable and gave me a cleaner signal as deployments moved through each region.
