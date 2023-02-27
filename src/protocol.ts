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
  emit: (msg: Omit<Message, "ver">) => void;
  listen: (fn: (msg: Message) => void) => () => void;

  // Latency estimation of the channel (i.e. all messages should arrive within `T` ms)
  // It affects election timeouts, so slower channels require more time to settle on the leader
  T: number;
}
