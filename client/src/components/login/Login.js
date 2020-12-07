import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { Form, Label, Input, Button } from './../../theme/theme.js';
import axios from 'axios';
import Message from '../message/Message';
import { MessageContext } from '../../App';

import firebase from '../main/chatwindow/firebase';
import { auth, provider } from '../main/chatwindow/firebase';

const H2 = styled.h2`
  text-align: center;
  font-size: 2.2rem;
`;

const P = styled.p`
  margin-left: 25%;
  font-size: 12px;
  &:hover {
    text-decoration-color: gray;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const FormWrap = styled.div`
  margin-top: 30px;
  margin-left: 25%;
`;

function Login(props) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  let errorMessage = useContext(MessageContext);

  function signIn() {
    auth
      .signInWithPopup(provider)
      .then(result => {
        console.log(result); //result.user.id (/displayName/email/photoURL)
        let name = result.user.displayName;
        let password = '1234cvrr@1234'; // just to bypass in social(google) login (alter:: pass bool_password and to ignore password in serverside(backend) for social logins and accept for locallogin)
        let email = result.user.email;

        const user = { password, email };
        axios
          .post('/api/users/login', user)
          .then(res => {
            localStorage.setItem('authToken', res.data.authToken);
            localStorage.setItem('userId', res.data.user.id);
            localStorage.setItem('loggedIn', true);
            props.onChange(Math.random());
          })
          .catch(err => {
            console.log(err);
            // errorMessage.set_message(err, true);
          });
      })
      .catch(error => {
        alert(error.message);
      });
  }

  function submitLoginForm(e) {
    e.preventDefault();
    const loginUser = { email, password };

    axios
      .post('api/users/login', loginUser)
      .then(res => {
        localStorage.setItem('authToken', res.data.authToken);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('loggedIn', true);
        props.onChange(Math.random());
      })
      .catch(err => errorMessage.set_message([{ msg: 'Incorrect email or password' }], true));
  }

  return (
    <Form background="white" onSubmit={submitLoginForm}>
      <H2>Login </H2>
      <FormWrap>
        <Label htmlFor="email">
          Email:
          <br />
          <Input
            type="email"
            id="email"
            title="Please enter an email address."
            onChange={e => setEmail(e.target.value)}
            required
          />
          <br />
        </Label>

        <Label htmlFor="password">
          Password:
          <br />
          <Input
            type="password"
            id="password"
            pattern=".{6,}"
            title="6 characters or more is required."
            onChange={e => setPassword(e.target.value)}
            required
          />
          <br />
        </Label>
        <Message message={errorMessage.message} />
        <Button background="purple" type="submit">
          Sign In
        </Button>
        <div>
          {/* <img src={cvrrlogo} alt="cvrr_logo" /> */}
          <h1>Sign in to cvrr_chatrooms</h1>
          <p></p>
          <Button onClick={() => signIn()}>Sign in with Google</Button>
        </div>
      </FormWrap>
      <hr />
      <P onClick={() => props.set_new_user(true)}>Register</P>
    </Form>
  );
}

export default Login;
