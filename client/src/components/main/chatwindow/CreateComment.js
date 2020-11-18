import React, { useState, useContext } from 'react';
import Styled from './styles/comment.styles';
import axios from 'axios';
import { ChatContext } from './ChatWindow';
import { AppContext } from '../AppContainer';

/*
Posts new comment to database when enter key pressed and triggers re-render by updating ChatWindow state
*/

const CreateComment = props => {
  const [comment, setComment] = useState('');
  const { appState, appDispatch } = useContext(AppContext);
  const { dispatch } = useContext(ChatContext);
  const { currentChannel, checkprivate, currentUser } = props;
  const handleSubmit = text => {
    axios
      .post(
        '/api/comments',
        {
          user: localStorage.userId,
          text: text,
          channelID: appState.channel.id,
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      )
      .then(() => {
        dispatch({ type: 'POST_TO_DB', text });
      })
      .catch(err => console.error(err));

    setComment('');
  };

  const handleSubmitPrivate = text => {
    axios
      .post(
        '/api/comments/private',
        {
          userfrom: localStorage.userId,
          userto: currentUser,
          text: text,
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      )
      .then(async () => {
        dispatch({ type: 'POST_TO_DB', text });

        try {
          const result = await axios('/api/comments/allmsgs', {
            headers: { authorization: `bearer ${localStorage.authToken}` },
          });
          //console.log(result.data);
          //setAllUserMessages(result.data);

          appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
        } catch (error) {}
      })
      .catch(err => console.error(err));

    setComment('');
  };

  const handleEnter = event => {
    if (event.keyCode === 13) {
      event.preventDefault();

      if (checkprivate) {
        handleSubmitPrivate(comment);
      } else {
        handleSubmit(comment);
      }
    }
  };

  const handleOnChange = event => {
    setComment(event.target.value);
  };

  return (
    <Styled.CommentFormWrapper>
      <Styled.CommentForm>
        <Styled.CommentTextArea onChange={handleOnChange} onKeyDown={handleEnter} value={comment} />
      </Styled.CommentForm>
    </Styled.CommentFormWrapper>
  );
};

export default CreateComment;
