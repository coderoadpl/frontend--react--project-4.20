import React from 'react'

import isEmail from 'validator/lib/isEmail'

import FullPageLayout from './components/FullPageLayout'
import FullPageMessage from './components/FullPageMessage'
import FullPageLoader from './components/FullPageLoader'
import Message from './components/Message'
import LoginForm from './components/LoginForm'
import CreateAccountForm from './components/CreateAccountForm'
import RecoverPasswordForm from './components/RecoverPasswordForm'
import AppBar from './components/AppBar'
import Logo from './components/Logo'
import UserDropdown from './components/UserDropdown'
import ListItem from './components/ListItem'
import List from './components/List'

import { signIn, signUp, getIdToken, decodeToken, checkIfUserIsLoggedIn, sendPasswordResetEmail, logOut } from './auth'

import classes from './styles.module.css'

const EMAIL_VALIDATION_ERROR = 'Please type a valid e-mail!'
const PASSWORD_VALIDATION_ERROR = 'Password must have at least 6 chars!'
const REPEAT_PASSWORD_VALIDATION_ERROR = 'Passwords must be the same!'

export class App extends React.Component {
  state = {
    // global state
    isLoading: false,
    hasError: false,
    errorMessage: '',
    isInfoDisplayed: false,
    infoMessage: '',

    // user/auth state
    isUserLoggedIn: false,
    userDisplayName: '',
    userEmail: '',
    userAvatar: '',

    // user dropdown
    isUserDropdownOpen: false,

    // router state
    notLoginUserRoute: 'LOGIN', // 'CREATE-ACCOUNT' or 'RECOVER-PASSWORD'

    // login page state
    loginEmail: '',
    loginEmailError: EMAIL_VALIDATION_ERROR,
    loginPassword: '',
    loginPasswordError: PASSWORD_VALIDATION_ERROR,
    loginSubmitted: false,

    // create account page
    createAccountEmail: '',
    createAccountEmailError: EMAIL_VALIDATION_ERROR,
    createAccountPassword: '',
    createAccountPasswordError: PASSWORD_VALIDATION_ERROR,
    createAccountRepeatPassword: '',
    createAccountRepeatPasswordError: REPEAT_PASSWORD_VALIDATION_ERROR,
    createAccountSubmitted: false,

    // recover password page
    recoverPasswordEmail: '',
    recoverPasswordEmailError: EMAIL_VALIDATION_ERROR,
    recoverPasswordSubmitted: false,

    // course list page
    courses: null,
    searchPhrase: ''
  }

  async componentDidMount () {
    this.setState(() => ({ isLoading: true }))
    const userIsLoggedIn = await checkIfUserIsLoggedIn()
    this.setState(() => ({ isLoading: false }))
    if (userIsLoggedIn) this.onUserLogin()
  }

  onClickLogin = async () => {
    this.setState(() => ({ loginSubmitted: true }))

    if (this.state.loginEmailError) return
    if (this.state.loginPasswordError) return

    this.setState(() => ({ isLoading: true }))
    try {
      await signIn(this.state.loginEmail, this.state.loginPassword)
      this.onUserLogin()
    } catch (error) {
      this.setState(() => ({
        hasError: true,
        errorMessage: error.data.error.message
      }))
    } finally {
      this.setState(() => ({ isLoading: false }))
    }
  }

  onClickCreateAccount = async () => {
    this.setState(() => ({ createAccountSubmitted: true }))

    if (this.state.createAccountEmailError) return
    if (this.state.createAccountPasswordError) return
    if (this.state.createAccountRepeatPasswordError) return

    this.setState(() => ({ isLoading: true }))
    try {
      await signUp(this.state.createAccountEmail, this.state.createAccountPassword)
      this.setState(() => ({
        isInfoDisplayed: true,
        infoMessage: 'User account created. User is logged in!'
      }))
      this.onUserLogin()
    } catch (error) {
      this.setState(() => ({
        hasError: true,
        errorMessage: error.data.error.message
      }))
    } finally {
      this.setState(() => ({ isLoading: false }))
    }
  }

  onClickRecover = async () => {
    this.setState(() => ({ recoverPasswordSubmitted: true }))

    if (this.state.recoverPasswordEmailError) return

    this.setState(() => ({ isLoading: true }))
    try {
      await sendPasswordResetEmail(this.state.recoverPasswordEmail)
      this.setState(() => ({
        isInfoDisplayed: true,
        infoMessage: 'Check your inbox!'
      }))
      this.onUserLogin()
    } catch (error) {
      this.setState(() => ({
        hasError: true,
        errorMessage: error.data.error.message
      }))
    } finally {
      this.setState(() => ({ isLoading: false }))
    }
  }

  onUserLogin = () => {
    const token = getIdToken()
    if (!token) return
    const user = decodeToken(token)

    // @TODO replace this token decoding with request for user data
    this.setState(() => ({
      isUserLoggedIn: true,
      userDisplayName: '',
      userEmail: user.email,
      userAvatar: ''
    }))
  }

  onClickLogOut = async () => {
    await logOut()
    this.setState(() => ({
      isUserLoggedIn: false,
      userDisplayName: '',
      userEmail: '',
      userAvatar: ''
    }))
  }

  dismissError = () => {
    this.setState(() => ({
      hasError: false,
      errorMessage: ''
    }))
  }

  dismissMessage = () => {
    this.setState(() => ({
      isInfoDisplayed: false,
      infoMessage: ''
    }))
  }

