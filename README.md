```js
/**
 *  `useLeader()` – React hook that checks whether the current tab is the primary one.
 *  works over `BroadcastChannel` and uses slightly modified "Bully" leader election.
 */

// simple usage
const { isLeader } = useLeader() // true/false

// each node has a unique identifier, when the leader is elected, every node holds 
// the leading id. these ids are randomly generated... so why would you want 
// to override it?
const { isLeader } = useLeader({ id: 'my1d' })

// the answer is instance sharing. if your app has two places where `useLeader()` 
// is called, they both have access to the same node instance.

<CompOne />   // useLeader() - true, id = "abc"
<CompTwo />   // useLeader() - true, id = "abc"
<CompThree /> // useLeader({ id: "efg" }) - false, id = "efg"

// when all components that rely on `useLeader()` exit the tree, the node shuts down,
// meaning that the other tabs now can take the advantage and relect the leader

// "totalitarian" mode (`true` by default) means that when a new node enters the quorum, 
// the existing leader won't give up power even if the new node's id is higher.

useLeader({ totalitarian: false })

// see website https://use-leader.surge.sh/ for interactive demos
```
