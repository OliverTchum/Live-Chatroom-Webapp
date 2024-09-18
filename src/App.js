import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';


import {useAuthState} from 'react-firebase-hooks/auth';
import{useCollectionData} from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby'; 
import ChatRoom from './components/ChatRoom';
import CreateRoom from './components/Lobby';

firebase.initializeApp({
  apiKey: "AIzaSyAt76iKg-FGt2M6ppBtZy5PWeA5fui69BY",
  authDomain: "tvlivechat101.firebaseapp.com",
  projectId: "tvlivechat101",
  storageBucket: "tvlivechat101.appspot.com",
  messagingSenderId: "67240455804",
  appId: "1:67240455804:web:5ffdd0e47f63d2220c63f9",
  measurementId: "G-EGKFC8X1XE"
}

)


const auth = firebase.auth();
const firestore = firebase.firestore();
export{auth,firestore}
function App() {
  const [user]=useAuthState(auth);
  return (
    <Router>
    <div className='App'>
      <header className='App-header'>
        
      
      <h1 className='app-title '>BuzzRooms</h1>
      </header>
      
      <section>
        
      {user ? <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/room/:id" element={<ChatRoom />} />
            </Routes>:<><p className="app-description">
          Welcome to BuzzRooms – the place where conversations come to life! 
          Whether you're passionate about specific topics, looking to share ideas, or simply want to meet new people with shared interests, 
          BuzzRooms lets you create and join chatrooms with ease. 
          Dive into discussions on anything from the latest trends to niche hobbies or hot debates, and connect with strangers who share your curiosity. 
          With BuzzRooms, you'll find exciting spaces to chat, engage, and build meaningful conversations on topics that matter to you. 
          Create your own room or buzz into one – the conversation starts here!
        </p>
            <SignIn /></>}
      </section>
    </div>
    </Router>
  )
}

function SignIn(){
  const GoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return <button className="sign-in" onClick={GoogleSignIn}>Sign In With Google</button>
}




export default App