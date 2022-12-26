import { collection, onSnapshot } from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import { createContext } from 'react';
import { db } from '../firebase';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
   const { currentUser } = useContext(AuthContext);
   const [chat, setChat] = useState();
   const [chatLoading, setChatLoading] = useState(true);
   const [chatListLoading, setChatListLoading] = useState(true);
   const [chatList, setChatList] = useState();
   const unsubRef = useRef();

   //fetching all chats of user
   useEffect(() => {
      setChatLoading(true);
      setChatListLoading(true);
      const fetchUsers = () => {
         const unsub = onSnapshot(
            collection(db, 'users', currentUser.uid, 'chats'),
            snapshot => {
               let chats = [];
               snapshot.docs.forEach(doc => {
                  chats.push({ ...doc.data() });
               });
               setChatList(chats);
               setChatListLoading(false);
            }
         );

         unsubRef.current = unsub;
      };

      currentUser && fetchUsers();
   }, [currentUser]);

   return (
      <ChatContext.Provider
         value={{
            chat,
            setChat,
            chatList,
            chatLoading,
            setChatLoading,
            chatListLoading,
            unsubRef,
         }}
      >
         {children}
      </ChatContext.Provider>
   );
};
