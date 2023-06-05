import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase_config";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDocs,
} from "@firebase/firestore";
//
// import { getMessaging } from "firebase/messaging";
import { firebase } from "firebase";
// import { admin } from "firebase-admin/app";

import "./Styles.css";
// const messaging = getMessaging();
const messaging = firebase.messaging();

export const Chat = ({ room }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesRef = collection(db, "messages");
  const tokenRef = collection(db, "newToken");
  //
  const [isPersonalTokenObject, setIsPersonalTokenObject] = useState();

  useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt")
    );

    const unsuscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      console.log(messages);
      setMessages(messages);
    });

    return () => unsuscribe();
  }, []);

  const gettingDocs = async () => {
    try {
      const data = await getDocs(tokenRef);
      console.log("read data", data);

      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      console.log("filteredData:", filteredData);
      const result = filteredData.find(
        (item) => (item.uid = localStorage.getItem("personalId"))
      );
      if (result) {
        console.log("found upon searching...", result);
        setIsPersonalTokenObject(result);
      } else {
        console.log("nothing found...");
      }
    } catch (error) {
      console.log("error in reading docs", error);
    }
  };

  useEffect(() => {
    gettingDocs();
  }, []);

  useEffect(() => {
    if (isPersonalTokenObject) {
      console.log("found this object and turned", isPersonalTokenObject);
    }
  }, [isPersonalTokenObject]);

  useEffect(() => {
    if (isPersonalTokenObject && messages.length > 0) {
      console.log("found same object with message", isPersonalTokenObject);
      //
      const registrationToken = isPersonalTokenObject.userToken;

      const notiMessage = {
        data: {
          score: "850",
          time: "2:45",
        },
        token: registrationToken,
      };

      // getMessaging().send(notiMessage)
      const pushingNotification = async () => {
        try {
          await messaging.send(notiMessage)
          console.log("Successfully sent message:");
        } catch (error) {
          console.log("Error sending message:", error);
        }
      };
      pushingNotification();
      //
      // getMessaging()
      //   .send(notiMessage)
      //   .then((response) => {
      //     console.log("Successfully sent message:", response);
      //   })
      //   .catch((error) => {
      //     console.log("Error sending message:", error);
      //   });
    }
  }, [isPersonalTokenObject, messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(newMessage);
    console.log("room", room);
    console.log("user", auth.currentUser.displayName);

    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room,
    });

    setNewMessage("");
  };

  return (
    <div className="chat-app">
      <div className="header">
        <h1>Welcome to: {room}</h1>
      </div>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <span className="user">{message.user}:</span> {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="new-message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          className="new-message-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

// import React from 'react'
// import './Styles.css'

// export default function Chat() {
//   return (
//     <div className='chat-app'>
//       chatApp
//     </div>
//   )
// }
