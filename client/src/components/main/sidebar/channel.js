// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function Channel(props) {
//   //capitalize function first letter else will get(React Hook "useEffect" is called in function "invite" which is neither a React function component or a custom React Hook function)
//   const { allChannels, currentChannelID, setCurrentChannelID, setchatprivate } = props;
//   useEffect(async () => {
//     //async()
//     //for GET(in client ) /c/<cid>
//     let { cid } = props.match.params;
//     localStorage.setItem('chatprivate', false);
//     setCurrentChannelID(cid);
//     setchatprivate(false);
//   }, []);

//   return (
//     <>
//       <h1>Get channel by id</h1>
//     </>
//   );
// }

// export default Channel;
