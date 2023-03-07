import Bully from "./bully.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("contructor params", () => {
  const b = new Bully("id");
  assertEquals(b.id, "id");
  b.destroy();
});
