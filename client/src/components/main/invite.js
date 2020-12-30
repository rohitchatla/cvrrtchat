// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function Invite(props) {//capitalize function first letter else will get(React Hook "useEffect" is called in function "invite" which is neither a React function component or a custom React Hook function)
//   useEffect(async () => {
//     //async()
//     let { cid } = props.match.params;
//     //if (this.props.match.params) {
//     inviteUrl(cid); //or can in App.js routes
//     //}
//   }, []);

//   function inviteUrl(cid) {
//     //with oauth
//     try {
//       const result = axios.get(`/api/channels/inviteurl/${cid}/${localStorage.getItem('userId')}`, {
//         headers: { authorization: `bearer ${localStorage.authToken}` },
//       });
//       console.log(result.data);
//       alert(result.data.msg); //can handle validations and error checks,etc
//       window.location.reload();
//     } catch (error) {
//       console.log('invite error: ', error);
//     }
//   }

//   return (
//     <>
//       <h1>InviteWithOauth page</h1>
//     </>
//   );
// }

// export default Invite;
