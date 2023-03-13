/** @jsx h */
import { render, h } from "preact";
import useLeader from "../src/use-leader.ts";

const Foo = () => {
  const isLeader = useLeader();

  return (
    <div>
      Am I a leader? <code>{String(isLeader)}</code>
    </div>
  );
};

render(<Foo />, document.body);
