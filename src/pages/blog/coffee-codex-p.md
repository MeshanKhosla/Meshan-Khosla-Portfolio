---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Learning P For Formal Methods"
description: "Learning about the P Programming Language"
pubDate: "June 15, 2025"
heroImage: "/coffee-codex/p/cover.png"
---

## Introduction
I'm at Royal Bakehouse in Bellevue, WA and I'm learning about the [P programming language](https://p-org.github.io/P/) by going through the examples on their site.
In the <a href='/blog/coffee-codex-formal.md'>last post</a> I learned about general formal methods that AWS used and why P was a good choice for them. Today I'll dive a bit deeper and see the exact syntax and semantics that P uses.

![Coffee](/coffee-codex/p/coffee.png)

## Semantics
P is a language based on state machines and each machine can asynchronously send messages to other machines. Each bachine also has an unbounded FIFO buffer associated with it to keep track of the messages received. The machine then dequeues events from the input buffer and executes handlers based on the event. Sends to machines are reliable and directed as opposed to broadcast. The events are dequeued in causal order, I talked more about causal order <a href='/blog/coffee-codex-causality-and-happens-before.md'>here</a>.

This also means events delivered by the same machine are guaranteed to be dequeued in order so message loss and reordering have to be explicitly modeled. While P doesn't interleave requests that come from one machines (they claim this doesn't lead to interesting behaviors), the magic of P is the interleaving of requests coming from different machines. The ability to explore all possibilities of message ordering enables developers to find bugs within their distributed systems.

## Client Server Example
The first example is a fairly standard client-server examples where clients send a withdraw request to a bank server. The bank server then communicated with the database to read the balance, does some business logic, then returns whether the request succeeds or failed. The business logic in this case ensures the client will have a balance of at least 10 dollars after the withdrawal, so they can only withdraw 

![Client Server Diagram](/coffee-codex/p/clientserver.png)

**Correctness Specification**: The balance present in the client's account should **always** be greater than $10, regardless of any number of concurrent requests.

A Typescript implementation for this looks like:

```typescript
class BankDatabase {
  // account id -> balance
  private balances: Record<number, number>;

  constructor(initialBalances: Record<number, number>) {
    this.balances = initialBalances;
  }

  getBalance(clientId: number): number {
    return this.balances[clientId];
  }

  setBalance(clientId: number, newBalance: number) {
    this.balances[clientId] = newBalance;
  }
}

class BankServer {
  constructor(private db: BankDatabase) {}

  handleWithdraw(clientId: number, amount: number): string {
    const balance = this.db.getBalance(clientId);
    if (balance - amount >= 10) {
      this.db.setBalance(clientId, balance - amount);
      return `Withdraw successful. New balance: $${balance - amount}`;
    } else {
      return `Withdraw failed. Current balance: $${balance}`;
    }
  }
}

class Client {
  constructor(public id: number, private server: BankServer) {}

  withdraw(amount: number) {
    const result = this.server.handleWithdraw(this.id, amount);
    console.log(`[Client ${this.id}] ${result}`);
  }
}

const db = new BankDatabase({ alice: 100, bob: 15 });
const server = new BankServer(db);

const alice = new Client(10, server);
const bob = new Client(101, server);

alice.withdraw(50); // OK: leaves $50
bob.withdraw(10);   // Fail: would leave $5
```

This implementation is **not** concurrency safe, it doesn't use mutex or any other strategy to prevent multiple clients from taking the balance below $10, it's just to get an idea of what the application does.

### Client

