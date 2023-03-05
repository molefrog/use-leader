import { assert, assertExists } from "std/testing/asserts.ts";
import { deadline, deferred, delay } from "std/async/mod.ts";

import { Event, multicast } from "./protocol.js";

const WAIT_FOR = 30;

Deno.test("create a channel", () => {
  const channel = multicast("foo");

  assertExists(channel.emit);
  assert(channel.T > 0, "channel must have T value that describes latency");

  channel.destroy();
});

Deno.test("broadcast message to others but not to itself", async () => {
  const ch1 = multicast("1");
  const ch2 = multicast("2");

  const promise = deferred<true>();

  ch1.listen(() => assert(false, "first channel should not get the msg!"));
  ch2.listen(() => promise.resolve(true));

  ch1.emit({ evt: Event.Leader, rcv: undefined });
  await deadline(promise, WAIT_FOR);

  ch1.destroy();
  ch2.destroy();
});

Deno.test("ignore messages sent to other participants", async () => {
  const ch1 = multicast("1");
  const ch2 = multicast("2");

  ch2.listen(() => assert(false, "second channel should not get the msg!"));
  ch1.emit({ evt: Event.Leader, rcv: "3" });

  await delay(WAIT_FOR);

  ch1.destroy();
  ch2.destroy();
});

Deno.test("ignore messages with version mismatch", async () => {
  const ch1 = multicast("foo", "v1.0.0");
  const ch2 = multicast("bar", "v2.1.0");

  ch2.listen(() => assert(false, "second channel should not get the msg!"));
  ch1.emit({ evt: Event.Dead, rcv: undefined });

  await delay(WAIT_FOR);

  ch1.destroy();
  ch2.destroy();
});
