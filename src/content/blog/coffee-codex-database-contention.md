---
title: "Coffee Codex - Database contention"
description: "Learning about database contention from Jamie from Convex"
pubDate: "Mar 07, 2026"
heroImage: "/coffee-codex/db-contention/cover.png"
---

## Introduction

I'm at T'Latte in Bellevue, WA and today I'm watching [this video](https://www.youtube.com/watch?v=BwM9TBnC3s8) by Jamie Turner from Convex. I've written about Convex several times (and have admittedly already watched this video) but I think this is an awesome video with a great analogy.

## The analogy

_Note: Jamie does a much better job explaining this entire concept in his video. I just write about it so I can reference it in my words in the future._

The analogy used is a castle with a vault and pedestals. The nobles operate their pedestals but have accountants to do the mathematical operations for them (e.g. subtracting or adding from their pedestal).

![Analogy](/coffee-codex/db-contention/analogy.png)

## Low contention

When there is no contention on the same records, **every** database system does great. When a noble needs to add money, his accountant can do the summation and add it directly to the vault, no problem.

This is like if every user can only modify his/her own record in a database, and no one else can. For example, the user profile record in a DB can't typically be edited by other users, so every database will be able to handle updates flawlessly.

## Tax day (Pessimistic concurrency control)

Ok let's introduce a little bit of contention. When The King requests his taxes to be paid, how should the money be taken out of the vault? The simple way to do it is to have each noble's accountant line up outside the King's door. When they are in front of the line, they can do the tax calculation.

```typescript
function payTaxes(nobles, king) {
    for (let i = 0; i < nobles.length; i++) {
        const noble = noble[i];
        const accountant = noble.accountant;
        const {newKingAmt, newNobleAmt} = accountant.calculateNewAmount(king); // This could be slow
        king.setAmount(newKingAmt);
        noble.setAmount(newNobleAmt);
    }
}
```

![Tax Day](/coffee-codex/db-contention/tax-day.png)

In this case, we serially go through each noble and pay the King his tax. Note that the `calculateNewAmount` is a blocking call, and could be slow. If the accountant is new or slow, this creates a Head-of-Line blocking problem, where other accountants are waiting behind the slow accountant in the queue. This is particularly problematic if the King needs to be accessed by something more important such as the military.

The analogy to this in databaseland is if each caller to the database is put in a queue and processed sequentially. This has the benefit that the data will always be accurate, but at the cost of database server scarcity.

The formal name for this is Pessimistic Concurrency Control. It's called pessimistic because you assume contention will happen so everything is locked ahead of time. The accountant at the head of the queue effectively had a lock on the king, so only they can touch the ledgers. This also introduces the possibility of a deadlock, where the ledgers are grabbed in the wrong order and you have two accountants waiting on each other.

As we said before, this approach is very slow. If an operation takes `N` seconds, you can only do `1/N` operations per second. This is similar to Postgres in "Select for update" mode.

## Optimistic Concurrency Control (OCC)

The problem we're trying to solve is to minimize the amount of accountants in the vault at a time. As we said before, if the military needs to access the king, they should be able to. The way to do this is to give the accountants a window into the king's total. With this window, they can peek at the total, do the calculation *at their desk* (which is the expensive part), and then go update the King/nobles' total.

The downside of this approach is accountants may have to retry their operations multiple times. Let's say Accountant A and Accountant B peek at the King's total and see $1000. They both calculate that the King's new total should be $1,010 and their noble should have $10 less. Accountant B is slightly faster so goes to the king, gives him the money, and returns back to the desk. While doing this, Accountant A starts to move to the King. When Accountant A gets there, he sees there is a mismatch. The King's total is $1010 now ($10 added from Accountant B). So it would be incorrect for Accountant B to make the King's total $1,010 since then Accountant B would not pay his Noble's tax. So Accountant B has to go back to his desk and retry.

This retry can happen multiple times, but it has the benefit of the King's vault having a very small number of accountants in it at a time.

![OCC](/coffee-codex/db-contention/occ.png)

In databaseland, the accountants are the application servers and the vault is the database server. Ideally we want to keep the database server as free as possible since it is a very scarce resource and we don't want to exhaust the database server threads. So this approach is more work in total, but we are offloading the work to app servers instead of database servers. In an ideal system, pessimistic concurrency control works better since it's less time in the entire service and there is *a lot* of contention, but real systems often have slow code and not too much contention.

This approach is what Convex takes and can also be the case in Postgres in serializable isolation levels.

No locks!

## Read Committed

Most databases use a mode called "Read Committed" by default. This approach is pretty surprising. Remember that paragraph a few sentences above where I mentioned that Accountant A saw a conflict and had to retry? Read Committed works the same way but it doesn't retry (:O). It peeks at the value and just writes it; this leads to data loss. That means every Accountant will write $1,010 to the King so only one person effectively paid their tax. This is how Postgres works by default. That's crazy.

## Improvements

The biggest improvement is to make the actual operation faster. This is like if the accountants upgraded from an abacus to a calculator.

Another option is to relax consistency. We can introduce a tax collector instead of directly paying the King. This means the total number of transactions that the King sees is less. The tax collectors aggregate the amount and pay the King the full total.

![Staleness](/coffee-codex/db-contention/staleness.png)

This is staleness because a noble could have paid their tax, but the King does not see it as paid until the tax collectors have relayed the payment to the King, which could take some time.

## References
- https://www.youtube.com/watch?v=BwM9TBnC3s8
