// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// function User(props) {
//   //capitalize function first letter else will get(React Hook "useEffect" is called in function "invite" which is neither a React function component or a custom React Hook function)
//   const { appDispatch, appState } = useContext(AppContext);
//   const getUsermessages = async () => {
//     try {
//       const result = await axios('/api/comments/allmsgs', {
//         headers: { authorization: `bearer ${localStorage.authToken}` },
//       });
//       //console.log(result.data);
//       //setAllUserMessages(result.data);

//       appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
//     } catch (error) {}
//   };

//   useEffect(async () => {
//     //async()
//     //for GET(in client ) /u/<uid>
//     let { uid } = props.match.params;
//     //for GET(in client ) /u/<uid>
//     setCurrentUserID(uid);
//     setchatprivate(true);
//     getUsermessages();
//     //window.location.reload();
//     localStorage.setItem('chatprivate', true);
//   }, []);

//   return (
//     <>
//       <h1>Get user by id</h1>
//     </>
//   );
// }

// export default User;
