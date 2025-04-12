---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - How AWS Lambda Works (Part 1)"
description: "Learning about Lambda"
pubDate: "April 5, 2025"
heroImage: "/coffee-codex/lambda/cover.png"
---

## Introduction
I'm at Cafe Hagen in Bellevue, WA and I'm learning about AWS Lambda. I spent the past week watching videos about Lambda and reading the Firecracker paper.

![Coffee](/coffee-codex/lambda/coffee.png)

## What is Lambda
AWS Lambda is a service from AWS that allows you to run code whenever you want, however many times you want. It's as simple as calling a function locally, but it runs on the cloud so you can easily use it in your application to do things like API responses, file processing, cron jobs, and really anything else that requires computation power. An example of writing a lambda function in Typescript using the Node runtime looks like this:

This example is using AWS Cloud Development Kit (CDK)

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

class MyLambdaStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Define the Lambda function with inline code
    new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        export const handler = async (event) => {
          console.log('Received event:', JSON.stringify(event, null, 2));
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Hello from Lambda using ES modules!' }),
          };
        };
      `),
    });
  }
}

const app = new cdk.App();
new MyLambdaStack(app, 'MyLambdaStack');
```

Note that Lambda has resource limits, such as you can run a function for a maximum of 15 minutes.

After it's deployed, it'll appear on your AWS console and can be invoked from the console, using the `@aws-sdk`, or using an API gateway.

## The Frontend
When I'm talking about the Frontend here, I'm not referring to the UI of the webpage, that's just what Lambda calls the first line of defense for a request. When a request is sent to Lambda, the Frontend load balancers receive the request, it sends it to a **Frontend Invoke Service** which is responsible for invoking the lambda workers. We'll get to the workers soon, but let's just abstract them as "something that runs our function" for now. 

The frontend will authenticate the request and check the metadata/limits associated with the account with the **Counting Service**

There is also a **Control Plane Service** that manages background tasks and assignment service nodes but we won't cover that in this post.

For each request, the **Frontend Invoke Service** reaches out to the **Assignment service** to get the information of which worker to send the task to. If there is one ready, then the assignment service will see it and return the information. However when there is no worker ready (such as if it is the first invocation or there is high demand), then the Assignment service has to ask the **Placement Service** to find the optimal place to put the new worker. 

Once a worker is confirmed to exist, then the Frontend Service can send the payload directly to the worker.

A diagram of the flow looks like this:

![Sync Path](/coffee-codex/lambda/sync-path.png)

The Firecracker research paper has something called the **Worker Manager Service** but this was replaced with the **Assignment Service**.

The summary is that each request gets sent a the **Frontend Invoke Service** which will get the worker to send the payload to from the **Assignment Service**. If the Assignment Service has a worker ready, it returns that, otherwise it asks the placement service to create one. The worker communicates with the Assignment service that it's done with the invoke and is ready for another.

This is an **extremely** simplified version of the Lambda service:

```typescript
class FrontendInvokeService {
  assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  onReceiveRequest(request: { payload: any }): void {
    const worker = this.assignmentService.getWorker();
    worker.execute(request.payload);
  }
}

class AssignmentService {
  placementService: PlacementService;
  workers: Worker[];

  constructor() {
    this.placementService = new PlacementService();
    // Initialize workers array with Worker instances...
    this.workers = [new Worker(), new Worker()];
  }

  getWorker(): Worker {
    let idleWorker = this.workers.find(worker => worker.state === 'IDLE');

    if (!idleWorker) {
      idleWorker = this.placementService.getNewWorker();
    }

    return idleWorker;
  }
}

class PlacementService {
  getNewWorker(): Worker {
    // Implement logic to get a new worker
    return abstractedLogicForGettingAWorker();
  }
}

class Worker {
  state: 'IDLE' | 'BUSY' | 'DEAD';

  constructor() {
    this.state = 'IDLE';
  }
  
  execute(payload: any): void {
    this.state = 'BUSY';
    abstractedDoWork(payload);
    this.state = 'IDLE';
  }
}
```

## The Workers

Ok now let's get to the workers! The simplest idea for workers is to match one request to one server. The obvious downside here is that Lambda has a limited number of servers. If you have a 1:1 matching, you will run out of servers to run on.

With that being said, this approach is actually a great showing of what we want in a worker, specifically with security and isolation. You can't get much more secure than running a function on a completely separate machine from another function, so there's no possibility of your code impacting another customer.

However we still want multi-tenancy, which is where one machine can handle multiple requests in an isolated way. The first thought is generally to use containers, but this wasn’t good enough for Lambda since containers still run on the same kernel... so Lambda had to find something else.”

Unfortunately I'm running out of time at this cafe, so I'll have to get into the nitty-gritty of how Lambda's microVM approach works next time!

## References
- https://www.youtube.com/watch?v=0_jfH6qijVY (AWS re:Invent 2022 - A closer look at AWS Lambda)