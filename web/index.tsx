/** @jsx h */
import { render, h } from "preact";
import { useState } from "preact/hooks";

import useLeader, { useIsLeader } from "../src/use-leader.ts";

const LeaderDetection = () => {
  const { id, leaderId, isLeader } = useLeader();
  const currentLeader = leaderId || "Election";

  return (
    <div>
      <pre>
        {"\n\n"}
        {">>>Am I a Leader? "}
        {isLeader ? <mark>YES!</mark> : "NO"}
        {"\n\n"}
        {`Node ID............${id}\n`}
        {`Leader ID..........${currentLeader}\n`}
      </pre>
    </div>
  );
};

const IsLeader = (props) => {
  const isLeader = useIsLeader();
  return isLeader ? props.yes : props.no;
};

const App = () => {
  const [demoActive, setDemoActive] = useState<boolean>(true);

  return (
    <main>
      <h1>useLeader()</h1>
      <h2>
        <pre>
          {"       React hook for optimistic        \n"}
          {"       cross-tab leader election        "}
        </pre>
      </h2>

      <pre>
        {"\n              "}
        <a href="https://github.com/molefrog/use-leader">{"-> GitHub"}</a>
      </pre>

      <pre>
        {"\n\n"}
        {"const {isLeader} = useLeader() // "}
        {demoActive ? <IsLeader yes="true" no="false"></IsLeader> : "false"}

        {"\n\n"}
        <a href="javascript:void(0)" onClick={() => setDemoActive((x) => !x)}>
          {demoActive ? "▩ Pause" : "|> Play"}
        </a>
      </pre>

      {demoActive && <LeaderDetection />}
    </main>
  );
};

render(<App />, document.body);
