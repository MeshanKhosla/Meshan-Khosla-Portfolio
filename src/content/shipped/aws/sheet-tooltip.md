---
title: Sheet Tooltip
company: Amazon Web Services · QuickSight
companySlug: aws
visual: tooltip
summary: A QuickSight tooltip that renders a small sheet of related visuals when someone hovers a data point.
order: 2
legacySlug: aws-sheet-tooltip
links:
  - label: Announcement post
    href: https://aws.amazon.com/blogs/machine-learning/create-rich-custom-tooltips-in-amazon-quick-sight/
  - label: AWS docs
    href: https://docs.aws.amazon.com/quick/latest/userguide/customizing-visual-tooltips.html#customizing-visual-tooltips-sheet
---

QuickSight tooltips normally show a value or label. A sheet tooltip can contain multiple visuals, so hovering over one data point can bring up a small, focused dashboard with the related context.

![An automotive sales dashboard with a sheet tooltip containing a vehicle image, gauge, and monthly sales chart.](/shipped/sheet-tooltip-dashboard.webp)

<p class="image-source">Image from <a href="https://aws.amazon.com/blogs/machine-learning/create-rich-custom-tooltips-in-amazon-quick-sight/" target="_blank" rel="noopener noreferrer">AWS announcement post</a>.</p>

![A QuickSight dashboard showing a sheet tooltip while the cursor hovers over a pie chart.](/shipped/sheet-tooltip.webp)

<p class="image-source">Image from <a href="https://aws.amazon.com/blogs/machine-learning/create-rich-custom-tooltips-in-amazon-quick-sight/" target="_blank" rel="noopener noreferrer">AWS announcement post</a>.</p>

One of the most fun parts was building the smart positioning algorithm. Given the cursor position, tooltip size, and available space around the visual, it chose where to open the tooltip so it stayed out of the reader's way while making the best use of the screen.

Among many other things, I also worked on layout in the authoring experience. When an author added a new visual to a tooltip sheet, we needed to find a useful starting position without covering the visuals that were already there. It sounds like a small interaction, but it made building these multi-visual tooltips feel much more natural.

I was particularly proud of this when I saw sheet tooltips being used on the NFL Combine and NBA Draft pages :)
