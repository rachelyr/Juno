import React from 'react'
import {Authenticator} from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || " ",
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || " "
        }
    }
});

const formFields = {
    signUp: {
        username: {
            order: 1,
            placeholder: "Enter Username",
            label: "Username",
            required: true
        },
        email: {
            order: 2,
            placeholder: "Enter Your Email",
            label: "Email",
            type: "email",
            required: true
        },
        password: {
            order: 3,
            placeholder: "Enter New Password",
            label: "Password",
            type: "password",
            required: true
        },
        confirm_password: {
            order: 4,
            placeholder: "Confirm Your Password",
            label: "Password",
            type: "password",
            required: true
        },
    }
}

const AuthProvider = ({children} : any) => {
  return (
    <div className='mt-5'>
        <Authenticator formFields={formFields}>
            {({user}: any) => 
            user ? (
                <div>{children}</div>
            ) : (
                <div>
                    <h1>Sign in below</h1>
                </div>
            )   
        }</Authenticator>
    </div>
  )
}

export default AuthProvider