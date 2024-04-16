import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { webTransport } from "@libp2p/webtransport";
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { pubsubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";
import { identify } from '@libp2p/identify'
import { autoNAT } from '@libp2p/autonat'
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { ping } from '@libp2p/ping'
import { dcutr } from '@libp2p/dcutr'
// import { kadDHT } from '@libp2p/kad-dht'
import { FaultTolerance } from '@libp2p/interface-transport'
// const multiaddrs = ["/dns4/ipfs.le-space.de/tcp/443/wss/p2p/12D3KooWAJjbRkp8FPF5MKgMU53aUTxWkqvDrs4zc1VMbwRwfsbE"]

// const multiaddrs = ['/ip4/192.168.243.226/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWCKAZ69AYhNnNzbnC73NX9MZqZQyXicFmarAqW2h2Ejuy']
const multiaddrs = ['/ip4/159.69.119.82/udp/9090/webrtc-direct/certhash/uEiAIh0DoA5Qk2xTpc_j58KZMvww9CQzN6UNgsJ-DTuM6XQ/p2p/12D3KooWEwE6YXJ1sKUEn6tsWzBEC4816PrFSKTri9vxzZyDUgFN']
// const multiaddrs = ['/ip4/192.168.0.104/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWKjNwG54UDVgtScSDhH4ZdganxVf6PWPCrqB5FeJvoEnP']
// const multiaddrs = 192.168.0.104
//     import.meta.env.MODE === 'development'
//         ? import.meta.env.VITE_SEED_NODES_DEV.replace('\n','').split(',')
//         : import.meta.env.VITE_SEED_NODES.replace('\n','').split(',')
// console.log("multiaddrs",multiaddrs)
const pubSubPeerDiscoveryTopics =  ['dcontact._peer-discovery._p2p._pubsub']
//const pubSubPeerDiscoveryTopics =
// 	import.meta.env.MODE === 'development'
// 		? import.meta.env.VITE_P2P_PUPSUB_DEV.replace('\n','').split(',')
//         : import.meta.env.VITE_P2P_PUPSUB.replace('\n','').split(',')

export const bootstrapConfig = {list: multiaddrs};

export const config = {
    addresses: {
        // swarm: [address],
        listen: [
            "/webrtc",
            "/webtransport",
            "/wss", "/ws",
        ]
    },
    transports: [
        webSockets({filter: filters.all}),
        webRTC({
            rtcConfiguration: {
                iceServers:[{
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478'
                    ]
                }]
            }
        }),
        webRTCDirect(),
        webTransport(),
        circuitRelayTransport({ discoverRelays: 1 }),
        // kadDHT({}),
    ],
    connectionEncryption: [noise()],
    transportManager: {
        faultTolerance: FaultTolerance.NO_FATAL
    },
    streamMuxers: [
        yamux(),
    ],
    connectionGater: {
        denyDialMultiaddr: () => {
            return false
        }
    },
    peerDiscovery: [
        bootstrap(bootstrapConfig),
        pubsubPeerDiscovery({
            interval: 10000,
            topics: pubSubPeerDiscoveryTopics,
            listenOnly: false
        })
    ],
    services: {
        ping: ping({
            protocolPrefix: 'dContact', // default
        }),
        identify: identify(),
        autoNAT: autoNAT(),
        dcutr: dcutr(),
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, canRelayMessage: true }),
/*        aminoDHT: kadDHT({
            protocol: '/ipfs/kad/1.0.0',
            peerInfoMapper: removePrivateAddressesMapper
        })*/
        // dht: kadDHT({
        //     protocolPrefix: "/svelte-pubsub",
        //     maxInboundStreams: 5000,
        //     maxOutboundStreams: 5000,
        //     clientMode: true,
        // })
    }
}