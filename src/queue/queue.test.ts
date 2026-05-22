import { describe, expect, test } from "bun:test";

import { Queue, QueueFilledError, QueueJobAbortedError } from "./queue.js";

import { Job } from "./job.js";

const makeJob: () => Job<unknown> = () => new Job<unknown>(new AbortController(), async () => "ok");

describe("Queue", () => {
    test("enQueue then waitDeQueue returns the job", async () => {
        const q = new Queue({ maxJobs: 10 });

        const j = makeJob();

        q.enQueue(j);

        expect(await q.waitDeQueue()).toBe(j);
    });

    test("enQueue throws QueueFilledError when full", () => {
        const q = new Queue({ maxJobs: 1 });

        q.enQueue(makeJob());

        expect(() => q.enQueue(makeJob())).toThrowError(QueueFilledError);
    })

    test("enQueue throws on an already-aborted job", () => {
        const q = new Queue({ maxJobs: 10 });

        const j = makeJob();

        j.controller.abort();

        expect(() => q.enQueue(j)).toThrowError(QueueJobAbortedError);
    })

    test("waitDeQueue with an aborted signal rejects", () => {
        const q = new Queue({ maxJobs: 10 });

        const j = q.waitDeQueue(AbortSignal.abort());

        expect(j).rejects.toThrowError(QueueJobAbortedError);
    })

    test("dequeues in FIFO order", async () => {
        const q = new Queue({ maxJobs: 10 });

        const j1 = makeJob();
        const j2 = makeJob();
        const j3 = makeJob();

        q.enQueue(j1);
        q.enQueue(j2);
        q.enQueue(j3);

        expect(await q.waitDeQueue()).toBe(j1);
        expect(await q.waitDeQueue()).toBe(j2);
        expect(await q.waitDeQueue()).toBe(j3);
    })
})
