import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';

import { auth,firestore } from '../App';







function Lobby() {
    const roomRef = firestore.collection('rooms');
    const query = roomRef.orderBy('createdAt');
    const [rooms] = useCollectionData(query, {idField: 'id'});
   const [showCreateRoom,setShowCreateRoom]=useState(false);
   
  console.log(rooms);

    const joinRoom = async(id) => {
        

        const roomMembers = firestore.collection('rooms').doc(id).collection('members');
        
        await roomMembers.doc(auth.currentUser.uid).set({
            MemberId:auth.currentUser.uid,
            MemberName:auth.currentUser.displayName,
        })
        
    }
    
     return(
       <div>
         
         {!rooms || rooms.length === 0 ? (
           <h1>No Current Chat Rooms</h1>
         ) : (
          <section className="room-grid">
          {rooms.map((room) => (
            <Link key={room.id} to={`/room/${room.id}`} onClick={() => joinRoom(room.id)} className="room-card">
                
              <h3>{room.name}</h3>
              <p>Max Size: {room.maxSize}</p>
              <p>Current Members</p>
              
            </Link>
          ))}
        </section>
         )}
         {showCreateRoom && <CreateRoom />}
         <button onClick={() => setShowCreateRoom(!showCreateRoom)}>
           {showCreateRoom ? "Cancel" : "Create a Room"}
         </button>
       </div>
     );
   }

   function CreateRoom(){
    const [roomNameValue,setRoomNameValue]=useState('');
    const [maxSizeValue,setMaxSizeValue]=useState(10);
    const roomRef = firestore.collection('rooms');
    const navigate = useNavigate();
    
    const newRoom = async(e) => {
      e.preventDefault();
      
    const roomDoc= await roomRef.add({
      name:roomNameValue,
      maxSize: maxSizeValue,
      host:auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      
    })
    
    roomDoc.update({id:roomDoc.id});
    console.log("hello");
    navigate(`/room/${roomDoc.id}`);
  }
  
    return(
      <form class="roomcreation" onSubmit={newRoom}>
         <label>room name: <input type='text' required value={roomNameValue} onChange={(e)=> setRoomNameValue(e.target.value)}/></label>
         <label>Max size: <input type='number' min='1' max='20' value={maxSizeValue} onChange={(e)=> setMaxSizeValue(e.target.value)}/></label>
         <button type='submit'>Create Room</button>
      </form>
    )
  }

  export default Lobby