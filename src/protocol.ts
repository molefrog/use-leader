/*
 * Leader election communication protocol
 */

export const VERSION = "0";

// node with higher ID wins the election (must be unique and comparable)
export type ID = string;

export enum Event {
  Election = "🙋‍",
  Disagree = "🙅‍",
  Leader = "🦸‍",
  Dead = "💀",
}

export interface Message {
  snd: ID; // sender
  rcv: ID | undefined; // receiver: all or one specific node
  evt: Event;
  ver: string;
}

// Current leader's ID (or `null` when this node is trying to get elected)
export const Election = null;

export type Leader = ID | typeof Election;

// Communication Channel
export interface Channel {
  emit: (msg: Omit<Omit<Message, "ver">, "snd">) => void;
  listen: (fn: (msg: Message) => void) => () => void;
  destroy: () => void;

  // Latency estimation of the channel (i.e. all messages should arrive within `T` ms)
  // It affects election timeouts, so slower channels require more time to settle on the leader
  readonly T: number;
}

export type CreateChannel = (
  id: ID,
  options?: { version: string },
) => Channel;

/**
 * Simple multicast channel that works over `BroadcastChannel`
 * @param id - participant id, so that others can send messages to this node
 * @param version - for testing purposes
 * @returns a newly created Channel
 */
export const multicast: CreateChannel = (
  id: ID,
  options: { version: string } = { version: VERSION },
) => {
  const bcast = new BroadcastChannel(`use-leader_${options.version}`);

  return {
    emit(params) {
      const message: Message = Object.assign(
        { ver: options.version, snd: id },
        params,
      );
      bcast.postMessage(message);
    },

    listen(fn) {
      const handler = ({ data: msg }: MessageEvent<Message>) => {
        if (typeof msg !== "object") return;
        // this message is for someone else, ignoring
        if (msg.rcv && msg.rcv !== id) return;

        fn(msg);
      };

      bcast.addEventListener("message", handler);
      return () => bcast.removeEventListener("message", handler);
    },

    destroy() {
      bcast.close();
    },

    T: 50,
  };
};
