import { makeObservable,observable,computed, action, flow } from 'mobx'
import { createOrbitDB, Identities, IPFSAccessController, OrbitDBAccessController } from "@orbitdb/core";
import { unixfs } from '@helia/unixfs'

class PlaylistsStore {

  playlists = []
  isOnline = false
  currentPlaylist = {}
  version = "v0.1"
  ipfs = null
  odb = null
  playlistDB = null

  constructor () {
    makeObservable(this, {
      playlists: observable,
      currentPlaylist: observable,
      connect: action,
      deletePlaylist: action,
      loadPlaylists: action,
      joinPlaylist: action,
      addFile: action,
      addToPlaylists: action
    })
  }

  async connect(ipfs, options = {}) {
    this.ipfs = ipfs

    const identities = await Identities({ ipfs }) //if you forget this you can spend a full day looking for the mistake
    const identity = options.identity || await identities.createIdentity({ id: 'user' })

    this.odb = await createOrbitDB({
      ipfs,identity,identities, directory: './web3-workshop-11052023' }
    )

   // useAccessController(IPFSAccessController)
    this.playlistDB = await this.odb.open("playlists", {
      type: 'documents',
      sync: true,
      AccessController: IPFSAccessController({ write: ['*'] })
    })

    this.playlistDB.events.on('join', async (peerId, heads) => {
      console.log(`join with peerId ${peerId}`,heads);
      await this.loadPlaylists()
    })

    this.playlistDB.events.on('update', async (entry) => {
      console.log("update event",entry);
      await this.loadPlaylists()
    })

    await this.loadPlaylists()
    this.isOnline = true

    setInterval(async () => {
      console.log(await this.ipfs.libp2p.services.pubsub.getTopics())
    } , 1000)

  }

  addToPlaylists = (entry) => {

    this.playlists.push({
      hash: entry.hash,
      key: entry.key,
      name: entry.value.name,
      address: entry.value.address
    })

  }

  async deletePlaylist(key) {
    try {
        await this.playlistDB.del(key);
        console.log(`Playlist at address ${key} deleted successfully.`);
        const index = this.playlists.findIndex(playlist => playlist.key === key);
        if (index !== -1) {
          this.playlists.splice(index, 1);
        }
    } catch (error) {
        console.error("Failed to delete playlist:", error);
    }
  }

  async loadPlaylists(entry) {
    if(entry?.op==='DEL') return // //entry = undefined //don't add this entry just load all records
    
    console.log("loading playlists from orbitdb")
    
    if(entry) {
      console.log("adding entry",entry)
      this.addToPlaylists(entry)
    }
    else {
      this.playlists = [];
      const allRecords = await this.playlistDB.all();
      Object.values(allRecords).forEach(record => {
        this.addToPlaylists(record);
      });
    }
  }

  async createNewPlaylist(name) {
    // useAccessController(OrbitDBAccessController)
    const playlist = await this.odb.open(name, {
      type: 'documents',
      sync: true,
      AccessController: OrbitDBAccessController({ write: [this.odb.identity.id]})
    })
    await playlist.drop()

    const p = {
      _id: new Date().getTime(),
      name,
      address: playlist.address.toString()
    }

    const hash = await this.playlistDB.put(p)
    return hash
  }

  async joinPlaylist (address) {
    if (this.odb && address) {
      const playlist = await this.odb.open(address)
      this.currentPlaylist = playlist
    }
  }

  sendFiles (files, address) {
    const promises = []
    for (let i = 0; i < files.length; i++) {
      promises.push(this._sendFile(files[i], address))
    }
    return Promise.all(promises)
  }

  async sha256 (input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async _sendFile (file, address) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = async event => {
        const meta  = {
          filename: file.name,
          buffer: event.target.result,
          meta: { mimeType: file.type, size: file.size }
        }
        meta._id = await this.sha256(meta)
        const f = await this.addFile(address,meta)
        resolve(f)
      }
      reader.readAsArrayBuffer(file)
    })
  }

  async addFile (address, source) {
    if (!source || !source.filename) {
      throw new Error('Filename not specified')
    }
    const name = source.filename.split('/').pop()
    const size = source.meta && source.meta.size ? source.meta.size : 0

    const fs = unixfs(this.ipfs)
    const cid = await fs.addBytes(Buffer.from(source.buffer))
    console.log("upload", cid.toString())

    // Create a post with the CID instead of hash
    const meta =  {
      from: this.odb.identity.id,
      type: 'file',
      ts: new Date().getTime()
    }

    const data = {
      content: cid.toString(),
      meta: Object.assign(meta,
          { size, name },
          source.meta || {}
      )
    }
    data._id = await this.sha256(meta)

    return this.addToPlaylist(address, data)
  }

  async addToPlaylist (address, data) {
    const documents = await this.odb.open(address)
    if (documents) {
      const hash = await documents.put(data)
      return documents.get(hash)
    }
    return
  }
}

const store = window.store = new PlaylistsStore()
export default store
