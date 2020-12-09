import React, { useState, useContext } from 'react';
import Styled from './styles/comment.styles';
import axios from 'axios';
import { ChatContext } from './ChatWindow';
import { AppContext } from '../AppContainer';
import firebase from './firebase';
import uuid from 'react-uuid';

/*
Posts new comment to database when enter key pressed and triggers re-render by updating ChatWindow state
*/

const CreateComment = props => {
  const [comment, setComment] = useState('');
  const [replyp, setreplyp] = useState(localStorage.getItem('replyprivately'));
  const [forward, setforward] = useState(localStorage.getItem('forwardmsg'));
  const [replypayload, setreplypayload] = useState(localStorage.getItem('replyppayload'));
  const [forwardpayload, setforwardpayload] = useState(localStorage.getItem('forwardpayload'));
  const [replyfromid, setreplyfromid] = useState(localStorage.getItem('replyfromid'));
  const [forwardfromid, setforwardfromid] = useState(localStorage.getItem('forwardfromid'));
  const { appState, appDispatch } = useContext(AppContext);
  const { dispatch } = useContext(ChatContext);
  const { currentChannel, checkprivate, currentUser } = props;
  const [values, setValues] = useState({
    photo: '',
    video: '',
    etcfile: '',
  });
  const [multiplefiles, setMultipleFiles] = useState([]);

  const resetLocalStorage = () => {
    localStorage.setItem('replyppayload', ''); //or can have a field in db for forwards
    localStorage.setItem('replyprivately', '');
    localStorage.setItem('replyfromid', '');
    localStorage.setItem('forwardmsg', '');
    localStorage.setItem('forwardpayload', '');
    localStorage.setItem('forwardfromid', '');
  };

  const multipleUpload = text => {
    const storage = firebase.storage();

    let mfiles = [];
    let cnt = 0;

    try {
      //can be written in backend(serverside) aswell
      if (multiplefiles.length > 0) {
        //console.log(multitplefiles);

        Array.from(multiplefiles).forEach((file, i) => {
          //console.log(i, file);
          var storageRefFile = storage.ref(
            `/cvrrtchat/multiple/${currentChannel.name}-${currentChannel.id}/${file.name + uuid()}`,
          );
          storageRefFile.put(file).then(function(snapshot) {
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
              let obj = {};
              obj.data = '';
              obj.contentType = snapshot.metadata.contentType;
              obj.path = downloadURL;
              mfiles.push(obj);

              if (mfiles.length == multiplefiles.length) {
                //i==multitplefiles.length-1 --> only send 1 file(cnt can also tried)
                axios
                  .post(
                    '/api/comments',
                    //postData,
                    {
                      multiplefiles: mfiles,
                      user: localStorage.userId,
                      text: text,
                      replyp: replyp,
                      replypayload: replypayload,
                      forwardpayload: forwardpayload,
                      forward: forward,
                      replyfromid: replyfromid,
                      forwardfromid: forwardfromid,
                      channelID: appState.channel.id,
                      photo: '',
                      video: '',
                      etcfile: '',
                      filetype: '',
                    },
                    {
                      headers: {
                        authorization: `bearer ${localStorage.authToken}`,
                        //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                        //Accept: 'application/json',
                      },
                    },
                  )
                  .then(() => {
                    dispatch({ type: 'POST_TO_DB', text });
                    resetLocalStorage();
                  })
                  .catch(err => console.error(err));

                setComment('');
              }
            });
          });
        });
      }

      //console.log(mfiles);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadUtil = async text => {
    const storage = firebase.storage();
    let videourl = '';
    let photourl = '';
    let etcfileurl = '';
    let filetype = {
      filetypep: '',
      filetypev: '',
      filetypee: '',
    };
    var storageRefpic = storage.ref(`/cvrrtchat/${values.photo.name + uuid()}`); //uuid()
    var storageRefvid = storage.ref(`/cvrrtchat/${values.video.name + uuid()}`);
    var storageRefetcfile = storage.ref(`/cvrrtchat/${values.etcfile.name + uuid()}`);

    // if (values.photo != '') {
    //   storageRefpic.put(values.photo).then(function(snapshot) {
    //     snapshot.ref.getDownloadURL().then(function(downloadURL) {
    //       photourl = downloadURL;
    //       filetype.filetypep = snapshot.metadata.contentType;
    //       console.log(photourl);
    //     });
    //   });
    // }

    // if (values.video != '') {
    //   storageRefvid.put(values.video).then(function(snapshotv) {
    //     snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
    //       videourl = downloadURLv;
    //       filetype.filetypev = snapshotv.metadata.contentType;
    //       console.log(videourl);
    //     });
    //   });
    // }

    // if (values.etcfile != '') {
    //   storageRefetcfile.put(values.etcfile).then(function(snapshote) {
    //     snapshote.ref.getDownloadURL().then(function(downloadURLe) {
    //       etcfileurl = downloadURLe;
    //       filetype.filetypee = snapshote.metadata.contentType;
    //       console.log(etcfileurl);
    //     });
    //   });
    // }

    if (values.photo == '' && values.video == '' && values.etcfile == '') {
      //000

      await axios
        .post(
          '/api/comments',
          //postData,
          {
            user: localStorage.userId,
            text: text,
            replyp: replyp,
            replypayload: replypayload,
            forwardpayload: forwardpayload,
            forward: forward,
            replyfromid: replyfromid,
            forwardfromid: forwardfromid,
            channelID: appState.channel.id,
            photo: '',
            video: '',
            etcfile: '',
            filetype,
          },
          {
            headers: {
              authorization: `bearer ${localStorage.authToken}`,
              //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
              //Accept: 'application/json',
            },
          },
        )
        .then(() => {
          dispatch({ type: 'POST_TO_DB', text });
          resetLocalStorage();
        })
        .catch(err => console.error(err));

      setComment('');
    }
    if (values.photo == '' && values.video == '' && values.etcfile != '') {
      //001

      storageRefetcfile.put(values.etcfile).then(function(snapshote) {
        snapshote.ref.getDownloadURL().then(function(downloadURLe) {
          etcfileurl = downloadURLe;
          filetype.filetypee = snapshote.metadata.contentType;
          //console.log(etcfileurl);

          axios
            .post(
              '/api/comments',
              //postData,
              {
                user: localStorage.userId,
                text: text,
                replyp: replyp,
                replypayload: replypayload,
                forwardpayload: forwardpayload,
                forward: forward,
                replyfromid: replyfromid,
                forwardfromid: forwardfromid,
                channelID: appState.channel.id,
                photo: '',
                video: '',
                etcfile: etcfileurl,
                filetype,
              },
              {
                headers: {
                  authorization: `bearer ${localStorage.authToken}`,
                  //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                  //Accept: 'application/json',
                },
              },
            )
            .then(() => {
              dispatch({ type: 'POST_TO_DB', text });
              resetLocalStorage();
            })
            .catch(err => console.error(err));

          setComment('');
        });
      });
    }
    if (values.photo == '' && values.video != '' && values.etcfile == '') {
      storageRefvid.put(values.video).then(function(snapshotv) {
        snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
          videourl = downloadURLv;
          filetype.filetypev = snapshotv.metadata.contentType;
          //console.log(videourl);
          axios
            .post(
              '/api/comments',
              //postData,
              {
                user: localStorage.userId,
                text: text,
                replyp: replyp,
                replypayload: replypayload,
                forwardpayload: forwardpayload,
                forward: forward,
                replyfromid: replyfromid,
                forwardfromid: forwardfromid,
                channelID: appState.channel.id,
                photo: '',
                video: videourl,
                etcfile: '',
                filetype,
              },
              {
                headers: {
                  authorization: `bearer ${localStorage.authToken}`,
                  //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                  //Accept: 'application/json',
                },
              },
            )
            .then(() => {
              dispatch({ type: 'POST_TO_DB', text });
              resetLocalStorage();
            })
            .catch(err => console.error(err));

          setComment('');
        });
      });
    }
    if (values.photo == '' && values.video != '' && values.etcfile != '') {
      storageRefvid.put(values.video).then(function(snapshotv) {
        snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
          videourl = downloadURLv;
          filetype.filetypev = snapshotv.metadata.contentType;
          //console.log(videourl);
          storageRefetcfile.put(values.etcfile).then(function(snapshote) {
            snapshote.ref.getDownloadURL().then(function(downloadURLe) {
              etcfileurl = downloadURLe;
              filetype.filetypee = snapshote.metadata.contentType;
              //console.log(etcfileurl);

              axios
                .post(
                  '/api/comments',
                  //postData,
                  {
                    user: localStorage.userId,
                    text: text,
                    replyp: replyp,
                    replypayload: replypayload,
                    forwardpayload: forwardpayload,
                    forward: forward,
                    replyfromid: replyfromid,
                    forwardfromid: forwardfromid,
                    channelID: appState.channel.id,
                    photo: '',
                    video: videourl,
                    etcfile: etcfileurl,
                    filetype,
                  },
                  {
                    headers: {
                      authorization: `bearer ${localStorage.authToken}`,
                      //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                      //Accept: 'application/json',
                    },
                  },
                )
                .then(() => {
                  dispatch({ type: 'POST_TO_DB', text });
                  resetLocalStorage();
                })
                .catch(err => console.error(err));

              setComment('');
            });
          });
        });
      });
    }
    if (values.photo != '' && values.video == '' && values.etcfile == '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          axios
            .post(
              '/api/comments',
              //postData,
              {
                user: localStorage.userId,
                text: text,
                replyp: replyp,
                replypayload: replypayload,
                forwardpayload: forwardpayload,
                forward: forward,
                replyfromid: replyfromid,
                forwardfromid: forwardfromid,
                channelID: appState.channel.id,
                photo: photourl,
                video: '',
                etcfile: '',
                filetype,
              },
              {
                headers: {
                  authorization: `bearer ${localStorage.authToken}`,
                  //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                  //Accept: 'application/json',
                },
              },
            )
            .then(() => {
              dispatch({ type: 'POST_TO_DB', text });
              resetLocalStorage();
            })
            .catch(err => console.error(err));

          setComment('');
        });
      });
    }
    if (values.photo != '' && values.video == '' && values.etcfile != '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          storageRefetcfile.put(values.etcfile).then(function(snapshote) {
            snapshote.ref.getDownloadURL().then(function(downloadURLe) {
              etcfileurl = downloadURLe;
              filetype.filetypee = snapshote.metadata.contentType;
              //console.log(etcfileurl);

              axios
                .post(
                  '/api/comments',
                  //postData,
                  {
                    user: localStorage.userId,
                    text: text,
                    replyp: replyp,
                    replypayload: replypayload,
                    forwardpayload: forwardpayload,
                    forward: forward,
                    replyfromid: replyfromid,
                    forwardfromid: forwardfromid,
                    channelID: appState.channel.id,
                    photo: photourl,
                    video: '',
                    etcfile: etcfileurl,
                    filetype,
                  },
                  {
                    headers: {
                      authorization: `bearer ${localStorage.authToken}`,
                      //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                      //Accept: 'application/json',
                    },
                  },
                )
                .then(() => {
                  dispatch({ type: 'POST_TO_DB', text });
                  resetLocalStorage();
                })
                .catch(err => console.error(err));

              setComment('');
            });
          });
        });
      });
    }
    if (values.photo != '' && values.video != '' && values.etcfile == '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          storageRefvid.put(values.video).then(function(snapshotv) {
            snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
              videourl = downloadURLv;
              filetype.filetypev = snapshotv.metadata.contentType;
              //console.log(videourl);
              axios
                .post(
                  '/api/comments',
                  //postData,
                  {
                    user: localStorage.userId,
                    text: text,
                    replyp: replyp,
                    replypayload: replypayload,
                    forwardpayload: forwardpayload,
                    forward: forward,
                    replyfromid: replyfromid,
                    forwardfromid: forwardfromid,
                    channelID: appState.channel.id,
                    photo: photourl,
                    video: videourl,
                    etcfile: '',
                    filetype,
                  },
                  {
                    headers: {
                      authorization: `bearer ${localStorage.authToken}`,
                      //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                      //Accept: 'application/json',
                    },
                  },
                )
                .then(() => {
                  dispatch({ type: 'POST_TO_DB', text });
                  resetLocalStorage();
                })
                .catch(err => console.error(err));

              setComment('');
            });
          });
        });
      });
    }
    if (values.photo != '' && values.video != '' && values.etcfile != '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          storageRefvid.put(values.video).then(function(snapshotv) {
            snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
              videourl = downloadURLv;
              filetype.filetypev = snapshotv.metadata.contentType;
              //console.log(videourl);
              storageRefetcfile.put(values.etcfile).then(function(snapshote) {
                snapshote.ref.getDownloadURL().then(function(downloadURLe) {
                  etcfileurl = downloadURLe;
                  filetype.filetypee = snapshote.metadata.contentType;
                  //console.log(etcfileurl);

                  axios
                    .post(
                      '/api/comments',
                      //postData,
                      {
                        user: localStorage.userId,
                        text: text,
                        replyp: replyp,
                        replypayload: replypayload,
                        forwardpayload: forwardpayload,
                        forward: forward,
                        replyfromid: replyfromid,
                        forwardfromid: forwardfromid,
                        channelID: appState.channel.id,
                        photo: photourl,
                        video: videourl,
                        etcfile: etcfileurl,
                        filetype,
                      },
                      {
                        headers: {
                          authorization: `bearer ${localStorage.authToken}`,
                          //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
                          //Accept: 'application/json',
                        },
                      },
                    )
                    .then(() => {
                      dispatch({ type: 'POST_TO_DB', text });
                      resetLocalStorage();
                    })
                    .catch(err => console.error(err));

                  setComment('');
                });
              });
            });
          });
        });
      });
    }

    //return { photourl, videourl, etcfileurl };
  };

  const handleSubmit = text => {
    //console.log(multitplefiles.length);
    if (multiplefiles.length > 0) {
      var obj = multipleUpload(text);
    } else {
      var obj = uploadUtil(text);
    }

    //console.log(obj);
    //var photostring = JSON.stringify(values.photo);
    //console.log(values.photo);
    // if (video && video.path != '') {
    //   postData.append('videourl', video.path);
    // } else {
    //   postData.append('videourl', '');
    // }
    // const postData = new FormData();
    // postData.append('photo', values.photo);
    // postData.append('video', values.video);

    // const storage = firebase.storage();
    // let videourl = '';
    // let photourl = '';
    // let etcfileurl = '';
    // let filetype = '';
    // var storageRefpic = storage.ref(`/cvrrtchat/${values.photo.name + uuid()}`); //uuid()
    // var storageRefvid = storage.ref(`/cvrrtchat/${values.video.name + uuid()}`);
    // var storageRefetcfile = storage.ref(`/cvrrtchat/${values.etcfile.name + uuid()}`);
    // if (values.photo == '') {
    //   if (values.video == '') {
    //     axios
    //       .post(
    //         '/api/comments',
    //         //postData,
    //         {
    //           user: localStorage.userId,
    //           text: text,
    //           channelID: appState.channel.id,
    //           photo: '',
    //           video: '',
    //           filetype,
    //         },
    //         {
    //           headers: {
    //             authorization: `bearer ${localStorage.authToken}`,
    //             //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
    //             //Accept: 'application/json',
    //           },
    //         },
    //       )
    //       .then(() => {
    //         dispatch({ type: 'POST_TO_DB', text });
    //       })
    //       .catch(err => console.error(err));

    //     setComment('');
    //   } else {
    //     storageRefvid.put(values.video).then(function(snapshotv) {
    //       snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
    //         //console.log('File available at', downloadURL);
    //         videourl = downloadURLv;
    //         filetype = snapshotv.metadata.contentType;
    //         axios
    //           .post(
    //             '/api/comments',
    //             //postData,
    //             {
    //               user: localStorage.userId,
    //               text: text,
    //               channelID: appState.channel.id,
    //               photo: '',
    //               video: videourl,
    //               filetype,
    //             },
    //             {
    //               headers: {
    //                 authorization: `bearer ${localStorage.authToken}`,
    //                 //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
    //                 //Accept: 'application/json',
    //               },
    //             },
    //           )
    //           .then(() => {
    //             dispatch({ type: 'POST_TO_DB', text });
    //           })
    //           .catch(err => console.error(err));

    //         setComment('');
    //       });
    //     });
    //   }
    // } else {
    //   storageRefpic.put(values.photo).then(function(snapshot) {
    //     console.log(snapshot);
    //     snapshot.ref.getDownloadURL().then(function(downloadURL) {
    //       //console.log('File available at', downloadURL);
    //       photourl = downloadURL;
    //       filetype = snapshot.metadata.contentType;
    //       if (values.video == '') {
    //         axios
    //           .post(
    //             '/api/comments',
    //             //postData,
    //             {
    //               user: localStorage.userId,
    //               text: text,
    //               channelID: appState.channel.id,
    //               photo: photourl,
    //               video: '',
    //               filetype,
    //             },
    //             {
    //               headers: {
    //                 authorization: `bearer ${localStorage.authToken}`,
    //                 //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
    //                 //Accept: 'application/json',
    //               },
    //             },
    //           )
    //           .then(() => {
    //             dispatch({ type: 'POST_TO_DB', text });
    //           })
    //           .catch(err => console.error(err));

    //         setComment('');
    //       } else {
    //         storageRefvid.put(values.video).then(function(snapshotv) {
    //           //console.log(snapshotv);
    //           snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
    //             console.log('File available at', downloadURL);
    //             videourl = downloadURLv;
    //             filetype = snapshotv.metadata.contentType;
    //             axios
    //               .post(
    //                 '/api/comments',
    //                 //postData,
    //                 {
    //                   user: localStorage.userId,
    //                   text: text,
    //                   channelID: appState.channel.id,
    //                   photo: photourl,
    //                   video: videourl,
    //                   filetype,
    //                 },
    //                 {
    //                   headers: {
    //                     authorization: `bearer ${localStorage.authToken}`,
    //                     //'Content-Type': 'multipart/form-data', //'Content-Type': 'application/json',
    //                     //Accept: 'application/json',
    //                   },
    //                 },
    //               )
    //               .then(() => {
    //                 dispatch({ type: 'POST_TO_DB', text });
    //               })
    //               .catch(err => console.error(err));

    //             setComment('');
    //           });
    //         });
    //       }
    //     });
    //   });
    // }
  };

  const uploadUtilPrivate = async text => {
    const storage = firebase.storage();
    let videourl = '';
    let photourl = '';
    let etcfileurl = '';
    let filetype = {
      filetypep: '',
      filetypev: '',
      filetypee: '',
    };
    var storageRefpic = storage.ref(`/cvrrtchat/${values.photo.name + uuid()}`); //uuid()
    var storageRefvid = storage.ref(`/cvrrtchat/${values.video.name + uuid()}`);
    var storageRefetcfile = storage.ref(`/cvrrtchat/${values.etcfile.name + uuid()}`);

    // if (values.photo != '') {
    //   storageRefpic.put(values.photo).then(function(snapshot) {
    //     snapshot.ref.getDownloadURL().then(function(downloadURL) {
    //       photourl = downloadURL;
    //       filetype.filetypep = snapshot.metadata.contentType;
    //       console.log(photourl);
    //     });
    //   });
    // }

    // if (values.video != '') {
    //   storageRefvid.put(values.video).then(function(snapshotv) {
    //     snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
    //       videourl = downloadURLv;
    //       filetype.filetypev = snapshotv.metadata.contentType;
    //       console.log(videourl);
    //     });
    //   });
    // }

    // if (values.etcfile != '') {
    //   storageRefetcfile.put(values.etcfile).then(function(snapshote) {
    //     snapshote.ref.getDownloadURL().then(function(downloadURLe) {
    //       etcfileurl = downloadURLe;
    //       filetype.filetypee = snapshote.metadata.contentType;
    //       console.log(etcfileurl);
    //     });
    //   });
    // }

    if (values.photo == '' && values.video == '' && values.etcfile == '') {
      //000

      await axios
        .post(
          '/api/comments/private',
          {
            userfrom: localStorage.userId,
            userto: currentUser,
            text: text,
            replyp: replyp,
            replypayload: replypayload,
            forwardpayload: forwardpayload,
            forward: forward,
            replyfromid: replyfromid,
            forwardfromid: forwardfromid,
            photo: '',
            video: '',
            etcfile: '',
            filetype,
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
            resetLocalStorage();
          } catch (error) {}
        })
        .catch(err => console.error(err));

      setComment('');
    }
    if (values.photo == '' && values.video == '' && values.etcfile != '') {
      //001

      storageRefetcfile.put(values.etcfile).then(function(snapshote) {
        snapshote.ref.getDownloadURL().then(function(downloadURLe) {
          etcfileurl = downloadURLe;
          filetype.filetypee = snapshote.metadata.contentType;
          //console.log(etcfileurl);

          axios
            .post(
              '/api/comments/private',
              {
                userfrom: localStorage.userId,
                userto: currentUser,
                text: text,
                replyp: replyp,
                replypayload: replypayload,
                forwardpayload: forwardpayload,
                forward: forward,
                replyfromid: replyfromid,
                forwardfromid: forwardfromid,
                photo: '',
                video: '',
                etcfile: etcfileurl,
                filetype,
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
                resetLocalStorage();
              } catch (error) {}
            })
            .catch(err => console.error(err));

          setComment('');
        });
      });
    }
    if (values.photo == '' && values.video != '' && values.etcfile == '') {
      storageRefvid.put(values.video).then(function(snapshotv) {
        snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
          videourl = downloadURLv;
          filetype.filetypev = snapshotv.metadata.contentType;
          //console.log(videourl);
          axios
            .post(
              '/api/comments/private',
              {
                userfrom: localStorage.userId,
                userto: currentUser,
                text: text,
                replyp: replyp,
                replypayload: replypayload,
                forwardpayload: forwardpayload,
                forward: forward,
                replyfromid: replyfromid,
                forwardfromid: forwardfromid,
                photo: '',
                video: videourl,
                etcfile: '',
                filetype,
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
                resetLocalStorage();
              } catch (error) {}
            })
            .catch(err => console.error(err));

          setComment('');
        });
      });
    }
    if (values.photo == '' && values.video != '' && values.etcfile != '') {
      storageRefvid.put(values.video).then(function(snapshotv) {
        snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
          videourl = downloadURLv;
          filetype.filetypev = snapshotv.metadata.contentType;
          //console.log(videourl);
          storageRefetcfile.put(values.etcfile).then(function(snapshote) {
            snapshote.ref.getDownloadURL().then(function(downloadURLe) {
              etcfileurl = downloadURLe;
              filetype.filetypee = snapshote.metadata.contentType;
              //console.log(etcfileurl);

              axios
                .post(
                  '/api/comments/private',
                  {
                    userfrom: localStorage.userId,
                    userto: currentUser,
                    text: text,
                    replyp: replyp,
                    replypayload: replypayload,
                    forwardpayload: forwardpayload,
                    forward: forward,
                    replyfromid: replyfromid,
                    forwardfromid: forwardfromid,
                    photo: '',
                    video: videourl,
                    etcfile: etcfileurl,
                    filetype,
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
                    resetLocalStorage();
                  } catch (error) {}
                })
                .catch(err => console.error(err));

              setComment('');
            });
          });
        });
      });
    }
    if (values.photo != '' && values.video == '' && values.etcfile == '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          axios
            .post(
              '/api/comments/private',
              {
                userfrom: localStorage.userId,
                userto: currentUser,
                text: text,
                replyp: replyp,
                replypayload: replypayload,
                forwardpayload: forwardpayload,
                forward: forward,
                replyfromid: replyfromid,
                forwardfromid: forwardfromid,
                photo: photourl,
                video: '',
                etcfile: '',
                filetype,
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
                resetLocalStorage();
              } catch (error) {}
            })
            .catch(err => console.error(err));

          setComment('');
        });
      });
    }
    if (values.photo != '' && values.video == '' && values.etcfile != '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          storageRefetcfile.put(values.etcfile).then(function(snapshote) {
            snapshote.ref.getDownloadURL().then(function(downloadURLe) {
              etcfileurl = downloadURLe;
              filetype.filetypee = snapshote.metadata.contentType;
              //console.log(etcfileurl);

              axios
                .post(
                  '/api/comments/private',
                  {
                    userfrom: localStorage.userId,
                    userto: currentUser,
                    text: text,
                    replyp: replyp,
                    replypayload: replypayload,
                    forwardpayload: forwardpayload,
                    forward: forward,
                    replyfromid: replyfromid,
                    forwardfromid: forwardfromid,
                    photo: photourl,
                    video: '',
                    etcfile: etcfileurl,
                    filetype,
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
                    resetLocalStorage();
                  } catch (error) {}
                })
                .catch(err => console.error(err));

              setComment('');
            });
          });
        });
      });
    }
    if (values.photo != '' && values.video != '' && values.etcfile == '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          storageRefvid.put(values.video).then(function(snapshotv) {
            snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
              videourl = downloadURLv;
              filetype.filetypev = snapshotv.metadata.contentType;
              //console.log(videourl);
              axios
                .post(
                  '/api/comments/private',
                  {
                    userfrom: localStorage.userId,
                    userto: currentUser,
                    text: text,
                    replyp: replyp,
                    replypayload: replypayload,
                    forwardpayload: forwardpayload,
                    forward: forward,
                    replyfromid: replyfromid,
                    forwardfromid: forwardfromid,
                    photo: photourl,
                    video: videourl,
                    etcfile: '',
                    filetype,
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
                    resetLocalStorage();
                  } catch (error) {}
                })
                .catch(err => console.error(err));

              setComment('');
            });
          });
        });
      });
    }
    if (values.photo != '' && values.video != '' && values.etcfile != '') {
      storageRefpic.put(values.photo).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          photourl = downloadURL;
          filetype.filetypep = snapshot.metadata.contentType;
          //console.log(photourl);
          storageRefvid.put(values.video).then(function(snapshotv) {
            snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
              videourl = downloadURLv;
              filetype.filetypev = snapshotv.metadata.contentType;
              //console.log(videourl);
              storageRefetcfile.put(values.etcfile).then(function(snapshote) {
                snapshote.ref.getDownloadURL().then(function(downloadURLe) {
                  etcfileurl = downloadURLe;
                  filetype.filetypee = snapshote.metadata.contentType;
                  //console.log(etcfileurl);

                  axios
                    .post(
                      '/api/comments/private',
                      {
                        userfrom: localStorage.userId,
                        userto: currentUser,
                        text: text,
                        replyp: replyp,
                        replypayload: replypayload,
                        forwardpayload: forwardpayload,
                        forward: forward,
                        replyfromid: replyfromid,
                        forwardfromid: forwardfromid,
                        photo: photourl,
                        video: videourl,
                        etcfile: etcfileurl,
                        filetype,
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
                        resetLocalStorage();
                      } catch (error) {}
                    })
                    .catch(err => console.error(err));

                  setComment('');
                });
              });
            });
          });
        });
      });
    }

    //return { photourl, videourl, etcfileurl };
  };

  const handleSubmitPrivate = text => {
    if (multiplefiles.length > 0) {
      var obj = multipleUploadPrivate(text);
    } else {
      var obj = uploadUtilPrivate(text);
    }
    // const storage = firebase.storage();
    // let videourl = '';
    // let photourl = '';
    // let filetype = '';
    // var storageRefpic = storage.ref(`/cvrrtchat/${values.photo.name + uuid()}`); //uuid()
    // var storageRefvid = storage.ref(`/cvrrtchat/${values.video.name + uuid()}`);
    // if (values.photo == '') {
    //   if (values.video == '') {
    //     axios
    //       .post(
    //         '/api/comments/private',
    //         {
    //           userfrom: localStorage.userId,
    //           userto: currentUser,
    //           text: text,
    //           photo: '',
    //           video: '',
    //           filetype,
    //         },
    //         {
    //           headers: { authorization: `bearer ${localStorage.authToken}` },
    //         },
    //       )
    //       .then(async () => {
    //         dispatch({ type: 'POST_TO_DB', text });

    //         try {
    //           const result = await axios('/api/comments/allmsgs', {
    //             headers: { authorization: `bearer ${localStorage.authToken}` },
    //           });
    //           //console.log(result.data);
    //           //setAllUserMessages(result.data);

    //           appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
    //         } catch (error) {}
    //       })
    //       .catch(err => console.error(err));

    //     setComment('');
    //   } else {
    //     storageRefvid.put(values.photo).then(function(snapshotv) {
    //       snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
    //         //console.log('File available at', downloadURL);
    //         videourl = downloadURLv;
    //         filetype = snapshotv.metadata.contentType;
    //         axios
    //           .post(
    //             '/api/comments/private',
    //             {
    //               userfrom: localStorage.userId,
    //               userto: currentUser,
    //               text: text,
    //               photo: '',
    //               video: videourl,
    //               filetype,
    //             },
    //             {
    //               headers: { authorization: `bearer ${localStorage.authToken}` },
    //             },
    //           )
    //           .then(async () => {
    //             dispatch({ type: 'POST_TO_DB', text });

    //             try {
    //               const result = await axios('/api/comments/allmsgs', {
    //                 headers: { authorization: `bearer ${localStorage.authToken}` },
    //               });
    //               //console.log(result.data);
    //               //setAllUserMessages(result.data);

    //               appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
    //             } catch (error) {}
    //           })
    //           .catch(err => console.error(err));

    //         setComment('');
    //       });
    //     });
    //   }
    // } else {
    //   storageRefpic.put(values.photo).then(function(snapshot) {
    //     snapshot.ref.getDownloadURL().then(function(downloadURL) {
    //       //console.log('File available at', downloadURL);
    //       photourl = downloadURL;
    //       filetype = snapshot.metadata.contentType;
    //       if (values.video == '') {
    //         axios
    //           .post(
    //             '/api/comments/private',
    //             {
    //               userfrom: localStorage.userId,
    //               userto: currentUser,
    //               text: text,
    //               photo: photourl,
    //               video: '',
    //               filetype,
    //             },
    //             {
    //               headers: { authorization: `bearer ${localStorage.authToken}` },
    //             },
    //           )
    //           .then(async () => {
    //             dispatch({ type: 'POST_TO_DB', text });

    //             try {
    //               const result = await axios('/api/comments/allmsgs', {
    //                 headers: { authorization: `bearer ${localStorage.authToken}` },
    //               });
    //               //console.log(result.data);
    //               //setAllUserMessages(result.data);

    //               appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
    //             } catch (error) {}
    //           })
    //           .catch(err => console.error(err));

    //         setComment('');
    //       } else {
    //         storageRefvid.put(values.video).then(function(snapshotv) {
    //           snapshotv.ref.getDownloadURL().then(function(downloadURLv) {
    //             //console.log('File available at', downloadURL);
    //             videourl = downloadURLv;
    //             filetype = snapshotv.metadata.contentType;
    //             axios
    //               .post(
    //                 '/api/comments/private',
    //                 {
    //                   userfrom: localStorage.userId,
    //                   userto: currentUser,
    //                   text: text,
    //                   photo: photourl,
    //                   video: videourl,
    //                   filetype,
    //                 },
    //                 {
    //                   headers: { authorization: `bearer ${localStorage.authToken}` },
    //                 },
    //               )
    //               .then(async () => {
    //                 dispatch({ type: 'POST_TO_DB', text });

    //                 try {
    //                   const result = await axios('/api/comments/allmsgs', {
    //                     headers: { authorization: `bearer ${localStorage.authToken}` },
    //                   });
    //                   //console.log(result.data);
    //                   //setAllUserMessages(result.data);

    //                   appDispatch({ type: 'SET_USER_MSG', usermsgs: result.data });
    //                 } catch (error) {}
    //               })
    //               .catch(err => console.error(err));

    //             setComment('');
    //           });
    //         });
    //       }
    //     });
    //   });
    // }
  };

  const multipleUploadPrivate = text => {
    const storage = firebase.storage();

    let mfiles = [];
    let cnt = 0;

    try {
      //can be written in backend(serverside) aswell
      if (multiplefiles.length > 0) {
        //console.log(multitplefiles);

        Array.from(multiplefiles).forEach((file, i) => {
          //console.log(i, file);
          var storageRefFile = storage.ref(
            `/cvrrtchat/multiple/${currentUser.name}-${currentUser._id}/${file.name + uuid()}`,
          );
          storageRefFile.put(file).then(function(snapshot) {
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
              let obj = {};
              obj.data = '';
              obj.contentType = snapshot.metadata.contentType;
              obj.path = downloadURL;
              mfiles.push(obj);

              if (mfiles.length == multiplefiles.length) {
                //i==multitplefiles.length-1 --> only send 1 file(cnt can also tried)
                axios
                  .post(
                    '/api/comments/private',
                    {
                      multiplefiles: mfiles,
                      userfrom: localStorage.userId,
                      userto: currentUser,
                      text: text,
                      replyp: replyp,
                      replypayload: replypayload,
                      forwardpayload: forwardpayload,
                      forward: forward,
                      replyfromid: replyfromid,
                      forwardfromid: forwardfromid,
                      photo: '',
                      video: '',
                      etcfile: '',
                      filetype: '',
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
                      resetLocalStorage();
                    } catch (error) {}
                  })
                  .catch(err => console.error(err));

                setComment('');
              }
            });
          });
        });
      }

      //console.log(mfiles);
    } catch (error) {
      console.log(error);
    }
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
    // localStorage.getItem('replyprivately') != '' &&
    // currentUser &&
    // localStorage.getItem('replyfromid') == currentUser._id
    //   ? localStorage.getItem('replyprivately') + ' --> ' + comment
    //   : comment;
    // let comment = '';
    // if (
    //   localStorage.getItem('replyprivately') != '' &&
    //   currentUser &&
    //   localStorage.getItem('replyfromid') == currentUser._id
    // ) {
    //   comment = localStorage.getItem('replyprivately') + ' --> ' + event.target.value;
    // } else {
    //   comment = event.target.value;
    // }
    setComment(event.target.value);
    //setComment(comment);
  };

  const handleReplyPChange = event => {
    setreplyp(event.target.value);
    localStorage.setItem('replyprivately', event.target.value);
  };

  const handleForwardChange = event => {
    setforward(event.target.value);
    localStorage.setItem('forwardmsg', event.target.value);
  };

  const handleChange = name => event => {
    const value =
      name === 'photo' || name === 'video' || name === 'etcfile'
        ? event.target.files[0]
        : event.target.value;
    setValues({ ...values, [name]: value });

    if (name == 'multiplefiles') {
      //console.log(event.target.files);
      setMultipleFiles(event.target.files);
    }

    //console.log(multiplefiles);
  };
  return (
    <Styled.CommentFormWrapper>
      <Styled.CommentForm>
        {replyp && (
          <>
            <p>replyprivately:</p>
            <Styled.CommentTextArea
              onChange={handleReplyPChange}
              //onKeyDown={handleEnter}
              value={replyp}
            />
          </>
        )}
        {forward && (
          <>
            <p>forward:</p>
            <Styled.CommentTextArea
              onChange={handleForwardChange}
              //onKeyDown={handleEnter}
              value={forward}
            />
          </>
        )}
        <button onClick={() => resetLocalStorage()}>Clean Parameters(Ls)</button>
        <Styled.CommentTextArea onChange={handleOnChange} onKeyDown={handleEnter} value={comment} />
        <br />
        <br />
        {'Image'}
        <input accept="image/*" onChange={handleChange('photo')} type="file" />
        {'Video/etc'}
        <input accept="video/*" onChange={handleChange('video')} type="file" />
        {'Misc/Etc'}
        <input
          accept="file_extension|audio/*|video/*|image/*|media_type"
          onChange={handleChange('etcfile')}
          type="file"
        />
        {'Multiple Files'}
        <input
          accept="file_extension|audio/*|video/*|image/*|media_type"
          onChange={handleChange('multiplefiles')}
          type="file"
          multiple
        />
      </Styled.CommentForm>
    </Styled.CommentFormWrapper>
  );
};

export default CreateComment;