  render () {
    const {
      isUserLoggedIn,
      userDisplayName,
      userEmail,
      userAvatar,
      isUserDropdownOpen,
      loginEmail,
      loginEmailError,
      loginPassword,
      loginPasswordError,
      loginSubmitted,
      isLoading,
      isInfoDisplayed,
      infoMessage,
      hasError,
      errorMessage,
      notLoginUserRoute,
      createAccountEmail,
      createAccountEmailError,
      createAccountPassword,
      createAccountPasswordError,
      createAccountRepeatPassword,
      createAccountRepeatPasswordError,
      createAccountSubmitted,
      recoverPasswordEmail,
      recoverPasswordEmailError,
      recoverPasswordSubmitted
    } = this.state

    return (
      <div>

        {
          isUserLoggedIn ?
            <div>
              <AppBar>
                <Logo
                  className={classes.logo}
                />
                <UserDropdown
                  className={classes.userDropdown}
                  userDisplayName={userDisplayName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  onClick={() => this.setState((prevState) => ({ isUserDropdownOpen: !prevState.isUserDropdownOpen }))}
                  contentList={
                    isUserDropdownOpen ?
                      <List
                        className={classes.userDropdownList}
                      >
                        <ListItem
                          icon={'profile'}
                          text={'Profile'}
                          disabled={true}
                        />
                        <ListItem
                          icon={'log-out'}
                          text={'Log out'}
                          onClick={this.onClickLogOut}
                        />
                      </List>
                      :
                      null
                  }
                />
              </AppBar>
            </div>
            :
            notLoginUserRoute === 'LOGIN' ?
              <FullPageLayout>
                <LoginForm
                  email={loginEmail}
                  emailError={loginSubmitted ? loginEmailError : undefined}
                  password={loginPassword}
                  passwordError={loginSubmitted ? loginPasswordError : undefined}
                  onChangeEmail={(e) => {
                    this.setState(() => ({
                      loginEmail: e.target.value,
                      loginEmailError: isEmail(e.target.value) ? '' : EMAIL_VALIDATION_ERROR
                    }))
                  }}
                  onChangePassword={(e) => {
                    this.setState(() => ({
                      loginPassword: e.target.value,
                      loginPasswordError: e.target.value.length >= 6 ? '' : PASSWORD_VALIDATION_ERROR
                    }))
                  }}
                  onClickLogin={this.onClickLogin}
                  onClickCreateAccount={() => this.setState(() => ({ notLoginUserRoute: 'CREATE-ACCOUNT' }))}
                  onClickForgotPassword={() => this.setState(() => ({ notLoginUserRoute: 'RECOVER-PASSWORD' }))}
                />
              </FullPageLayout>
              :
              notLoginUserRoute === 'CREATE-ACCOUNT' ?
                <FullPageLayout>
                  <CreateAccountForm
                    email={createAccountEmail}
                    emailError={createAccountSubmitted ? createAccountEmailError : undefined}
                    password={createAccountPassword}
                    passwordError={createAccountSubmitted ? createAccountPasswordError : undefined}
                    repeatPassword={createAccountRepeatPassword}
                    repeatPasswordError={createAccountSubmitted ? createAccountRepeatPasswordError : undefined}
                    onChangeEmail={(e) => this.setState(() => ({
                      createAccountEmail: e.target.value,
                      createAccountEmailError: isEmail(e.target.value) ? '' : EMAIL_VALIDATION_ERROR
                    }))}
                    onChangePassword={(e) => this.setState(() => ({
                      createAccountPassword: e.target.value,
                      createAccountPasswordError: e.target.value.length >= 6 ? '' : PASSWORD_VALIDATION_ERROR,
                      createAccountRepeatPasswordError: createAccountRepeatPassword === e.target.value ? '' : REPEAT_PASSWORD_VALIDATION_ERROR
                    }))}
                    onChangeRepeatPassword={(e) => this.setState(() => ({
                      createAccountRepeatPassword: e.target.value,
                      createAccountRepeatPasswordError: createAccountPassword === e.target.value ? '' : REPEAT_PASSWORD_VALIDATION_ERROR
                    }))}
                    onClickCreateAccount={this.onClickCreateAccount}
                    onClickBackToLogin={() => this.setState(() => ({ notLoginUserRoute: 'LOGIN' }))}
                  />
                </FullPageLayout>
                :
                notLoginUserRoute === 'RECOVER-PASSWORD' ?
                  <FullPageLayout>
                    <RecoverPasswordForm
                      email={recoverPasswordEmail}
                      emailError={recoverPasswordSubmitted ? recoverPasswordEmailError : undefined}
                      onChangeEmail={(e) => this.setState(() => ({
                        recoverPasswordEmail: e.target.value,
                        recoverPasswordEmailError: isEmail(e.target.value) ? '' : EMAIL_VALIDATION_ERROR
                      }))}
                      onClickRecover={this.onClickRecover}
                      onClickBackToLogin={() => this.setState(() => ({ notLoginUserRoute: 'LOGIN' }))}
                    />
                  </FullPageLayout>
                  :
                  null
        }

        {
          isLoading ?
            <FullPageLoader />
            :
            null
        }

        {
          isInfoDisplayed ?
            <FullPageMessage
              message={infoMessage}
              iconVariant={'info'}
              buttonLabel={'OK'}
              onButtonClick={this.dismissMessage}
            />
            :
            null
        }

        {
          hasError ?
            <FullPageLayout
              className={'wrapper-class'}
            >
              <Message
                className={'regular-class'}
                message={errorMessage}
                iconVariant={'error'}
                onButtonClick={this.dismissError}
              />
            </FullPageLayout>
            :
            null
        }

      </div>
    )
  }
}

export default App
