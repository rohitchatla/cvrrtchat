import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { Form, Label, Input, Button } from './../../theme/theme.js';
import axios from 'axios';
import Message from '../message/Message';
import { MessageContext } from '../../App';

import firebase from '../main/chatwindow/firebase';
import { auth, provider } from '../main/chatwindow/firebase';

const P = styled.p`
  margin-left: 25%;
  font-size: 12px;
  &:hover {
    text-decoration-color: gray;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const H2 = styled.h2`
  text-align: center;
  font-size: 2.2rem;
`;

const FormWrap = styled.div`
  margin-top: 30px;
  margin-left: 25%;
`;

function Register(props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  let errorMessage = useContext(MessageContext);

  function signUp() {
    auth
      .signInWithPopup(provider)
      .then(result => {
        console.log(result); //result.user.id (/displayName/email/photoURL)
        let name = result.user.displayName;
        let password = '1234cvrr@1234'; // just to bypass in social(google) login (alter:: pass bool_password and to ignore password in serverside(backend) for social logins and accept for locallogin)
        let email = result.user.email;
        const newUser = { name, password, email };

        axios
          .post('/api/users/register', newUser)
          .then(res => {
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
          .catch(err => {
            console.log(err);
            // errorMessage.set_message(err, true);
          });
      })
      .catch(error => {
        alert(error.message);
      });
  }

  function subRegisterForm(e) {
    e.preventDefault();
    const newUser = { name, password, email };

    axios
      .post('/api/users/register', newUser)
      .then(res => {
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
      .catch(err => {
        console.log(err);
        // errorMessage.set_message(err, true);
      });
  }

  return (
    <Form form="register" onSubmit={subRegisterForm}>
      <H2>Create an Account </H2>
      <FormWrap>
        <Label htmlFor="name">
          Username:
          <br />
          <Input
            type="text"
            id="name"
            pattern=".{6,15}"
            onChange={e => setName(e.target.value)}
            title="6 to 15 characters is required."
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
            onChange={e => setPassword(e.target.value)}
            title="6 characters or more is required."
            required
          />
          <br />
        </Label>

        <Label htmlFor="email">
          Email:
          <br />
          <Input
            type="email"
            id="email"
            onChange={e => setEmail(e.target.value)}
            title="Please enter an email address."
            required
          />
          <br />
        </Label>
        <Message message={errorMessage.message} />
        <Button type="submit">Sign Up</Button>
        <div>
          {/* <img src={cvrrlogo} alt="cvrr_logo" /> */}
          <h1>Sign up to cvrr_chatrooms</h1>
          <p></p>
          <Button onClick={() => signUp()}>Sign up with Google</Button>
        </div>
      </FormWrap>
      <hr />
      <P onClick={() => props.set_new_user(false)}>Sign in</P>
    </Form>
  );
}

export default Register;
