import React, { useState, useEffect } from "react"
import './styles/Playlist.scss'

import { observer } from 'mobx-react'
import { getDataTransferFiles } from './helper.js'
import { Link } from 'react-router-dom'

const Header = ({ title }) => {
  return (
    <div className='header'>
      <Link to={`#/`} title="Back to Home"> .. </Link>
      <div id='title'>{title}</div>
    </div>
  )
}

const Playlist = (props) => {

    const [items, setItems] = useState([])
    const [dragActive, setDragActive] = useState(false)


    const address = document.location.hash.split("/").length>1?'/orbitdb/' +  document.location.hash.split("/")[2]:undefined
    useEffect(handlePlaylistNameChange, [address])

    function handlePlaylistNameChange () {

    let mounted = true
    if(!address) return

    function load () {
        props.store.joinPlaylist(address).then(async () => {
        if (mounted) {
          let all = await props.store.currentPlaylist.all() 
          setItems(all)
            props.store.currentPlaylist.events.on('joined', async () => {
               let all = await props.store.currentPlaylist.all() 
               setItems(all)
            })
        }
        })
    }
    load()

    return () => {
      setItems([])
      mounted = false
    }
  }

  async function onDrop (event) {
     event.preventDefault()
     setDragActive(false)
     const files = getDataTransferFiles(event)
     try {
       await props.store.sendFiles(files, address)
       setItems(props.store.currentPlaylist.all)
     } catch (err) {
       console.log("ERROR", err)
       throw err
     }
  }

  const PlaylistItem = ({ name, hash }) => {
    return (
      <div className='playlist-item' onClick={() => console.log(hash)}>{name}</div>
    )
  }

  return (
    <div className='Playlist'>
      <Header title={"props.name to be defined"} />
      <div className='dragZone'
          onDragOver={event => {
              event.preventDefault()
              !dragActive && setDragActive(true)
            }
          }
          onDrop={event => onDrop(event)}>
          <ul> {
            items.map(item => (
              <PlaylistItem key={item.hash}
                            name={item.value.meta.name}
                            hash={item.value.content} />
            )
          )}
          </ul>
        <h2 className="message">Drag audio files here to add them to the playlist</h2>
      </div>
    </div>
  )
}

const PlaylistView = (props) => props.store.isOnline ? (<Playlist {...props}/>) : null
export default observer(PlaylistView)
