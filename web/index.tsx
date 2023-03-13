/** @jsx h */
import { render, h } from "preact";
import useLeader from "../src/use-leader.ts";

const Foo = () => {
  const isLeader = useLeader();
  return <div>{JSON.stringify(isLeader)}</div>;
};

render(<Foo />, document.body);
