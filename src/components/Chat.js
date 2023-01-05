import React, { useEffect, useContext, useState, useRef } from 'react';
import more from '../assets/more.png';
import search from '../assets/search.png';
import messagePic from '../assets/messages.png';
import Message from './Message';
import Input from './Input';
import Modal from './Modal';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingType1 from '../loadingAnimations/loadingType1/LoadingType1';
import { ChatContext } from '../context/ChatContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
   const { chat, chatLoading, getCombinedId, modal, setModal } = useContext(ChatContext);
   const { currentUser } = useContext(AuthContext);
   const [messages, setMessages] = useState();
   const [actionsModal, SetActionsModal] = useState(false);
   const [mediaState, setMediaState] = useState(false);
   const [deleteState, setDeleteState] = useState(false);

   //fetching and subscribing to the chat messages
   useEffect(() => {
      const fetchMessages = () => {
         const combinedId = getCombinedId(chat.uid);
         const unsub = onSnapshot(
            doc(db, 'users', currentUser.uid, 'chats', combinedId),
            snapshot => {
               if (snapshot.data()) {
                  if (snapshot.data().messages) {
                     //empty check
                     const messages = snapshot.data().messages;
                     if (messages.length) {
                        setMessages(snapshot.data().messages);
                     } else {
                        setMessages();
                     }
                  } else {
                     setMessages();
                  }
               }
            }
         );
         return () => {
            unsub();
         };
      };

      chat && fetchMessages();
   }, [chat]);

   //scrolling to last message
   const dummy = useRef();
   useEffect(() => {
      dummy.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   return (
      <div className='chat'>
         {chatLoading && (
            <div className='chat_loading'>
               <LoadingType1 />
            </div>
         )}
         {modal && (
            <Modal
               mediaState={mediaState}
               deleteState={deleteState}
               setMediaState={setMediaState}
               setDeleteState={setDeleteState}
            />
         )}
         {chat ? (
            <>
               <div className='chat_info'>
                  <div className='user_photo'>
                     <img src={chat.photoURL} alt='' />
                  </div>
                  <div className='user_info'>
                     <p className='user_name'>{chat.name}</p>
                  </div>
                  <div className='actions_container'>
                     <motion.div
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        className='action_buttons'
                        onClick={() => {
                           SetActionsModal(!actionsModal);
                        }}
                     >
                        {actionsModal ? (
                           <img src={require('../assets/close.png')} alt='' />
                        ) : (
                           <img src={more} alt='' />
                        )}
                     </motion.div>
                     <AnimatePresence>
                        {actionsModal && (
                           <motion.div
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className='action_pop-up'
                           >
                              <motion.div
                                 whileHover={{ backgroundColor: '#606f85' }}
                                 className='photo_gallery'
                                 onClick={() => {
                                    SetActionsModal(false);
                                    setModal(true);
                                    setMediaState(true);
                                 }}
                              >
                                 <p>Media</p>
                              </motion.div>
                              <motion.div
                                 whileHover={{ backgroundColor: '#606f85' }}
                                 className='delete_chat'
                                 onClick={() => {
                                    SetActionsModal(false);
                                    setModal(true);
                                    setDeleteState(true);
                                 }}
                              >
                                 <p>Delete chat</p>
                              </motion.div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
               <div className='chat_messages'>
                  {messages ? (
                     messages.map(message => (
                        <Message
                           message={message}
                           key={message.messageId}
                           dummy={dummy}
                        />
                     ))
                  ) : (
                     <div className='no_messages'>
                        <img src={messagePic} alt=''></img>
                        <p>No any messages yet</p>
                     </div>
                  )}
               </div>
            </>
         ) : (
            <div className='no_chat'>
               <img src={search} alt=''></img>
               <p className='no_active_chates'>No active chates yet....</p>
               <p className='find_a_friend'>Find a friend and start conversation =)</p>
            </div>
         )}

         <div className='chat_input'>
            <Input />
         </div>
      </div>
   );
};

export default Chat;
