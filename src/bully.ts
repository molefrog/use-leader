import {
  Channel,
  Election,
  Event,
  ID,
  Leader,
  Message,
  multicast,
} from "./protocol.js";

export interface LeaderRef {
  value: Leader;
}

export interface CtorOptions {
  leaderRef: LeaderRef;
  channel: Channel;
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
  readonly leader: LeaderRef;

  private readonly chan: Channel;
  private unsub?: ReturnType<Channel["listen"]>;

  constructor(id: ID, { leaderRef, channel }: Partial<CtorOptions> = {}) {
    this.id = id;
    this.leader = leaderRef || { value: Election };
    this.chan = channel || multicast(this.id);
  }

  isElecting = () => this.leader.value === Election;
  isLeader = () => this.leader.value === this.id;

  shout = (evt: Event, to?: ID) => this.chan.emit({ evt, rcv: to });

  elect() {
    this.stop();

    this.leader.value = Election;
    this.shout(Event.Election); // i want to be a leader, any objections?

    // no one objects -> declare mysefl as the leader
    this._leadTm = setTimeout(() => this.lead(), 2 * this.chan.T);
  }

  handleMsg = ({ evt, snd, rcv }: Message) => {
    // this message is for someone else, ignoring
    if (rcv && rcv !== this.id) return;

    if (evt === Event.Leader) {
      this.stop();
      this.leader.value = snd; // we've elected the leader
    }

    if (evt === Event.Election && snd < this.id) {
      this.shout(Event.Disagree, snd); // no, you're not!
      if (!this.isElecting()) this.elect(); // i want to be a leader too
    }

    if (evt === Event.Disagree) {
      this.stop();
      this._electTm = setTimeout(() => this.elect(), 3 * this.chan.T);
    }

    if (evt === Event.Dead && snd === this.leader.value) {
      // the king is dead... re-elect!
      this.elect();
    }
  };

  lead() {
    this.leader.value = this.id;
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
    this.leader.value = Election;
    this.shout(Event.Dead);
  }

  destroy() {
    this.chan.destroy?.();
  }

  /*
   * Timeouts
   */
  private _leadTm?: Timer;
  private _electTm?: Timer;

  stop() {
    // stop whatever you're doing
    clearTimeout(this._electTm);
    clearTimeout(this._leadTm);
  }
}

type Timer = ReturnType<typeof setTimeout>;
