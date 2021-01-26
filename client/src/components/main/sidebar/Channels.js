import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAd, faPlus, faTimesCircle, faCrosshairs } from '@fortawesome/free-solid-svg-icons';

function Channels(props) {
  const { allChannels, currentChannelID, setCurrentChannelID, setchatprivate } = props;
  const [invite, setInvite] = useState('');
  const [allnotifsreceived, setAllNotifsreceived] = useState([]); //allnotifs
  const [allnotifssent, setAllNotifssent] = useState([]);

  const [inviteuserid, setInviteuserid] = useState('');
  const [invitechannelid, setInvitechannelid] = useState('');
  const [openinvitechannelid, setOpenInvitechannelid] = useState('');

  // const [privateaccess, setprivateaccess] = useState(false);
  // const [publicaccess, setpublicaccess] = useState(false);

  const [teams, setTeams] = useState('');

  async function createNewChannel() {
    const name = prompt('Channel name?');
    const description = prompt('Channel description?');
    const publictype = prompt('Public(true/false)');
    const privatetype = prompt('Private(true/false)');
    const misctype = prompt('Misctype(all/notall/etc)');

    try {
      const result = await axios.post(
        '/api/channels',
        {
          name,
          description,
          user: localStorage.userId,
          publictype,
          privatetype,
          misctype,
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      console.log(result.data);
      setCurrentChannelID(result.data._id);
      return result.data;
    } catch (error) {
      console.log('Create channel error: ', error);
    }
  }

  async function inviteFunc() {
    //this can also be GET method(url with channel id-->invite url based) so which sends notif to admin or directly adds to group(toggle anything of this in server route of this)
    try {
      const result = await axios.post(
        '/api/channels/invite',
        {
          channelid: invite,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      console.log(result.data);
      window.location.reload();
    } catch (error) {
      console.log('invite error: ', error);
    }
  }

  function deleteUserNotifs() {
    //async
    //deleteReceivedNotifs
    try {
      const result = axios.post(
        //await
        '/api/channels/deleteusernotifs',
        {
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      console.log(result.data);
      setAllNotifsreceived(result.data);
    } catch (error) {
      console.log('deleteUserNotifs error: ', error);
    }
  }

  function deleteSentNotifs() {
    //async
    try {
      const result = axios.post(
        //await
        '/api/channels/deletesentnotifs',
        {
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      console.log(result.data);
      setAllNotifssent(result.data);
    } catch (error) {
      console.log('deleteUserNotifs error: ', error);
    }
  }

  useEffect(async () => {
    //async()//for useEffects blank screen prob
    try {
      const result = await axios.post(
        //await
        '/api/channels/allnotifssent',
        {
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      //console.log(result.data);
      setAllNotifssent(result.data);
    } catch (error) {
      console.log('allnotifs error: ', error);
    }

    try {
      const result = await axios.post(
        //await
        '/api/channels/allnotifsreceived',
        {
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      //console.log(result.data);
      setAllNotifsreceived(result.data);
    } catch (error) {
      console.log('allnotifs error: ', error);
    }

    let url = window.location.href;
    let cid = url.substring(url.lastIndexOf('/') + 1);
    let urlwocid = url.substring(0, url.lastIndexOf('/'));
    let invite = urlwocid.substring(urlwocid.lastIndexOf('/') + 1, url.lastIndexOf('/'));
    //console.log(url, cid, urlwocid, invite);
    if (invite == 'inviteurlwooauth') {
      //this.props.match.params
      inviteUrl(cid); //or can in App.js routes
    }

    // if (url == '/c/<cid>') {
    //   //for GET(in client ) /c/<cid>
    //   localStorage.setItem('chatprivate', false);
    //   setCurrentChannelID(channel.id);
    //   setchatprivate(false);
    // }

    try {
      //await
      const result = await axios.get(`/api/teams/${localStorage.getItem('userId')}`, {
        //${teamid} can be added,//tid-->team._id
        headers: { authorization: `bearer ${localStorage.authToken}` },
      });
      console.log(result.data);
      setTeams(result.data);
    } catch (error) {
      console.log('invite error: ', error);
    }

    // try {
    //   //await
    //   const result = await axios.get(`/api/teams/getchannels/${localStorage.getItem('userId')}`, {
    //     //${teamid} can be added,//tid-->team._id
    //     headers: { authorization: `bearer ${localStorage.authToken}` },
    //   });
    //   //console.log(result.data);
    //   setTeams(result.data);
    // } catch (error) {
    //   console.log('invite error: ', error);
    // }

    // try {
    //   //await
    //   const result = await axios.get(`/api/teams/getmembers/${localStorage.getItem('userId')}`, {
    //     //${teamid} can be added,//tid-->team._id
    //     headers: { authorization: `bearer ${localStorage.authToken}` },
    //   });
    //   //console.log(result.data);
    //   setTeams(result.data);
    // } catch (error) {
    //   console.log('invite error: ', error);
    // }

    // try {
    //   //await
    //   const result = await axios.get(`/api/teams/getpmembers/${localStorage.getItem('userId')}`, {
    //     //${teamid} can be added,//tid-->team._id
    //     headers: { authorization: `bearer ${localStorage.authToken}` },
    //   });
    //   //console.log(result.data);
    //   setTeams(result.data);
    // } catch (error) {
    //   console.log('invite error: ', error);
    // }
  }, []);

  function accessCheck(users) {
    let bool = false;
    //console.log(users);
    users.map(u => {
      if (u.id == localStorage.getItem('userId')) {
        //uid
        bool = true;
      }
    });
    // if (bool) return true;
    // // else return false;
    //console.log(bool);
    //setprivateaccess(bool);
    return bool;
  }

  const autoaddUser = cid => {
    axios
      .post(
        '/api/channels/autoadduserinvite',
        {
          cid: cid,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      )
      .then(res => {
        console.log(res);
        alert('added successfully');
      });
  };

  function inviteUserchannel() {
    try {
      const result = axios.post(
        '/api/channels/inviteuserchannel',
        {
          channelid: invitechannelid,
          toid: inviteuserid,
          fromid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      console.log(result.data);
      window.location.reload();
    } catch (error) {
      console.log('invite error: ', error);
    }
  }

  function inviteOpenUserchannel() {
    try {
      const result = axios.post(
        '/api/channels/inviteopenuserchannel',
        {
          cid: openinvitechannelid,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      console.log(result.data);
      window.location.reload();
    } catch (error) {
      console.log('invite error: ', error);
    }
  }

  function inviteUrl(cid) {
    //with oauth
    try {
      const result = axios.get(`/api/channels/inviteurl/${cid}/${localStorage.getItem('userId')}`, {
        //${openinvitechannelid}-->cid
        headers: { authorization: `bearer ${localStorage.authToken}` },
      });
      console.log(result.data);
      alert(result.data.msg); //can handle validations and error checks,etc
      window.location.reload();
    } catch (error) {
      console.log('invite error: ', error);
    }
  }

  function addTeam() {
    let title = prompt('Title');
    let publictype = prompt('Public(y/n)');
    let description = prompt('Description');
    try {
      const result = axios.post(
        `/api/teams/`,
        {
          title,
          public: publictype,
          description,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      //console.log(result.data);
    } catch (error) {
      console.log('invite error: ', error);
    }
  }

  // function getTeams() {} //in useEffects(compoundDidMound/Refresh activity lifecycle)
  function addChannel2Team(tid) {
    //tid-->team._id

    let cid = prompt('Channel Id'); //can add input_tag(html) for channel_id input
    try {
      const result = axios.post(
        `/api/teams/addchannel`,
        {
          cid,
          tid,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      //console.log(result.data);
    } catch (error) {
      console.log('invite error: ', error);
    }
  }
  function addMember2Team(tid) {
    //tid-->team._id

    let mid = prompt('Member Id'); //can add input_tag(html) for member_id input
    try {
      const result = axios.post(
        `/api/teams/addmember`,
        {
          mid,
          tid,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      //console.log(result.data);
    } catch (error) {
      console.log('invite error: ', error);
    }
  }
  function addPMember2Team(tid) {
    //tid-->team._id

    let pmid = prompt('Private Member Id'); //can add input_tag(html) for private_member_id input
    try {
      const result = axios.post(
        `/api/teams/addpmember`,
        {
          pmid,
          tid,
          uid: localStorage.getItem('userId'),
        },
        {
          headers: { authorization: `bearer ${localStorage.authToken}` },
        },
      );
      //console.log(result.data);
    } catch (error) {
      console.log('invite error: ', error);
    }
  }

  return (
    <>
      <Header>
        <h3>Channels</h3>
        <FontAwesomeIcon onClick={() => createNewChannel()} icon={faPlus} size="1x" />
      </Header>
      <ul className="channels">
        {/*showing current_user present in which channels(only those can be handled here(client with bools) or in server(send channels only in which current_user is present)) */}

        <h4>Public</h4>
        <h5>All_access</h5>
        {allChannels &&
          allChannels.map(channel => {
            return channel.public && channel.misctype == 'all' ? (
              <>
                <ChannelInSideBar
                  key={channel.id}
                  id={channel.id}
                  title={channel.name}
                  onClick={() => {
                    //window.location.reload();
                    localStorage.setItem('chatprivate', false);
                    setCurrentChannelID(channel.id);
                    setchatprivate(false);
                  }}
                  currentChannel={currentChannelID}
                >
                  #{' '}
                  {channel.public && channel.public == 'all'
                    ? channel.name + ' - ' + 'P(All_access)'
                    : channel.name + ' - ' + 'Pr'}
                </ChannelInSideBar>
              </>
            ) : (
              ''
            );
          })}

        <h5>N/A_access(UR_access)</h5>
        {allChannels &&
          allChannels.map(channel => {
            return channel.public && channel.misctype == 'notall' && accessCheck(channel.users) ? (
              <>
                <ChannelInSideBar
                  key={channel.id}
                  id={channel.id}
                  title={channel.name}
                  onClick={() => {
                    //window.location.reload();
                    localStorage.setItem('chatprivate', false);
                    setCurrentChannelID(channel.id);
                    setchatprivate(false);
                  }}
                  currentChannel={currentChannelID}
                >
                  #{' '}
                  {channel.public && channel.public == 'notall'
                    ? channel.name + ' - ' + 'P(N/A_access)'
                    : channel.name + ' - ' + 'Pr'}
                </ChannelInSideBar>
              </>
            ) : (
              ''
            );
          })}

        {/*Click invite to get access and pops in N/A_access(UR_access)*/}
        <h5>N/A_access</h5>
        {allChannels &&
          allChannels.map(channel => {
            return channel.public && channel.misctype == 'notall' && !accessCheck(channel.users) ? (
              <>
                <ChannelInSideBar
                  key={channel.id + '12'}
                  id={channel.id + '12'}
                  title={channel.name}
                  onClick={() => {
                    //window.location.reload();
                    // localStorage.setItem('chatprivate', false);
                    // setCurrentChannelID(channel.id);
                    // setchatprivate(false);
                    autoaddUser(channel.id);
                  }}
                  currentChannel={currentChannelID}
                >
                  #{' '}
                  {/* {channel.public && channel.public == 'notall'
                    ? channel.name + ' - ' + 'P(N/A_access)'
                    : channel.name + ' - ' + 'Pr'} */}
                  {channel.name + ' - Invite'}
                </ChannelInSideBar>
              </>
            ) : (
              ''
            );
          })}

        <h4>Private</h4>
        {allChannels &&
          allChannels.map(channel => {
            return channel.private && accessCheck(channel.users) ? (
              <>
                <ChannelInSideBar
                  key={channel.id}
                  id={channel.id}
                  title={channel.name}
                  onClick={() => {
                    //window.location.reload();
                    localStorage.setItem('chatprivate', false);
                    setCurrentChannelID(channel.id);
                    setchatprivate(false);
                  }}
                  currentChannel={currentChannelID}
                >
                  # {channel.public ? channel.name + ' - ' + 'P' : channel.name + ' - ' + 'Pr'}
                </ChannelInSideBar>
              </>
            ) : (
              ''
            );
          })}
      </ul>

      <Header>
        <h3>Notifications</h3>
        <h3>(S)-(R)</h3>
        <FontAwesomeIcon onClick={() => deleteSentNotifs()} icon={faCrosshairs} size="0.5x" />
        <FontAwesomeIcon onClick={() => deleteUserNotifs()} icon={faTimesCircle} size="0.5x" />
      </Header>
      <ul className="channels">
        <li>Received: </li>
        {allnotifsreceived &&
          allnotifsreceived.map(noti => {
            return (
              <ChannelInSideBar
                key={noti._id}
                id={noti._id}
                onClick={() => {
                  alert(JSON.stringify(noti));
                }}
              >
                {noti.message}
              </ChannelInSideBar>
            );
          })}
        <li>Sent: </li>
        {allnotifssent &&
          allnotifssent.map(noti => {
            return (
              <ChannelInSideBar
                key={noti._id}
                id={noti._id}
                onClick={() => {
                  alert(JSON.stringify(noti));
                }}
              >
                {noti.message}
              </ChannelInSideBar>
            );
          })}
        <li>
          <input
            name="invite"
            value={invite}
            type="text"
            placeholder="Add me to this group(:id)"
            onChange={e => {
              console.log(e.target.value);
              setInvite(e.target.value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                e.preventDefault();
                inviteFunc();
                setInvite('');
              }
            }}
          ></input>
        </li>

        <li>
          <input
            name="inviteuserid"
            value={inviteuserid}
            type="text"
            placeholder="Invite(:user_id))"
            onChange={e => {
              console.log(e.target.value);
              setInviteuserid(e.target.value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                e.preventDefault();
                //inviteFunc();
                setInviteuserid('');
              }
            }}
          ></input>
        </li>

        <li>
          <input
            name="invitechannelid"
            value={invitechannelid}
            type="text"
            placeholder="Invite(:channel_id)"
            onChange={e => {
              console.log(e.target.value);
              setInvitechannelid(e.target.value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                e.preventDefault();
                inviteUserchannel();
                setInvitechannelid('');
              }
            }}
          ></input>
        </li>
        <li>
          <input
            name="openinvitechannelid"
            value={openinvitechannelid}
            type="text"
            placeholder="Open Invite(:channel_id)"
            onChange={e => {
              console.log(e.target.value);
              setOpenInvitechannelid(e.target.value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                e.preventDefault();
                inviteOpenUserchannel();
                setOpenInvitechannelid('');
              }
            }}
          ></input>
        </li>

        {/*Teams(can be kept here(below)/above/elsewhere here in-out of <ul>(html),header,etc of Notifications/notifs(S-R)) */}
        <Header>
          <h3>Teams</h3>
          <ul className="channels">
            {/* <li>Teams</li> */}
            {/* Button onClick={}-->Parsing error: JSX attributes must only be assigned a non-empty expression */}
            <button onClick={() => addTeam()}>Add teams</button>
            {/*this.addTeam()*/}
            {teams.length > 0 &&
              teams.map(team => {
                return (
                  <div>
                    {/* <div .. /> */}
                    <ChannelInSideBar
                      key={team._id}
                      id={team._id}
                      onClick={() => {
                        alert(JSON.stringify(team));
                      }}
                    >
                      {team.title}-
                    </ChannelInSideBar>
                    {/* <ChannelInSideBar .. /> */}
                    <h5>Channels</h5>
                    {team.channels.length > 0 &&
                      team.channels.map(tch => {
                        //add return () else :: Expected an assignment or function call and instead saw an expression
                        return <button>{tch.name}</button>;
                      })}
                    <h5>Members</h5>
                    {team.members.length > 0 &&
                      team.members.map(tme => {
                        //add return () else :: Expected an assignment or function call and instead saw an expression
                        return <button>{tme.name}</button>;
                      })}
                    <h5>Private-Members</h5>
                    {/* <h7></h7> */}
                    {team.privateMembers.length > 0 &&
                      team.privateMembers.map(tpme => {
                        //add return () else :: Expected an assignment or function call and instead saw an expression
                        return <button>{tpme.name}</button>;
                      })}

                    {team.ownerId == localStorage.getItem('userId') ? (
                      <div>
                        <button onClick={() => addChannel2Team(team._id)}>Add channels</button>
                        <button onClick={() => addMember2Team(team._id)}>Add Members</button>
                        <button onClick={() => addPMember2Team(team._id)}>
                          Add Private-Members
                        </button>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                );
              })}
          </ul>
        </Header>
      </ul>
    </>
  );
}

const Header = styled.header`
  h3 {
    display: inline-block;
  }

  svg {
    margin-left: 8rem;
    color: rgba(255, 255, 255, 0.5);

    &:hover {
      color: rgba(255, 255, 255);
      cursor: pointer;
    }
  }

  @media screen and (max-width: 600px) {
    svg {
      margin-left: 6rem;
    }
  }
`;

const ChannelInSideBar = styled.li`
  margin-bottom: 1rem;
  list-style-type: none;
  max-width: 15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${props =>
    props.id === props.currentChannel ? 'rgb(52, 70, 255, .5)' : 'none'};
  width: 100%;
  cursor: pointer;
  height: 10%;
`;

export default Channels;
