import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import Styled from './styles/comment.styles';
import axios from 'axios';
import { ChatContext } from './ChatWindow';
import { AppContext } from '../AppContainer';

/*
Updates comment in database when enter key pressed and triggers re-render by updating ChatWindow state
*/

const EditComment = props => {
  const { _id, className, setEditComment, children, chatprivate } = props;
  const [comment, setComment] = useState(children);
  const { dispatch } = useContext(ChatContext);
  const { appState, appDispatch } = useContext(AppContext);

  const handleSubmit = text => {
    axios
      .patch(
        `/api/comments/${_id}`,
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
        dispatch({ type: 'PATCH_TO_DB', text });
        setEditComment(false);
      })
      .catch(err => console.error(err));

    setComment('');
  };

  const handleSubmitPrivate = text => {
    axios
      .patch(
        `/api/comments/private/edit/${_id}`,
        {
          userfrom: localStorage.userId,
          text: text,
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      )
      .then(async () => {
        dispatch({ type: 'PATCH_TO_DB', text });
        setEditComment(false);

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
      if (chatprivate) {
        handleSubmitPrivate(comment);
      } else {
        handleSubmit(comment);
      }
    }
  };

  const handleOnChange = event => {
    setComment(event.target.value);
  };

  const handleSave = event => {
    event.preventDefault();
    if (chatprivate) {
      handleSubmitPrivate(comment);
    } else {
      handleSubmit(comment);
    }
  };

  return (
    <Styled.CommentFormWrapper className={className}>
      <Form>
        <TextArea onChange={handleOnChange} onKeyDown={handleEnter} value={comment} />
        <Styled.Button onClick={() => setEditComment(false)}>Cancel</Styled.Button>
        <Styled.SaveButton onClick={handleSave}>Save</Styled.SaveButton>
      </Form>
    </Styled.CommentFormWrapper>
  );
};

const Form = styled(Styled.CommentForm)`
  display: flex;
  flex-wrap: wrap;

  & > button:last-child {
    margin-left: 1rem;
  }
`;

const TextArea = styled(Styled.CommentTextArea)`
  flex: 0 1 100%;
  margin: 1rem 0;
`;

export default EditComment;
