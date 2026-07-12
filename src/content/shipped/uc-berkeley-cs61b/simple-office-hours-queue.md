---
title: Simple Office Hours Queue
company: UC Berkeley · CS61B
companySlug: uc-berkeley-cs61b
visual: queue
summary: The real-time office-hours queue used by CS61B students and course staff.
order: 1
legacySlug: cs61b-simple-office-hours-queue
links:
  - label: GitHub
    href: https://github.com/Berkeley-CS61B/simple-office-hours-queue
---

I led the infrastructure team for CS61B, a course with roughly 2,000 students, and built the Simple Office Hours Queue to coordinate help between students and course staff. I created the project and continued to lead its development as it became part of the day-to-day operation of the course.

Students created tickets with the assignment, location, question type, and context they needed help with. Staff could claim a ticket, mark a student as absent, requeue or resolve the request, and coordinate through the ticket's chat. We also supported public and group tickets so students working on the same problem could join an existing request instead of creating duplicates.

The queue was built in TypeScript with Next.js, tRPC, Prisma, and MySQL. I used Ably for pub/sub so ticket creation, status changes, chat messages, and queue updates appeared for students and staff without refreshing the page. The same real-time system powered course-wide broadcasts and browser notifications when staff needed to communicate with everyone waiting for help.

I also built personal queues for individual staff members. A TA could open a queue for their own office hours, control whether other staff could manage it, and give students a direct place to request help from that session. Personal queues used the same ticket workflow as the main course queue while keeping their state and activity separate.

Running this for a course of that size required more than moving tickets through a list. I added administrative imports and role checks, queue open and close controls, cooldowns, priority tickets, filters, activity logs, and statistics around wait and help times. These tools gave staff a clearer picture of what was happening during office hours and gave the infrastructure team enough control to operate the queue throughout the semester.
