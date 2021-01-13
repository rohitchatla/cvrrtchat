import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { AppContext } from '../AppContainer';

function AllUsers(props) {
  const { setCurrentUserID, setchatprivate } = props;
  const { appDispatch, appState } = useContext(AppContext);
  const getUsermessages = async () => {
    try {
      const result = await axios('/api/comments/allmsgs', {
        headers: { authorization: `bearer ${localStorage.authToken}` },
      });
      //console.log(result.data);
      //setAllUserMessages(result.data);

      appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
    } catch (error) {}
  };

  // useEffect(async () => {
  //   //async()
  //   if (url == '/u/<uid>') {
  //   //for GET(in client ) /u/<uid>
  //     setCurrentUserID(user.id);
  //     setchatprivate(true);
  //     getUsermessages();
  //     //window.location.reload();
  //     localStorage.setItem('chatprivate', true);
  //   }
  // }, []);

  return (
    <>
      <h3>Users</h3>
      <ul>
        {props.allUsersInChannel &&
          props.allUsersInChannel.map(user => {
            // TODO: Set isActive to true is the user is online
            return (
              <li key={user.id}>
                {props.activeUsers.indexOf(user.id) !== -1 ? (
                  <Active isActive={true} title="Active"></Active>
                ) : (
                  <Active isActive={false} title="Away"></Active>
                )}
                {
                  <button
                    onClick={() => {
                      setCurrentUserID(user.id);
                      setchatprivate(true);
                      getUsermessages();
                      //window.location.reload();
                      localStorage.setItem('chatprivate', true);
                    }}
                  >
                    {user.name}
                  </button>
                }
              </li>
            );
          })}
      </ul>
    </>
  );
}

/**
 * Set the active dot to green if user is online
 */
const Active = styled.i`
  position: relative;
  display: inline-block;
  width: 1rem;
  height: 1rem;
  background-color: ${props => (props.isActive ? '#2BAC76' : 'grey')};
  border-radius: 50%;
  margin-right: 0.5rem;
`;

export default AllUsers;
