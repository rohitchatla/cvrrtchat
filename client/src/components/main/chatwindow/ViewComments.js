import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import Comment from './Comment';
import { ChatContext } from './ChatWindow';
import { AppContext } from '../AppContainer';
import { formatDate } from '../chatwindow/Comment';

/*
Requests all comments from database and handles  socket events  
*/

//keeps overflow scroll at the bottom of container

const scrollToBottom = ref => {
  ref.current.scrollTop = ref.current.scrollHeight;
};

const ViewComments = props => {
  const refContainer = useRef(null);
  const [allComments, setAllComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const { chatState } = useContext(ChatContext);
  const { appState } = useContext(AppContext);

  const { currentChannel, checkprivate, currentUser, allmessages } = props;

  const [showMessages, setshowMessages] = useState(false); // to show messages as per that user there in the group or not
  useEffect(() => {
    setIsLoading(true);
    try {
      if (appState.channel.comments) {
        setAllComments(() => {
          return appState.channel.comments.map(comment => {
            comment.channelID = appState.channel.id;

            return comment;
          });
        });

        let bool = false; //can further check auth checks for message displaying --> * displaying "you are not auth for this channels" w/o showing messages

        //console.log(currentChannel);
        currentChannel != undefined &&
          currentChannel.users.map(u => {
            //console.log(u);
            if (u.id == localStorage.getItem('userId')) {
              bool = true;
            }
          });

        if (bool) {
          setshowMessages(true);
        } else {
          setshowMessages(false);
        }

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
    }
  }, [appState]);

  useEffect(() => {
    if (chatState.newComment) {
      scrollToBottom(refContainer);
    }
  });

  // useEffect(() => {
  //   // to show messages as per that user there in the group or not
  //   let bool = false;
  //   //console.log(currentChannel);
  //   currentChannel.length > 0 &&
  //     currentChannel.map(c => {
  //       c.users.map(u => {
  //         if (u.id == localStorage.getItem('userId')) {
  //           bool = true;
  //         }
  //       });
  //     });

  //   if (bool) {
  //     setshowMessages(true);
  //   } else {
  //     setshowMessages(false);
  //   }
  // }, []);

  return (
    <Wrapper ref={refContainer}>
      {/*hardcoded channel section */}

      <ChannelSection>
        <Name># {checkprivate ? currentUser.name : currentChannel.name}</Name>
        <Description>
          <ChannelLink href="#" target="_blank">
            CVRROCKET
          </ChannelLink>{' '}
          @ {formatDate(props.currentChannel.dateCreated)}. "{props.currentChannel.name}" channel
          view.
        </Description>
      </ChannelSection>
      {/* {console.log(allmessages)} */}
      {/*can further check auth checks for message displaying --> * displaying "you are not auth for this channels" w/o showing messages
       */}
      {isLoading && <div>Loading...</div>}
      {isError ? (
        <div>"Something Went Wrong"</div>
      ) : checkprivate ? (
        allmessages &&
        allmessages.map(msg => {
          if (
            (msg.userfrom[0]._id == localStorage.getItem('userId') &&
              msg.userto[0]._id == currentUser._id) ||
            (msg.userfrom[0]._id == currentUser._id &&
              msg.userto[0]._id == localStorage.getItem('userId'))
          )
            return (
              <Comment
                id={msg._id}
                key={msg._id}
                //userImage={msg.userImage}
                name={msg.userfrom[0].name}
                date={msg.date}
                text={msg.text}
                isEdited={msg.isEdited}
                user_id={msg.userfrom[0]._id}
                thread={msg.threadedComments}
                refContainer={refContainer}
                setThreadWindow={props.setThreadWindow}
                getThreadInfo={props.getThreadInfo}
                channelID={msg.userto[0]._id}
                setClickChange={props.setClickChange}
                chatprivate={checkprivate}
                type={msg.type}
                photo={msg.photo}
                video={msg.video}
                etcfile={msg.etcfile}
                filetype={msg.filetype}
                multiplefiles={msg.multiplefiles}
                replybool={msg.replybool}
                replymsg={msg.replymsg}
                replydetails={msg.replydetails}
                forwardpayload={msg.forwardpayload}
                forwardbool={msg.forwardbool}
                forwardmsg={msg.forwardmsg}
                replyfromid={msg.replyfromid}
                forwardfromid={msg.forwardfromid}
                forwardmsgbool={msg.forwardmsgbool}
                forwardmsgdetails={msg.forwardmsgdetails}
              ></Comment>
            );
        })
      ) : (
        showMessages &&
        allComments &&
        allComments.map(comment => {
          return (
            <Comment
              id={comment._id}
              key={comment._id}
              userImage={comment.userImage}
              name={comment.user}
              date={comment.date}
              text={comment.text}
              isEdited={comment.isEdited}
              user_id={comment.user_id}
              thread={comment.thread}
              refContainer={refContainer}
              setThreadWindow={props.setThreadWindow}
              getThreadInfo={props.getThreadInfo}
              channelID={comment.channelID}
              setClickChange={props.setClickChange}
              type={comment.type}
              photo={comment.photo}
              video={comment.video}
              etcfile={comment.etcfile}
              filetype={comment.filetype}
              multiplefiles={comment.multiplefiles}
              replybool={comment.replybool}
              replydetails={comment.replydetails}
              forwardpayload={comment.forwardpayload}
              replymsg={comment.replymsg}
              forwardbool={comment.forwardbool}
              forwardmsg={comment.forwardmsg}
              replyfromid={comment.replyfromid}
              forwardfromid={comment.forwardfromid}
              forwardmsgbool={comment.forwardmsgbool}
              forwardmsgdetails={comment.forwardmsgdetails}
            ></Comment>
          );
        })
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  overflow: auto;
  border-top: 0.1rem solid rgb(29, 28, 29, 0.3);
  padding: 1rem 0rem;
  scrollbar-color: #919191;
  scrollbar-width: thin;
  &::-webkit-scrollbar-track {
    -webkit-appearance: none;
    border: 0.01rem solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 0.7rem;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    -webkit-appearance: none;
    border: 0.1rem solid #919191;
    background: #919191;
  }
`;

const Name = styled.span`
  margin-left: 1rem;
  font-size: 2.2rem;
  font-weight: 600;
`;

const Description = styled.p`
  font-size: 1.5rem;
  margin-left: 1rem;
`;

const ChannelSection = styled.section`
  border-bottom: 0.1rem solid rgb(29, 28, 29, 0.3);
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const ChannelLink = styled.a`
  background-color: rgb(29, 155, 209, 0.1);
  color: rgb(18, 100, 163, 1);
  border: 0;
  border-radius: 0.3rem;
`;

export default ViewComments;
