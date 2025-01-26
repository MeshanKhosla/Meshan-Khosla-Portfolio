---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Physical Clocks"
description: "Learning about Physical clocks in Distributed Systems"
pubDate: "January 26, 2025"
heroImage: "/coffee-codex/physical-clocks/coffee-codex-physical-clocks-hero.png"
---

## Introduction
I'm at Woods Coffee in Bellevue, WA and I'm learning about clocks in distributed systems.

![Coffee](/coffee-codex/physical-clocks/physical-clock-coffee.jpeg)

## Time
In our everyday lives we treat time as monotonic, meaning it is always increasing. We create routines, schedule events, and (most importantly) perceive causality with time. There are small exceptions such as leap seconds but our every day lives can operate under the assumption that time is always increasing which is very convenient.

The role of time in computers is similar to humans: computers must create routines, schedule events, and (most importantly) perceive causality with time. Examples of time in systems include:

- OS Scheduling
- Setting timeouts/Retry Mechanisms
- Performance profiling
- Timestamp logging in servers and databases
- Cache TTL
- TLS Certificates Expiry
- Ordering of events in distributed systems

In both our lives and in systems, the mechanism used for telling time is *clocks*.

## Types of clocks
1. Physical clocks - These are clocks that count the number of seconds elapsed. These tell the actual time of day and is the type of clocks we use every day.

We have high level APIs to access this such as:

```typescript
const currentTime = Date.now();
```
2. Logical clocks - These are clocks which count the number of events in a system. This can be thought of as a counter.

Clocks in distributed systems **do not** refer to the same thing as clocks in electrical engineering (i.e clock cycles, rising edge of the clock, etc).

## Physical Clocks
Most computers implement physical time with Quartz crystals which is cut to a specific shape and oscillates at a frequency that can be tuned. For the most part this frequency is predictable, but there will always be differences with how the quartz are manufactured. Not only that, but temperatures of rooms can also impact the frequency at which clocks vibrate, causing clock drift.

1 parts per million (PPM) drift translates to roughly 32s per year, and most computers have a drift of about 30 PPM, making the clock drift about 16 minutes per year. Putting this in availability terms, we're looking at ~4.5 9s of availability (99.997%)

A much more accurate alternative for quartz clocks are atomic clocks which use theory from quantum mechanics that I don't understand. These are much more expensive but much more accurate. The second is defined using atomic clocks and the number <a href="https://www.nist.gov/pml/time-and-frequency-division/time-realization/cesium-fountain-atomic-clocks" target="_blank">9,192,631,770</a> is significant. This is slightly below the abstraction level I'm going to dive into in this learning session but it is fascinating.

### GPS
Currently there are 31 GPS satellites orbiting earth. We commonly use GPS to tell location, but GPS satellites also carry atomic clocks! This means that the GPS receivers can work out the time using `f(time_delta, speed_of_light, ...)`

### UTC 
Everyday time is determined using Universal Time Coordinated (UTC). For example, PST is  UTC-8. But how is UTC defined? In short, UTC is a function of GMT and TAI, corrected by leap seconds.

```typescript
UTC = f(GMT, TAI)
```
GMT - Greenwich Mean Time is based in astronomy. It defines noon as the time the sun is in the south observed in the Greenwich Observatory, averaged over a year.

TAI - International Atomic Time uses atomic time (discussed before).

We want to use both since TAI is very accurate and GMT accounts for the Earth's rotation which is necessary to keep our circadian cycle in rhythm. However, these two forms of time do not line up exactly. Specifically, GMT can be problematic since the Earth does not rotate at a constant speed. 

We can combine both uf these techniques to create UTC by taking TAI and using GMT as a correction. These corrections are called _leap seconds_. Leap seconds are seconds that can be added/removed twice a year depending on if astronomers think time must be corrected.

## Time representations in Computers
The two most common representations we use are:

1. Unix time - Number of ms since January 1st 1970 00:00:00 UTC (epoch), not counting leap seconds
```python
unix_timestamp = int(datetime.now().timestamp())

unix_timestamp # 1737918088
```

2. ISO 8601 - year, month, date, hour, minute, second, and timezone offset relative to UTC.

```python
from datetime import datetime, timezone, timedelta

pst_timezone = timezone(timedelta(hours=-8))

current_time_pst = datetime.now(pst_timezone).isoformat()

current_time_pst # 2025-01-26T10:59:54.756926-08:00
```

Software has a really unique way of dealing with leap seconds: it ✨ignores it✨ which can be problematic for operating systems and distributed systems. To account for this, a leap second is typically spread out throughout the day intead of all at once. 

Next time I'll be learning about synchronizing these clocks!

References
- https://www.youtube.com/watch?v=FQ_2N3AQu0M (DDIA lecture series)
- https://chatgpt.com/share/67968803-5600-8002-8368-6a88dd9f4fb6 - ChatGPT for clarifications