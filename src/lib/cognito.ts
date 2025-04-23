import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserAttribute,
    type CognitoUserSession,
  } from "amazon-cognito-identity-js"
  import { storeTokens, clearTokens } from "@/lib/cognito-token"
  
  // Configure the Cognito user pool
  const poolData = {
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
  }
  
  const userPool = new CognitoUserPool(poolData)
  
  // Sign up a new user
  export const signUp = (email: string, password: string, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: "email",
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: "name",
          Value: name,
        }),
      ]
  
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
  
  // Confirm sign up with verification code
  export const confirmSignUp = (email: string, code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })
  
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
  
  // Resend confirmation code
  export const resendConfirmationCode = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })
  
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
  
  // Sign in a user
  export const signIn = (username: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      })
  
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })
  
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          // Store tokens in cookies
          storeTokens(
            session.getIdToken().getJwtToken(),
            session.getAccessToken().getJwtToken(),
            session.getRefreshToken().getToken(),
          )
          resolve(session)
        },
        onFailure: (err) => {
          reject(err)
        },
      })
    })
  }
  
  // Forgot password - request reset code
  export const forgotPassword = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })
  
      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve()
        },
        onFailure: (err) => {
          reject(err)
        },
      })
    })
  }
  
  // Confirm forgot password with verification code and new password
  export const confirmForgotPassword = (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })
  
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve()
        },
        onFailure: (err) => {
          reject(err)
        },
      })
    })
  }
  
  // Get current authenticated user
  export const getCurrentUser = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser()
  
      if (!cognitoUser) {
        reject(new Error("No user found"))
        return
      }
  
      cognitoUser.getSession((err: Error | null, session: any) => {
        if (err) {
          reject(err)
          return
        }
  
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err)
            return
          }
  
          const userData = attributes?.reduce((acc: any, attribute) => {
            acc[attribute.Name] = attribute.Value
            return acc
          }, {})
  
          resolve({ ...userData, username: cognitoUser.getUsername() })
        })
      })
    })
  }
  
  // Change user attribute (like name)
  export const changeUserAttribute = (attributeName: string, attributeValue: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        reject(new Error("No authenticated user found"));
        return;
      }
      
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession) => {
        if (err) {
          reject(err);
          return;
        }
        
        const attributes = [
          new CognitoUserAttribute({
            Name: attributeName,
            Value: attributeValue
          })
        ];
        
        cognitoUser.updateAttributes(attributes, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }
  
  // Change password for an authenticated user
  export const changePassword = (oldPassword: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        reject(new Error("No authenticated user found"));
        return;
      }
      
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession) => {
        if (err) {
          reject(err);
          return;
        }
        
        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }
  
  // Sign out the current user
  export const signOut = (): void => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
      clearTokens()
    }
  }
  
  