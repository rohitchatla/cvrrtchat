import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { Textarea } from './thread.style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '../../../theme/theme';
import axios from 'axios';
import { AppContext } from '../AppContainer';

function AddThread({ dispatch, commentid, channelID, checkprivate }) {
  const [reply, setReply] = useState('');
  const { socket, appDispatch } = useContext(AppContext);

  function SubmitReply(e) {
    e.preventDefault();
    if (checkprivate) {
      const newThread = {
        userfrom: localStorage.userId,
        text: reply,
        threadedComment: true,
        parentID: commentid,
        userto: channelID,
      };

      axios
        .post('/api/comments/private/g', newThread, {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        })
        .then(async res => {
          //console.log(res);

          const thread = {
            _id: res.data._id,
            date: res.data.date,
            isEdited: false,
            text: reply,
            user: res.data.user,
            user_id: localStorage.userId,
            userImage: res.data.userImage,
          };
          dispatch({ type: 'REPLY_THREAD', thread });
          // appDispatch({ type: 'REPLY_THREAD', thread: { ...thread, commentid, channelID } });
          // socket.emit('post_thread', { ...thread, commentid, channelID });
          setReply('');
        })
        .catch(err => console.log(err.response.data));
    } else {
      const newThread = {
        user: localStorage.userId,
        text: reply,
        threadedComment: true,
        parentID: commentid,
        channelID,
      };

      axios
        .post('/api/comments/', newThread, {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        })
        .then(async res => {
          const thread = {
            _id: res.data._id,
            date: res.data.date,
            isEdited: false,
            text: reply,
            user: res.data.user,
            user_id: localStorage.userId,
            userImage: res.data.userImage,
          };
          dispatch({ type: 'REPLY_THREAD', thread });
          appDispatch({ type: 'REPLY_THREAD', thread: { ...thread, commentid, channelID } });
          socket.emit('post_thread', { ...thread, commentid, channelID });
          setReply('');
        })
        .catch(err => console.log(err.response.data));
    }
  }

  function enterReply(e) {
    if (e.keyCode === 13) {
      SubmitReply(e);
    }
  }

  return (
    <div>
      <form onSubmit={SubmitReply}>
        <Textarea
          type="text"
          rows="3"
          placeholder="Reply..."
          value={reply}
          onKeyDown={enterReply}
          onChange={e => setReply(e.target.value)}
          autoFocus
        ></Textarea>

        <Span onClick={SubmitReply}>
          <Tooltip>Send Message</Tooltip>
          <FontAwesomeIcon icon={faReply} size="2x" style={{ color: '#007a5a' }} />
        </Span>
      </form>
    </div>
  );
}

const Span = styled.span`
  position: relative;
  float: right;
  margin-right: 2.5rem;
  margin-top: -3.5rem;
  padding: 0.1rem 0.5rem;
  cursor: pointer;
  &:hover {
    background: lightgray;
    & > div {
      visibility: visible;
    }
  }
`;

export default AddThread;
