/** @jsx h */
import { nanoid } from "nanoid";
import { render, h } from "preact";
import { useState } from "preact/hooks";
import useLeader, { useLeaderInstance } from "../src/use-leader.ts";

const LeaderDetection = () => {
  const ref = useLeaderInstance();
  const isLeader = useLeader();

  const currentLeader = ref.leader || "Election";

  return (
    <div style={{ marginBottom: "16px" }}>
      <p>
        Am I a leader? <code>{String(isLeader)}</code>
      </p>
      <small>
        Node ID: <code>{ref.id}</code>
        <br /> Leader ID: <code>{ref.leader}</code>
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
