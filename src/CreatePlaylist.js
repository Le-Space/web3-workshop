import React, { useState } from "react";
import './styles/CreatePlaylist.scss'


const CreatePlaylist = (props) => {
  const [name, setName] = useState('')

  async function handleSubmit (event) {
    event.preventDefault()
    await props.store.createNewPlaylist(name)
    setName('')
    console.log("name",name)
  }

  async function handleChange(event) {
    event.preventDefault();
    setName(event.target.value)
  }

  return(
    <form onSubmit={handleSubmit}>
      <label htmlFor="playlistName">Enter a playlist name:</label><br />
      <input type="text" placeholder="New playlist" onChange={handleChange} value={name} />
      <input type="submit" value="Create" />
    </form>
  )
}

export default CreatePlaylist
