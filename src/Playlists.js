import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import './styles/Playlists.scss'
import CreatePlaylist from './CreatePlaylist'



const PlaylistItem =({ playlist, store }) => {
    return (
        <li>
            <Link to={`#${playlist?.address}`}>{playlist?.name}</Link>
            <span style={{fontSize: '0.4em', cursor: 'pointer'}} onClick={(e) => {
                console.log("deleting playlist!",playlist.key)
                e.stopPropagation();
                store.deletePlaylist(playlist.key);
            }}>del</span>
        </li>
    )
}

const PeerItem =({ peer, index, store }) => {
    return (
        <li key={index}>
            {peer}
        </li>
    )
}

const Playlists = (props) => {
    return (
        <div style={{maxWidth: "800px"}}>
            <CreatePlaylist {...props}/>
            <h2>PeerId: {props.store.ipfs?.libp2p?.peerId.toString()}</h2>
            <h2>PeerList</h2>
            <div>
                {
                    props.store.connectedPeers.map((p,index) => {
                        return (<PeerItem index={index} peer={p} store={props.store}/>)
                    })
                }
            </div>

            <ul className="playlist-items"> {
                props.store.playlists.map(playlist => {
                        return (<PlaylistItem key={playlist.key} playlist={playlist} store={props.store}/>)
                    }
                )}
            </ul>
            <button onClick={async () => {
                props.store.playlistDB.drop()
                props.store.playlists = []
            }}>Drop DB locally
            </button>
        </div>
    )
}
export default observer(Playlists)
