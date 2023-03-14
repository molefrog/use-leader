/** @jsx h */
import { nanoid } from "nanoid";
import { render, h } from "preact";
import { useState } from "preact/hooks";
import useLeader, { useIsLeader } from "../src/use-leader.ts";

const LeaderDetection = () => {
  const { id, leaderId, isLeader } = useLeader();
  const currentLeader = leaderId || "Election";

  return (
    <div style={{ marginBottom: "16px" }}>
      <p>
        Am I a leader? <code>{String(isLeader)}</code>
      </p>
      <small>
        Node ID: <code>{id}</code>
        <br /> Leader ID: <code>{leaderId}</code>
      </small>
    </div>
  );
};

const Foo = () => {
  const [mount, setMount] = useState<boolean>(true);

  return (
    <div>
      <button onClick={() => setMount((x) => !x)}>{mount ? "stop" : "start"}</button>
      {mount && <LeaderDetection />}
      {mount && <LeaderDetection />}
    </div>
  );
};

render(<Foo />, document.body);
