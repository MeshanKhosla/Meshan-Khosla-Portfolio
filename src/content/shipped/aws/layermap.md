---
title: LayerMap
company: Amazon Web Services · QuickSight
companySlug: aws
visual: map
summary: A QuickSight map visual that joins customer data to custom GeoJSON polygons.
order: 5
legacySlug: aws-layermap
links:
  - label: Announcement post
    href: https://aws.amazon.com/blogs/business-intelligence/create-custom-shape-maps-in-amazon-quicksight/
  - label: AWS docs
    href: https://docs.aws.amazon.com/quick/latest/userguide/layered-maps.html
---

I built LayerMap using MapLibre, React, and TypeScript. It took in a GeoJSON file, parsed its features, and joined properties from those features with fields in the customer's dataset before displaying the resulting shapes on the map.

![A QuickSight dashboard mapping age distribution by ZIP3 regions across the United States.](/shipped/layermap-zip3.webp)

<p class="image-source">Image from <a href="https://aws.amazon.com/blogs/business-intelligence/create-custom-shape-maps-in-amazon-quicksight/" target="_blank" rel="noopener noreferrer">AWS announcement post</a>.</p>

![A QuickSight dashboard using a custom GeoJSON shape for New York City inspection data.](/shipped/layermap.webp)

<p class="image-source">Image from <a href="https://aws.amazon.com/blogs/business-intelligence/create-custom-shape-maps-in-amazon-quicksight/" target="_blank" rel="noopener noreferrer">AWS announcement post</a>.</p>

For example, a GeoJSON file could define the boundaries of the five New York City boroughs. If the customer dataset also contained a borough field, LayerMap could join each row to the matching feature and use the customer's values to color and style those shapes.

This was useful because these shapes are not conventionally geocoded. They are custom boundaries, such as boroughs, sales territories, or service areas, that do not necessarily map to the built-in geographic hierarchy. LayerMap let customers bring those shapes into QuickSight and connect them directly to their own data.
