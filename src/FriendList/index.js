import React from 'react'
import { ChatList } from "react-chat-elements";

export default () => {
  return (
      <>
      
    <ChatList
      className="chat-list"
      dataSource={[
        {
          avatar: "https://placeimg.com/140/140/any",
          alt: "Reactjs",
          title: "Facebook",
          subtitle: "What are you doing?",
          date: new Date(),
          unread: 0
        },
        {
          avatar: "https://placeimg.com/140/140/any",
          alt: "Reactjs",
          title: "Facebook",
          subtitle: "What are you doing?",
          date: new Date(),
          unread: 0
        },
        {
          avatar: "https://placeimg.com/140/140/any",
          alt: "Reactjs",
          title: "Facebook",
          subtitle: "What are you doing?",
          date: new Date(),
          unread: 0
        }
      ]}
    />
    </>
  );
};
