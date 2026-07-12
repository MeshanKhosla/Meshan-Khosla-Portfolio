---
title: Highcharts GenAI Evaluation Framework
company: Amazon Web Services · QuickSight
companySlug: aws
visual: chart
summary: An offline framework for evaluating Highcharts configurations generated from natural-language requests.
order: 1
legacySlug: aws-highcharts-genai-evaluation-framework
links:
  - label: Highcharts docs
    href: https://docs.aws.amazon.com/quick/latest/userguide/highchart.html
---

QuickSight had a use case where someone could describe a chart in natural language and an LLM would return a Highcharts configuration using our JSON expression language. We needed a way to compare system prompts and models without reviewing every generated chart by hand.

![A Highcharts example comparing current-year and prior-year sales by industry.](/shipped/highcharts-docs.webp)

<p class="image-source">Image from <a href="https://docs.aws.amazon.com/quick/latest/userguide/highchart.html" target="_blank" rel="noopener noreferrer">Amazon QuickSight documentation</a>.</p>

I modeled the evaluation around benchmark cases and strategies. A benchmark described the prompt and the behavior we expected from the chart. A strategy represented the combination of model, system prompt, and generation logic that we wanted to test.

The orchestrator ran every strategy against every benchmark case. Those jobs ran in parallel with a configurable limit (for example, `maxConcurrency` set to 4), so we could evaluate the full matrix without starting an unbounded number of browser sessions.

Each strategy and benchmark pair could spawn multiple Playwright sessions. The evaluator rendered the chart, hovered data points, inspected tooltips and interactions, and checked whether the result actually satisfied the original prompt. This caught cases where the configuration was valid but the rendered behavior was wrong.

Benchmarks with a known result used reference-based evaluation. More open-ended prompts used reference-free evaluation with an LLM judge, including the browser output as part of what the judge evaluated.
