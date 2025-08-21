import React, { useEffect, useRef} from 'react'
import {Authenticator} from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import "@aws-amplify/ui-react/styles.css";
import { api } from '@/state/api';
import { useDispatch } from 'react-redux';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/navigation';

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

    const dispatch = useDispatch();
    const router = useRouter();
    const previousUserRef = useRef<string | null>(null);

    useEffect(() => {
        const hubListener = Hub.listen('auth', ({ payload }) => {
            const {event, data} = payload as {event: string; data?: any};
            switch (event) {
                case 'signedIn':
                    const currentUser = data?.username;

                    if(previousUserRef.current && previousUserRef.current !== currentUser){
                        dispatch(api.util.resetApiState());
                        sessionStorage.clear();
                        setTimeout(() => {
                            window.location.href = '/home';
                        }, 50);
                    } else{
                        dispatch(api.util.resetApiState());
                        router.push('/home')
                    }

                    previousUserRef.current = currentUser;
                    break;

                case 'signedOut':
                    previousUserRef.current = null;
                    dispatch(api.util.resetApiState());
                    sessionStorage.clear();
                    break;
            }
        });
        return () => hubListener();
    }, [dispatch, router]);

  return (
    <div className='mt-2'>
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