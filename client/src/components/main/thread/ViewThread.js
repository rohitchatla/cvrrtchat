import React, { useEffect, useRef } from 'react';
import { AllThreads } from './thread.style';
import Thread from './Thread';

function ViewThread(props) {
  const messageEndRef = useRef();

  const scrollToBottom = () => {
    messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [props.allThreads]);

  return (
    <AllThreads>
      {props.allThreads.map(thread => {
        let threadinfo = {};
        if (props.checkprivate) {
          threadinfo = {
            parent_id: props.commentid,
            id: thread._id,
            text: thread.text,
            date: thread.date,
            isEdited: thread.isEdited,
            name: thread.userfrom[0].name,
            user_id: thread.userfrom[0]._id,
            userImage: thread.userImage,
          };
        } else {
          threadinfo = {
            parent_id: props.commentid,
            id: thread._id,
            text: thread.text,
            date: thread.date,
            isEdited: thread.isEdited,
            name: thread.user,
            user_id: thread.user_id,
            userImage: thread.userImage,
          };
        }

        return (
          <Thread
            key={thread._id}
            threadinfo={threadinfo}
            dispatch={props.dispatch}
            channelID={props.channelID}
            checkprivate={props.checkprivate}
          />
        );
      })}
      <div ref={messageEndRef} />
    </AllThreads>
  );
}

export default ViewThread;
