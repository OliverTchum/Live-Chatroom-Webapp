import React, { useRef, useState,useEffect} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';

import { auth,firestore } from '../App';
import { getCountFromServer } from 'firebase/firestore';



function ChatRoom(){
    const { id } = useParams();
    const bottom = useRef();
    const membersRef = firestore.collection('rooms').doc(id).collection('members');
    const messagesRef = firestore.collection('rooms').doc(id).collection('messages'); 
    const banRef =  firestore.collection('rooms').doc(id).collection('banned');
    const query = messagesRef.orderBy('createdAt').limitToLast(50);
    const [messages] = useCollectionData(query, {idField: 'id'});
    const [members] = useCollectionData(membersRef, { idField: 'id' });
    const [formValue,setFormValue]=useState('');
    const navigate = useNavigate(); 
    const [showMenu, setShowMenu] = useState(false);
    const [isHost, setIsHost] = useState(false);

    


  //adds messages sent to the database
    const sendMessage = async(e) => {
      e.preventDefault();
        if (formValue.trim() === '') return;
      const {uid, photoURL} =auth.currentUser;
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        photoURL,
        uid
      })
      setFormValue('');
      bottom.current.scrollIntoView({behaviour:'smooth'});
    }
    //removes user from room/members collection in the database when they leave
    const leaveRoom = async () => {
        const memberRef = firestore.collection('rooms').doc(id).collection('members').doc(auth.currentUser.uid);
        await memberRef.delete().catch((error) => {
            console.error("Error removing user from room members:", error);
        });
        if (isHost) {
            //deletes room from firestore if the host leaves
            await firestore.collection('rooms').doc(id).delete().catch((error) => {
                console.error("Error deleting room:", error);
            });
        }
        
        navigate('/');
    };

    const kickMember = async (member) => {
        
        const memberRef = membersRef.doc(member.MemberId);
        await banRef.doc(member.MemberId).set({
            MemberId: member.MemberId,
            MemberName: member.MemberName,
        });

        await memberRef.delete().catch((error) => {
            console.error("Error kicking member:", error);
        });
    };
    //makes a user the new host if chosen by the host
    const makeHost = async (member) => {
        await firestore.collection('rooms').doc(id).update({
            host: member.MemberId,
        });

    };
    
    useEffect(() => {
        const roomDoc = firestore.collection('rooms').doc(id);
        const memberRef = roomDoc.collection('members').doc(auth.currentUser.uid);
       
        const addUserToRoom = async () => {
            //adds new room members to the database
            await memberRef.set({
                MemberId: auth.currentUser.uid,
                MemberName: auth.currentUser.displayName,
            });
   
            const roomSnapshot = await roomDoc.get();
            if (roomSnapshot.exists) {
                setIsHost(roomSnapshot.data().host === auth.currentUser.uid);
            }
        };
        let alertshown=false;
        const unsubscribeMembers = roomDoc.collection('members').onSnapshot(async (snapshot) => {
            const membersCount = snapshot.size;
            console.log(`Number of members: ${membersCount}`);
    
            // Update the currentSize field in the room document with the latest count
            await roomDoc.update({
                currentSize: membersCount
            }).catch((error) => {
                console.error("Error updating room size: ", error);
            });
        });
    

        const unsubscribeHost = roomDoc.onSnapshot((doc) => {
            if (doc.exists) {
                const roomData = doc.data();
                setIsHost(roomData.host === auth.currentUser.uid);
            }
        });    
        //checks firestore if a user has been banned
        const unsubscribeBannedUsers = banRef.doc(auth.currentUser.uid).onSnapshot(snapshot => {
            if (snapshot.exists) {
                if (!alertshown){
                    alertshown=true;
                console.log("new one");
                alert('You have been kicked from the room. You will be redirected to the lobby.');
                leaveRoom(); }
            }
        });
        //checks if the host is still in the room and closes the room for all other users if they've left
        const roomDocRef = firestore.collection('rooms').doc(id);
        const unsubscribe = roomDocRef.onSnapshot(async doc => {
            if (!doc.exists) {
                if (!alertshown){
                    alertshown=true;
                setTimeout(async () => {
                alert('The host has left the room. You will be redirected to the lobby.');})
                navigate('/');}
            }
            
        });
        

        addUserToRoom();
        
        return () => {
            memberRef.delete().catch((error) => {
                console.error("Error removing user from room members:", error);
            });unsubscribeBannedUsers();
            unsubscribe();unsubscribeHost();unsubscribeMembers();
        };
    }, [id]);
    return(
      <>
           <header>
                <button onClick={leaveRoom}>Leave Room</button>
                {isHost && (
                    <button onClick={() => setShowMenu(!showMenu)}>
                        {showMenu ? 'Close' : 'Show Members'}
                    </button>
                )}
            </header>
            {showMenu && isHost && (
                 <div className="member-menu">
                    <button className="close-menu" onClick={() => setShowMenu(false)}>Close Menu</button>
                    <h1>Room Members</h1>
                    {members && members.map(member => (
                        <div key={member.MemberId} className="member-item">
                            <p>{member.MemberName}</p>
                            {member.MemberId!==auth.currentUser.uid &&
                            <button className='menu-button' onClick={() => kickMember(member)}>Kick</button>}
                            {member.MemberId!==auth.currentUser.uid &&
                            <button className='menu-button' onClick={() => makeHost(member)}>Make Host</button>}
                        </div>
                        
                    ))}
                </div>
            )}
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
      </div>
      <div ref={bottom}></div>
      <div id="block"></div>
      <form id="messagesend" onSubmit={sendMessage}>
        <input type='text' value={formValue} maxLength={1000} onChange={(e)=> setFormValue(e.target.value)}/>
        <button type="submit">Send</button>
      </form>
      </>
    )
  }
  
  function ChatMessage(props){
    const {text, uid, photoURL} = props.message;
  
    const messageType= uid === auth.currentUser.uid ? 'sent' : 'received';
  
    return(
      <div className={`message ${messageType}`}>
        <img src={photoURL} alt='profile pic'/>
      <p>{text}</p>
      </div>)
  }
  
  
  export default ChatRoom
  