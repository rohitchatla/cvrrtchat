import React, { useReducer, useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import CreateComment from './CreateComment';
import ViewComments from './ViewComments';
import ThreadWindow from '../thread/ThreadWindow';
import { AppContext } from '../AppContainer';
import axios from 'axios';
export const ChatContext = React.createContext(null);

/*
Parent component
State is an object that changes when comment is posted to db
*/

const initialState = {
  previousComment: '',
  newComment: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'POST_TO_DB':
      return { ...state, newComment: true, previousComment: action.text };
    case 'PATCH_TO_DB':
      return { ...state, newComment: false, previousComment: action.text };
    case 'DELETE_FROM_DB':
      return { ...state, newComment: false, previousComment: action.text };
    default:
      return initialState;
  }
};

const ChatWindow = props => {
  const [chatState, dispatch] = useReducer(reducer, initialState);
  const [threadWindow, setThreadWindow] = useState(false);
  const [threadinfo, setThreadInfo] = useState({});
  const [clickChange, setClickChange] = useState(1);
  const { socket } = useContext(AppContext);

  function getThreadInfo(id, name, date, text, user_id, userImage, thread, channelID) {
    setThreadInfo({
      id,
      name,
      date,
      text,
      user_id,
      userImage,
      thread,
      channelID,
    });
  }
  const [isEdit, setIsEdit] = useState(false);
  const [editValue, setEditValue] = useState('');
  useEffect(() => {
    if (threadWindow) {
      socket.emit('joinThread', threadinfo.id);
    }
  }, [socket, threadWindow, threadinfo.id]);

  useEffect(() => {
    socket.on('updateUser', data => {
      if (threadinfo.user_id === data.id) {
        if (data.name) {
          setThreadInfo(prev => {
            return { ...prev, name: data.name };
          });

          if (data.userImage) {
            setThreadInfo(prev => {
              return { ...prev, userImage: data.userImage };
            });
          } else if (data.userImage === null) {
            setThreadInfo(prev => {
              return { ...prev, userImage: data.userImage };
            });
          }
        }
      }
    });
  }, [socket, threadinfo.user_id]);

  const addUser = cid => {
    axios
      .post(
        '/api/channels/adduser',
        {
          cid: cid,
          uid: editValue,
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      )
      .then(res => {
        console.log(res);
        setIsEdit(!isEdit);
      });
  };

  return (
    <ChatContext.Provider value={{ chatState, dispatch }}>
      <Container>
        {/* {console.log(props.currentChannel)} */}
        <Header>
          #{' '}
          {props.currentChannel.private
            ? props.currentChannel.user && props.currentChannel.user.name
            : props.currentChannel.channel.name}
        </Header>
        <Header>
          #{' '}
          {props.currentChannel.private
            ? props.currentChannel.user && props.currentChannel.user._id
            : props.currentChannel.channel.id}
          {props.currentChannel.channel.owner == localStorage.getItem('userId') ? (
            // {/*check if the user is admin or not*/}
            <>
              <button onClick={() => setIsEdit(!isEdit)}>Add User</button>

              {isEdit ? ( //{/*check if the user is admin or not*/}
                <input
                  type="text"
                  onChange={e => {
                    console.log(e.target.value);
                    setEditValue(e.target.value);
                  }}
                  onKeyDown={e => {
                    if (e.keyCode === 13) {
                      e.preventDefault();
                      addUser(props.currentChannel.channel.id);
                    }
                  }}
                  value={editValue}
                ></input>
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}
        </Header>
        <ViewComments
          setThreadWindow={setThreadWindow}
          getThreadInfo={getThreadInfo}
          currentChannel={props.currentChannel.channel}
          checkprivate={props.currentChannel.private}
          currentUser={props.currentChannel.user}
          allmessages={props.currentChannel.usermsgs}
          setClickChange={setClickChange}
        />
        <CreateComment
          currentChannel={props.currentChannel.channel}
          checkprivate={props.currentChannel.private}
          currentUser={props.currentChannel.user}
        />
        {threadWindow && (
          <ThreadWindow
            clickChange={clickChange}
            threadinfo={threadinfo}
            setThreadWindow={setThreadWindow}
            currentChannel={props.currentChannel.channel}
            checkprivate={props.currentChannel.private}
            currentUser={props.currentChannel.user}
          />
        )}
      </Container>
    </ChatContext.Provider>
  );
};

const Container = styled.main`
  width: 100%;
  height: 100%;
  grid-area: 1/2/3/3;
  align-self: flex-end;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  color: rgb(29, 28, 29);
`;

const Header = styled.header`
  display: flex;
  justify-content: center;
  margin: 1.5rem 1.5rem 1.8rem 1.5rem;
  font-size: 2rem;
  align-items: flex-end;
  font-weight: 600;
  flex: 0 0 5%;
  font-size: 1.8rem;
`;

export default ChatWindow;
