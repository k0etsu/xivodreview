import got from "got"

export default class tokenCache {
  constructor(service, auth_url, options) {
    this.service = service;
    this.auth_url = auth_url;
    this.options = options;
    this.tokenPromise = null;
    this.timer = null;
    // get the first token
    this._getNewToken().catch(err => {
      console.log(`Error fetching initial ${this.service} token`, err);
    });
  }

  getToken() {
    if (this.tokenPromise) {
      return this.tokenPromise.then(tokenData => {
        // if token has expired
        if (tokenData.expires < Date.now()) {
          console.log(`refreshing ${this.service} token`);
          return this._getNewToken();
        } else {
          // console.log(`returning token: ${tokenData.token}`);
          return tokenData.token;
        }
      });
    } else {
      return this._getNewToken();
    }
  }

  // non-public method for getting a new token
  _getNewToken() {
    this.tokenPromise = got(this.auth_url, this.options).then(token => {
      // make resolve value be an object that contains the token and the expiration
      // set timer to get a new token automatically right before expiration
      var accessToken = JSON.parse(token["body"])["access_token"];
      var tokenExpiration = JSON.parse(token["body"])["expires_in"];
      var tokenBeforeTime = 300000; // 5 min in ms
      console.log(`\n${this.service}\n\naccessToken:\n${accessToken}\n\ntokenExpiration:\n${Date.now() + tokenExpiration}\n`)
      this._scheduleTokenRefresh(tokenExpiration - tokenBeforeTime);
      return {
        token: accessToken,
        expires: Date.now() + tokenExpiration
      }
    }).catch(err => {
      // up error, clear the cached promise, log the error, keep the promise rejected
      console.log(err);
      this.tokenPromise = null;
      throw err;
    });
    return this.tokenPromise;
  }

  // schedule a call to refresh the token before it expires
  _scheduleTokenRefresh(t) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this._getNewToken().catch(err => {
        console.log(`Error updating ${this.service} token before expiration`, err);
      });
      this.timer = null;
    }, t);
  }
};
