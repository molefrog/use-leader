import { createNanoEvents } from "nanoevents";

import {
  Channel,
  Election,
  Event,
  ID,
  Leader,
  Message,
  multicast,
} from "./protocol.js";

export interface CtorOptions {
  channel: Channel;
  leaderInit: Leader;
}

export interface Events {
  elected: (newLeader: Leader) => void;
}

/**
 * "Bully" leader election algorithm
 *
 * @example
 * ```ts
 * const node = new Bully(localStorageChannel)
 * node.isLeader() // true/false
 * node.die()
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Bully_algorithm}
 */
export default class Bully {
  readonly id: ID;

  readonly events = createNanoEvents<Events>();

  constructor(id: ID, { leaderInit, channel }: Partial<CtorOptions> = {}) {
    this.id = id;
    this.chan = channel || multicast(this.id);
    this.leader = leaderInit || Election;
  }

  leader: Leader;

  isElecting = () => this.leader === Election;
  isLeader = () => this.leader === this.id;

  private assignLeader(val: Leader) {
    const prev = this.leader;
    this.leader = val;

    if (prev !== val) {
      this.events.emit("elected", val);
    }
  }

  /*
   * Channel: sending and listening for messages
   */
  private readonly chan: Channel;
  private unsub?: ReturnType<Channel["listen"]>;

  private shout(evt: Event, to?: ID) {
    this.chan.emit({ evt, rcv: to });
  }

  private handleMsg = ({ evt, snd, rcv }: Message) => {
    // this message is for someone else, ignoring
    if (rcv && rcv !== this.id) return;

    if (evt === Event.Leader) {
      this.stop();
      this.assignLeader(snd); // we've elected the leader
    }

    if (evt === Event.Election && snd < this.id) {
      this.shout(Event.Disagree, snd); // no, you're not!
      if (!this.isElecting()) this.elect(); // i want to be a leader too
    }

    if (evt === Event.Disagree) {
      this.stop();
      this._electTm = setTimeout(() => this.elect(), 3 * this.chan.T);
    }

    if (evt === Event.Dead && snd === this.leader) {
      // the king is dead... re-elect!
      this.elect();
    }
  };

  elect() {
    this.stop();

    this.assignLeader(Election);
    this.shout(Event.Election); // i want to be a leader, any objections?

    // no one objects -> declare mysefl as the leader
    this._leadTm = setTimeout(() => this.lead(), 2 * this.chan.T);
  }

  lead() {
    this.assignLeader(this.id);
    this.shout(Event.Leader);
  }

  live() {
    this.unsub?.();
    this.unsub = this.chan.listen(this.handleMsg);

    if (this.isElecting()) {
      this.lead();
    } else {
      this.elect();
    }
  }

  die() {
    this.unsub?.();
    this.stop();
    this.assignLeader(Election);
    this.shout(Event.Dead);
  }

  destroy() {
    this.die();
    this.chan.destroy?.();
  }

  /*
   * Timeouts
   */
  private _leadTm?: Timer;
  private _electTm?: Timer;

  private stop() {
    // stop whatever you're doing
    clearTimeout(this._electTm);
    clearTimeout(this._leadTm);
  }
}

type Timer = ReturnType<typeof setTimeout>;
