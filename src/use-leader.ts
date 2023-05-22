import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { nanoid } from "nanoid";

import Bully from "./bully.js";
import { ID, Leader } from "./protocol.js";

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
  totaliatiran?: boolean;
}

/**
 * @returns instance of the election algorithm
 *
 * Re-uses an instance that has already been created by another component, and
 * shuts down this node when all components leave the tree.
 */
export const useElection = (options?: Options): Bully => {
  const manager = useInstanceManager();

  const hookRef = useRef(Symbol());
  const lookupRef = useRef<ID>();

  const [instance] = useState<Bully>(() => {
    const lookup = lookupRef.current = options?.id || "default";

    if (manager[lookup]) {
      manager[lookup].refs.add(hookRef.current);
    } else {
      // set up and run a new instance
      const instance = new Bully(options?.id || nanoid(8), {
        totalitarian: options?.totaliatiran,
      });
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
 * @param options additional options to customize the election behaviour
 * @returns ID of the current leader or null when election is in process
 */
export const useLeader = (options?: Options) => {
  const instance = useElection(options);

  const leaderId = useSyncExternalStore<Leader>(
    (fn) => instance.events.on("elected", fn),
    () => instance.leader,
    // leader is this node in SSR
    () => instance.id,
  );

  const isLeader = leaderId === instance.id;

  return { isLeader, id: instance.id, leaderId, ref: instance };
};
/**
 * Shortcut hook version that checks if current tab is a leading tab
 * @returns true if current tab is a leader
 */
export const useIsLeader = (options?: Options) => useLeader(options).isLeader;
