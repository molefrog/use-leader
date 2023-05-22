/** @jsx h */
/** @jsxFrag Fragment */
import { render, h, Fragment } from "preact";
import { useState } from "preact/hooks";
import { nanoid } from "nanoid";

import useLeader, { useIsLeader } from "../src/use-leader.ts";

const IAmLeader = ({ leader = null }) => {
  const Label = () => {
    if (leader === null) return <s>"DEAD"</s>;
    return leader ? <mark>YES!</mark> : "NO";
  };

  return (
    <pre>
      {`const {isLeader} = useLeader() // ${String(leader)}\n\n`}
      {">>>Am I a Leader? "}

      <Label />
    </pre>
  );
};

const LeaderDetection = () => {
  const { id, leaderId, isLeader } = useLeader();
  const currentLeader = leaderId || "Election";

  return (
    <>
      <IAmLeader leader={true} />

      <pre>
        {"\n"}
        {`Node ID............${id}\n`}
        {`Leader ID..........${currentLeader}\n`}
      </pre>
    </>
  );
};

const App = () => {
  const [tabs, setTabs] = useState([["main", true]]);

  return tabs.map(([tabId, isRunning], idx) => {
    const isMainTab = tabId === "main";

    const toggle = () => {
      const t = [...tabs];
      t[idx] = [tabId, !isRunning];
      setTabs(t);
    };

    const spawn = () => setTabs([...tabs, [nanoid(), true]]);
    const kill = () => {
      const t = [...tabs];
      t.splice(idx, 1);
      setTabs(t);
    };

    return (
      <main key={tabId}>
        {isMainTab && (
          <>
            <h1>useLeader()</h1>
            <h2>
              <pre>
                {monoalign("React hook for optimistic", "center")}
                {monoalign("cross-tab leader election", "center")}
                <LnBrk />
              </pre>
            </h2>

            <pre>
              {" ".repeat(10)}
              <a href="https://github.com/molefrog/use-leader">{"-> GitHub & Docs"}</a>
            </pre>

            <LnBrk lines={2} />
          </>
        )}

        {isRunning ? <LeaderDetection /> : <IAmLeader leader={null} />}

        <pre>{"\n" + fillchr("~")}</pre>
        <footer>
          <nav>
            <a onClick={toggle}>{isRunning ? "▩ Stop" : "|> Run"}</a>
          </nav>

          <nav>
            {isMainTab && <a onClick={spawn}>᛭ Spawn</a>}
            {!isMainTab && <a onClick={kill}>X Close</a>}
          </nav>
        </footer>
      </main>
    );
  });
};

/** Logger */
const bcast = new BroadcastChannel(`use-leader_0`);
bcast.onmessage = (e) => {
  const { snd, evt, rcv } = e.data;

  const translate = {
    "🙋‍": "elect",
    "🙅‍": "disag",
    "🦸‍": "leadr",
    "💀": "xdead",
  };

  if (rcv) {
    console.log(`${evt} ${snd} -> ${rcv} :: ${translate[evt]} `);
  } else {
    console.log(`${evt} ${snd} :: ${translate[evt]}`);
  }
};

/** mono screen utils */
const WIDTH = 40;

const LnBrk = ({ lines = 1 }) => <pre>{Array.from({ length: lines }).fill("\n").join("")}</pre>;

const monoalign = (str, align = "center", brk = true, fill = " ", width = WIDTH) => {
  str = str.slice(0, width);
  const spaces = fill.repeat(Math.max(0, width - str.length));
  let out = str;

  switch (align) {
    case "left": {
      out = str + spaces;
      break;
    }

    case "right": {
      out = spaces + str;
      break;
    }

    case "center": {
      const left = spaces.slice(0, Math.floor(spaces.length / 2));
      const right = spaces.slice(Math.ceil(spaces.length / 2));
      out = left + str + right;
      break;
    }
  }
  return out + (brk ? "\n" : "");
};

const fillchr = (ch = " ") => monoalign("", "center", false, ch);

render(<App />, document.body);
