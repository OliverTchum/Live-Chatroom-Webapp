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
      <div><SignOut/></div>
      </header>
      <section>
        
      {user ? <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/room/:id" element={<ChatRoom />} />
            </Routes>:
            <SignIn />}
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

  return <button onClick={GoogleSignIn}>Sign In With Google</button>
}
function SignOut(){
  return auth.currentUser && (<button onClick={()=>{auth.signOut()}}>Sign Out</button>);
}



export default App