We can start with [client.p](https://github.com/p-org/P/blob/master/Tutorial/1_ClientServer/PSrc/Client.p)

Since P communicates with events, let's look at the event types

```cs
type tWithDrawReq = (source: Client, accountId: int, amount: int, rId:int);
type tWithDrawResp = (status: tWithDrawRespStatus, accountId: int, balance: int, rId: int);

enum tWithDrawRespStatus {
  WITHDRAW_SUCCESS,
  WITHDRAW_ERROR
}

// client -> server
event eWithDrawReq : tWithDrawReq;
// server -> client
event eWithDrawResp: tWithDrawResp;
```

### Client Machine
The client machine has 3 states: `Init`, `WithdrawMoney`, and `NoMoneyToWithDraw` and has the following variables:

```cs
machine Client
{
  var server : BankServer;
  var accountId: int;
  var nextReqId : int;
  var numOfWithdrawOps: int;
  var currentBalance: int;

  start state Init  {
    entry (...){...}
  }

  state WithdrawMoney  {
    entry (...){...}
  }

  state NoMoneyToWithDraw  {
    entry (...){...}
  }
}
```

Every time the machine enters a state, its `entry` function is invoked. To start, the `Init` state looks like this:

```cs
start state Init {
  entry (input : (serv : BankServer, accountId: int, balance : int))
  {
    server = input.serv;
    currentBalance =  input.balance;
    accountId = input.accountId;
    nextReqId = accountId*100 + 1; // hacky way to ensure each client has a unique account id
    goto WithdrawMoney;
  }
}
```

This is effectively a constructor which sets up the variables and transitions to the next state, in this case `WithdrawMoney`, where the bulk of the client code is.

The WithdrawMoney will check if the balance is <= 10 and transition to `NoMoneyToWithDraw` if it is.

```cs
state NoMoneyToWithDraw {
  entry {
    // if I am here then the amount of money in my account should be exactly 10
    assert currentBalance == 10, "Hmm, I still have money that I can withdraw but I have reached NoMoneyToWithDraw state!";
    print format ("No Money to withdraw, waiting for more deposits!");
  }
}
```

```cs
state WithdrawMoney {
  entry {
    // If current balance is <= 10 then we need more deposits before any more withdrawal
    if(currentBalance <= 10)
      goto NoMoneyToWithDraw;

    // send withdraw request to the bank for a random amount between (1 to current balance + 1)
    send server, eWithDrawReq, (source = this, accountId = accountId, amount = WithdrawAmount(), rId = nextReqId);
    nextReqId = nextReqId + 1;
  }

  on eWithDrawResp do (resp: tWithDrawResp) {
    // bank always ensures that a client has atleast 10 dollars in the account
    assert resp.balance >= 10, "Bank balance must be greater than 10!!";
    if(resp.status == WITHDRAW_SUCCESS) // withdraw succeeded
    {
      print format ("Withdrawal with rId = {0} succeeded, new account balance = {1}", resp.rId, resp.balance);
      currentBalance = resp.balance;
    }
    else // withdraw failed
    {
      // if withdraw failed then the account balance must remain the same
      assert currentBalance == resp.balance,
        format ("Withdraw failed BUT the account balance changed! client thinks: {0}, bank balance: {1}", currentBalance, resp.balance);
      print format ("Withdrawal with rId = {0} failed, account balance = {1}", resp.rId, resp.balance);
    }

    if(currentBalance > 10)
    {
      print format ("Still have account balance = {0}, lets try and withdraw more", currentBalance);
      goto WithdrawMoney;
    }
  }
}

// function that returns a random integer between (1 to current balance + 1)
fun WithdrawAmount() : int {
  return choose(currentBalance) + 1;
}
```
Notice that the syntax to send a request looks like `send t,e,v;` which adds event `e` with payload `v` into the FIFO buffer of target machine `t`. Whenever the machines receives a response and is in the `WithdrawMoney` state, it will listen for the events using the `on` keyword.

### Bank Server Machine

While we can implement the logic for both the bank server and the database, we don't really need to. To see the full code with 2 additional machines, see [this](https://github.com/p-org/P/blob/master/Tutorial/1_ClientServer/PSrc/Server.p). However from the client's perspective, we could just create one state machine called `AbstractBankServer` which serves the same purpose. Of course this isn't always possible, especially if you’re testing the BankServer or Database logic itself, then we should use the `Server.p` instead.

[AbstractBankServer.p](https://github.com/p-org/P/blob/master/Tutorial/1_ClientServer/PSrc/AbstractBankServer.p)

```cs
machine AbstractBankServer
{
  // account balance: map from account-id to balance
  var balance: map[int, int];
  start state WaitForWithdrawRequests {
    entry (init_balance: map[int, int])
    {
      balance = init_balance;
    }

    on eWithDrawReq do (wReq: tWithDrawReq) {
      assert wReq.accountId in balance, "Invalid accountId received in the withdraw request!";
      if(balance[wReq.accountId] - wReq.amount >= 10)
      {
        balance[wReq.accountId] = balance[wReq.accountId] - wReq.amount;
        send wReq.source, eWithDrawResp,
          (status = WITHDRAW_SUCCESS, accountId = wReq.accountId, balance = balance[wReq.accountId], rId = wReq.rId);
      }
      else
      {
        send wReq.source, eWithDrawResp,
          (status = WITHDRAW_ERROR, accountId = wReq.accountId, balance = balance[wReq.accountId], rId = wReq.rId);
      }
    }
  }
}
```

This Bank Server sets the initial balance, then listens for `eWithDrawReq` events. Once it dequeues one, it will run the logic for checking balances and returning the response event to the source machine.

### Invariants with PSpec
Now let's see where P really shines. P allows us to define safety (nothing bad happens) and liveness (only good things happen) properties which will be checked while the model is running. 

First we specify the initial amounts, which will be provided by the test driver later:

[PSpec/BankBalanceCorrect.p](https://github.com/p-org/P/blob/master/Tutorial/1_ClientServer/PSpec/BankBalanceCorrect.p)

```cs
event eSpec_BankBalanceIsAlwaysCorrect_Init: map[int, int];
```

#### Safety Property: BankBalanceIsAlwaysCorrect
The safety property ensures that nothing bad happens. In this case, it means the bank balance does not fall below $10 and the bank does not withdraw more than it is told.

```cs
spec BankBalanceIsAlwaysCorrect observes eWithDrawReq,  eWithDrawResp, eSpec_BankBalanceIsAlwaysCorrect_Init {
  // keep track of the bank balance for each client: map from accountId to bank balance.
  var bankBalance: map[int, int];
  // keep track of the pending withdraw requests that have not been responded yet.
  // map from reqId -> withdraw request
  var pendingWithDraws: map[int, tWithDrawReq];

  start state Init {
    on eSpec_BankBalanceIsAlwaysCorrect_Init goto WaitForWithDrawReqAndResp with (balance: map[int, int]){
      bankBalance = balance;
    }
  }

  state WaitForWithDrawReqAndResp {
    on eWithDrawReq do (req: tWithDrawReq) {
      assert req.accountId in bankBalance,
        format ("Unknown accountId {0} in the withdraw request. Valid accountIds = {1}",
          req.accountId, keys(bankBalance));
      pendingWithDraws[req.rId] = req;
    }

    on eWithDrawResp do (resp: tWithDrawResp) {
      assert resp.accountId in bankBalance,
        format ("Unknown accountId {0} in the withdraw response!", resp.accountId);
      assert resp.rId in pendingWithDraws,
        format ("Unknown rId {0} in the withdraw response!", resp.rId);
      assert resp.balance >= 10,
        "Bank balance in all accounts must always be greater than or equal to 10!!";

      if(resp.status == WITHDRAW_SUCCESS)
      {
        assert resp.balance == bankBalance[resp.accountId] - pendingWithDraws[resp.rId].amount,
          format ("Bank balance for the account {0} is {1} and not the expected value {2}, Bank is lying!",
            resp.accountId, resp.balance, bankBalance[resp.accountId] - pendingWithDraws[resp.rId].amount);
        // update the new account balance
        bankBalance[resp.accountId] = resp.balance;
      }
      else
      {
        // bank can only reject a request if it will drop the balance below 10
        assert bankBalance[resp.accountId] - pendingWithDraws[resp.rId].amount < 10,
          format ("Bank must accept the withdraw request for {0}, bank balance is {1}!",
            pendingWithDraws[resp.rId].amount, bankBalance[resp.accountId]);
        // if withdraw failed then the account balance must remain the same
        assert bankBalance[resp.accountId] == resp.balance,
          format ("Withdraw failed BUT the account balance changed! actual: {0}, bank said: {1}",
            bankBalance[resp.accountId], resp.balance);
      }
    }
  }
}
```

Notice how the `observes` keyword tells the program to listen into whenever `observes eWithDrawReq, eWithDrawResp, eSpec_BankBalanceIsAlwaysCorrect_Init` are executed and asserts anything that could go wrong. Even though it seems like there is business logic in the test, which may seem counterintuitive, this is a fairly simple example. In reality, the spec is meant to show *what* should happen while the source should define *how* it happens. When running the test, P will interleave requests to hopefully catch any race conditions, violations, or ordering failures.

#### Liveness Property: GuaranteedWithDrawProgress 

This guarantees that all requests will eventually get served. `GuaranteedWithDrawProgress` + `BankBalanceIsAlwaysCorrect` together ensure that every withdraw request if allowed will eventually succeed and the bank cannot block correct withdrawal requests, leading to a semi-formal proof of correctness.

```cs
spec GuaranteedWithDrawProgress observes eWithDrawReq, eWithDrawResp {
  // keep track of the pending withdraw requests
  var pendingWDReqs: set[int];

  start state NopendingRequests {
    on eWithDrawReq goto PendingReqs with (req: tWithDrawReq) {
      pendingWDReqs += (req.rId);
    }
  }

  hot state PendingReqs {
    on eWithDrawResp do (resp: tWithDrawResp) {
      assert resp.rId in pendingWDReqs,
        format ("unexpected rId: {0} received, expected one of {1}", resp.rId, pendingWDReqs);
      pendingWDReqs -= (resp.rId);
      if(sizeof(pendingWDReqs) == 0) // all requests have been responded
        goto NopendingRequests;
    }

    on eWithDrawReq goto PendingReqs with (req: tWithDrawReq){
      pendingWDReqs += (req.rId);
    }
  }
}
```

The `hot` state indicates that the system satisfies a liveness specification if at the end of the execution the monitor is not in a hot state. The `hot` annotation is an intermediate error state; by the end the execution, we should not be in the `PendingReqs` state since that would mean there are unprocessed requests.

### Testing
The [PTst/TestDriver.p](https://github.com/p-org/P/blob/master/Tutorial/1_ClientServer/PTst/TestDriver.p) define the test harnesses (also using state machines!) and the scripts define the test cases.

#### Driver
This is also where we specify starting balances for clients
```cs
// Test driver that checks the system with a single Client.
machine TestWithSingleClient
{
  start state Init {
    entry {
      // since client
      SetupClientServerSystem(1);
    }
  }
}

// Test driver that checks the system with multiple Clients.
machine TestWithMultipleClients
{
  start state Init {
    entry {
      // multiple clients between (2, 4)
      SetupClientServerSystem(choose(3) + 2);
    }
  }
}

// creates a random map from accountId's to account balance of size `numAccounts`
fun CreateRandomInitialAccounts(numAccounts: int) : map[int, int]
{
  var i: int;
  var bankBalance: map[int, int];
  while(i < numAccounts) {
    bankBalance[i] = choose(100) + 10; // min 10 in the account
    i = i + 1;
  }
  return bankBalance;
}

// setup the client server system with one bank server and `numClients` clients.
fun SetupClientServerSystem(numClients: int)
{
  var i: int;
  var server: BankServer;
  var accountIds: seq[int];
  var initAccBalance: map[int, int];

  // randomly initialize the account balance for all clients
  initAccBalance = CreateRandomInitialAccounts(numClients);
  // create bank server with the init account balance
  server = new BankServer(initAccBalance);

  // before client starts sending any messages make sure we
  // initialize the monitors or specifications
  announce eSpec_BankBalanceIsAlwaysCorrect_Init, initAccBalance;

  accountIds = keys(initAccBalance);

  // create the clients
  while(i < sizeof(accountIds)) {
    new Client((serv = server, accountId = accountIds[i], balance = initAccBalance[accountIds[i]]));
    i = i + 1;
  }
}
```

And this is how we define the [test cases](https://github.com/p-org/P/blob/master/Tutorial/1_ClientServer/PTst/Testscript.p)
```cs
/* This file contains three different model checking scenarios */

// assert the properties for the single client and single server scenario
test tcSingleClient [main=TestWithSingleClient]:
  assert BankBalanceIsAlwaysCorrect, GuaranteedWithDrawProgress in
  (union Client, Bank, { TestWithSingleClient });

// assert the properties for the two+ clients and single server scenario
test tcMultipleClients [main=TestWithMultipleClients]:
  assert BankBalanceIsAlwaysCorrect, GuaranteedWithDrawProgress in
  (union Client, Bank, { TestWithMultipleClients });

// assert the properties for the single client and single server scenario but with abstract server
 test tcAbstractServer [main=TestWithSingleClient]:
  assert BankBalanceIsAlwaysCorrect, GuaranteedWithDrawProgress in
  (union Client, AbstractBank, { TestWithSingleClient });
```

This is how we specify which files to run and which invariants should hold true.

From there, we can run this command to explore 1000 schedules with the test case:

```shell
p check -tc tcAbstractServer -s 1000
```

Schedules are possible interleavings. In this client/server bank example, some possible interleavings are:
- Client A sends a withdraw request → server processes it → Client B sends a request
- Client A and Client B both send withdraw requests → server processes A’s first, then B’s
- Client A and Client B send requests → server reads A’s balance → processes B’s request → then completes A’s
- Server reads balances for both A and B before performing any withdrawals
- Client B sends a withdraw that would reduce balance below $10 → server correctly rejects it
- Server mistakenly approves both A and B withdraws, violating the $10 balance invariant (bug!)

Once we have the possible interleavings that can cause bugs, we can handle them appropriately in the real implementaition using Rust/Go/Java/whatever.

Very cool!

## References
- https://p-org.github.io/P/ (P Lang)