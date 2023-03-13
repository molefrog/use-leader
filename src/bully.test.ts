import Bully from "./bully.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { assertSpyCalls, spy } from "std/testing/mock.ts";

Deno.test("contructor params", () => {
  const b = new Bully("id");
  assertEquals(b.id, "id");

  b.destroy();
});

Deno.test("subscribing to leader updates", () => {
  const b = new Bully("id");

  const onChange = spy();
  b.events.on("elected", onChange);

  b.lead(); // => "id"
  b.elect(); // => Election
  b.destroy(); // => Election

  assertSpyCalls(onChange, 2);
});
