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

const PeerItem =({ peer, index }) => {
    console.log("index",index)
    return (
        <li key={index | peer.id | '0'}>
            {peer}
        </li>
    )
}

const Playlists = (props) => {
    return (
        <div style={{maxWidth: "800px"}}>
            <CreatePlaylist {...props}/>
            <h1>PeerList</h1>
            <div>
                {
                    props.store.connectedPeers.map((p,index) => {
                        console.log("index-",index)
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
