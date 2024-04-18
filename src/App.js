'use client'
import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom'

import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level";

import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'

import store from './PlaylistsStore'
import Playlists from './Playlists'
import Playlist from './Playlist'
import './styles/index.scss'

class App extends Component {

    async componentDidMount() {
        console.log("component mounted")
        let blockstore = new LevelBlockstore("./helia-blocks")
        let datastore = new LevelDatastore("./helia-data")
        const libp2p = await createLibp2p({
            bootstrap({
                   list: [
                       '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                       '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
                       '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
                       '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
                       '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
                   ]
                                                           })})
        const ipfs = await createHelia({blockstore, datastore, libp2p})
        await store.connect(ipfs)
        window.store = store
        libp2p.addEventListener('connection:open', async (c) => {
            console.log("connection:open", c.detail.remoteAddr.toString())
        });

        libp2p.addEventListener('connection:close', (c) => {
            console.log("connection:close", c);
        });
    }

    async componentWillUnmount() {
            if (store.odb) await store.odb.stop();
            if (store.ipfs) await store.ipfs.stop();
    }

    render() {
      return (
          <div>
            <pre>      .-``'.  📻                            📻  .'''-.</pre>
            <pre>    .`   .`       ~ O R B I T   W A V E S ~      `.   '.</pre>
            <pre>_.-'     '._ <a href="https://github.com/orbitdb/web3-workshop/">github.com/orbitdb/web3-workshop/</a> _.'     '-._</pre>
            <Routes>
              <Route path="/orbitdb/:hash/:name" element={ <Playlist store={store}/> }/>
              <Route exact path="/" element={ <Playlists  store={store}/> }/>
            </Routes>
          </div>
      )
    }
}

export default App;
