---
title: "Coffee Codex - AWS Nitro"
description: "Learning about EC2 Nitro"
pubDate: "June 20, 2026"
heroImage: "/coffee-codex/nitro/cover.png"
---

## Introduction

I'm at Artisan Bakehouse in Bellevue, WA, and today I'm reading [this post](https://www.allthingsdistributed.com/2020/09/reinventing-virtualization-with-nitro.html) to learn more about AWS Nitro, EC2's underlying platform.

![Coffee](/coffee-codex/nitro/coffee.webp)

## Hypervisors

Hypervisors provide virtual machines where users can run their applications and operating systems. They create a layer of isolation between VMs and the underlying hardware.

![Hypervisor diagram](/coffee-codex/nitro/hypervisor-mermaid.webp)

The hypervisor AWS used initially was called Xen, and the architecture looked something like this:

![Hypervisor AWS](/coffee-codex/nitro/hypervisor.webp)

Notice how 30% of the server's resources were being allocated to the hypervisor, networking, storage, monitoring, and other infrastructure tasks. Basically, everything other than the user's VMs. At the scale of AWS, that 30% placed a significant limit on efficiency and performance.

## Nitro

Here's the end result of Nitro:

![Hypervisor AWS](/coffee-codex/nitro/nitro.webp)

It doesn't look _too_ dissimilar, but there's a big difference: the customer instance and hypervisor are now almost 100% of the server. With the Nitro System, AWS offloaded the majority of the 30% overhead into specialized hardware called Nitro Cards. These cards were developed by AWS's Annapurna Labs team; AWS acquired Annapurna during Nitro's development. For example, one version looks like this:

![Nitro Cards](/coffee-codex/nitro/nitro-card.webp)

So the overhead pieces from before are specialized chips that live on the card. Owning the full stack like this also allows AWS to let VMs access these devices without passing through the host CPU's hypervisor I/O stack.

![Flow with Nitro](/coffee-codex/nitro/with-nitro.webp)

For requests that need things like networking, the VM's own network stack still runs on the host CPU, but Nitro offloads the infrastructure-side processing to the networking card.

## Security

Obviously, the most important thing in this system has to be security, which is why AWS created the Nitro Security Chip. Unlike the other Nitro chips that process networking or storage, the Security Chip protects the server itself. It verifies the BIOS and firmware before allowing the main CPU to start and prevents the CPU, VMs, or even bare-metal customers from modifying that firmware. This extends Nitro's hardware root of trust to the server motherboard, meaning the system does not have to trust software running on the host to protect it.

This makes it so even if the software running on the main server is compromised, the Nitro Security Chip prevents it from changing the server’s protected firmware.

## References
- https://www.allthingsdistributed.com/2020/09/reinventing-virtualization-with-nitro.html
- https://dev.to/choonho/nitro-card-why-aws-is-best-46ph
