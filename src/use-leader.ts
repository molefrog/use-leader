import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { nanoid } from "nanoid";

import Bully from "./bully.ts";
import { ID } from "./protocol.ts";

interface RefCounter {
  instance: Bully;
  refs: Set<symbol>;
}

const ManagerCtx = createContext<
  Record<ID | "default", RefCounter>
>({});

const useInstanceManager = () => useContext(ManagerCtx);

interface Options {
  id?: ID;
}

export const useLeaderInstance = (options?: Options): Bully => {
  const manager = useInstanceManager();

  const hookRef = useRef(Symbol());
  const lookupRef = useRef<ID>();

  const [instance] = useState<Bully>(() => {
    const lookup = lookupRef.current = options?.id || "default";

    if (manager[lookup]) {
      manager[lookup].refs.add(hookRef.current);
    } else {
      // set up and run a new instance
      const instance = new Bully(options?.id || nanoid());
      manager[lookup] = { instance, refs: new Set([hookRef.current]) };

      instance.live();
    }

    return manager[lookup].instance;
  });

  useEffect(() => {
    return () => {
      const key = lookupRef.current;

      if (key) {
        manager[key].refs.delete(hookRef.current);

        // no one is using it anymore, cleanup
        if (manager[key].refs.size === 0) {
          delete manager[key];
          instance.destroy();
        }
      }
    };
  }, []);

  return instance;
};

/**
 * @param options additional options to customize leader detection
 * @returns true if current node is a leader
 */
const useLeader = (options?: Options): boolean => {
  const instance = useLeaderInstance(options);

  return useSyncExternalStore(
    (fn) => instance.events.on("elected", fn),
    () => instance.isLeader(),
    () => true, // in SSR mode, always assume we're leading
  );
};

export default useLeader;
