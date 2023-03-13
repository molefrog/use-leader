import { useState, useSyncExternalStore } from "react";
import { nanoid } from "nanoid";

import Bully from "./bully.ts";

const useLeader = () => {
  const [bully] = useState(() => {
    const nodeId = nanoid();

    const instance = new Bully(nodeId);
    instance.live();

    return instance;
  });

  const isLeader = useSyncExternalStore(
    (fn) => bully.events.on("elected", fn),
    () => bully.isLeader(),
    () => true,
  );

  return isLeader;
};

export default useLeader;
