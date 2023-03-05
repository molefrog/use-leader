import { Channel, Election, Event, ID, Leader, Message } from "./protocol.js";

export interface LeaderSignal {
  value: Leader;
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
export class Bully {
  readonly id: ID = String(Math.floor(Math.random() * 1000));
  leader: LeaderSignal = { value: Election };

  private readonly chan: Channel;
  private unsub?: ReturnType<Channel["listen"]>;

  constructor(channel: Channel, signal?: LeaderSignal) {
    this.chan = channel;
    // this.leader ||= signal;

    this.live();
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
