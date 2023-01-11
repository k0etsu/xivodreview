<script setup lang="ts">
import { decodeCredential } from 'vue3-google-login'
import { googleSdkLoaded } from "vue3-google-login"
defineProps<{
  msg: string;
}>();
const login = () => {
  googleSdkLoaded((google) => {
    google.accounts.oauth2.initTokenClient({
      client_id: '613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      callback: (response) => {
        console.log("Handle the response", response)
      }
    }).requestAccessToken()
  })
}
</script>

<template>
  <header class="navbar navbar-expand-lg bd-navbar sticky-top">
    <nav
      class="container-fluid bd-gutter flex-wrap flex-lg-nowrap"
      aria-label="Main navigation"
    >
      <a class="navbar-brand" href="#">xivodreview</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav">
          <li class="nav-item">
            <a
              class="nav-link py-2 px-0 px-lg-2"
              href="https://github.com/k0etsu/xivodreview"
              target="_blank"
              >{{ msg }}</a
            >
          </li>
        </ul>
        <ul class="navbar-nav flex-row flex-wrap ms-md-auto">
          <li class="nav-item dropdown">
            <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
              <symbol id="circle-half" viewBox="0 0 16 16">
                <path
                  d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"
                ></path>
              </symbol>
              <symbol id="moon-stars-fill" viewBox="0 0 16 16">
                <path
                  d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"
                ></path>
                <path
                  d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"
                ></path>
              </symbol>
              <symbol id="sun-fill" viewBox="0 0 16 16">
                <path
                  d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
                ></path>
              </symbol>
            </svg>
            <button
              class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
              id="bd-theme"
              type="button"
              aria-expanded="false"
              data-bs-toggle="dropdown"
              data-bs-display="static"
            >
              <svg
                class="bi my-1 theme-icon-active"
                width="1em"
                height="1em"
                fill="currentColor"
              >
                <use href="#circle-half"></use>
              </svg>
              <span class="d-lg-none ms-2">Toggle theme</span>
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="bd-theme"
              style="--bs-dropdown-min-width: 8rem"
            >
              <li>
                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center"
                  data-bs-theme-value="light"
                >
                  <svg
                    class="bi me-2 opacity-50 theme-icon"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                  >
                    <use href="#sun-fill"></use>
                  </svg>
                  Light
                  <svg class="bi ms-auto d-none">
                    <use href="#check2"></use>
                  </svg>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center"
                  data-bs-theme-value="dark"
                >
                  <svg
                    class="bi me-2 opacity-50 theme-icon"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                  >
                    <use href="#moon-stars-fill"></use>
                  </svg>
                  Dark
                  <svg class="bi ms-auto d-none">
                    <use href="#check2"></use>
                  </svg>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item d-flex align-items-center active"
                  data-bs-theme-value="auto"
                >
                  <svg
                    class="bi me-2 opacity-50 theme-icon"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                  >
                    <use href="#circle-half"></use>
                  </svg>
                  Auto
                  <svg class="bi ms-auto d-none">
                    <use href="#check2"></use>
                  </svg>
                </button>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <!-- <GoogleLogin data-theme="filled_blue" :callback="callback" prompt auto-login> -->
            <GoogleLogin :callback="callback" popup-type="TOKEN">
              <button type="button" class="btn btn-dark">
                Login using Google
              </button>
            </GoogleLogin>
            <button @click="login" type="button" class="btn btn-primary">
              Login using Google
            </button>
            <button @click="googleLogin" type="button" class="btn btn-outline-primary">
              Login using Google
            </button>
            <div id="googleAuthButton"></div>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script lang="ts">
export default {
  data() {
    return {
      googleAuthResponse: {},
    };
  },
  emits: {
    googleAuth: null
  },
  watch: {
    googleAuthResponse(newValue) {
      console.log(newValue)
      this.$emit('googleAuth', newValue)
    }
  },
  methods: {
    callback(response) {
      // This callback will be triggered when the user selects or login to
      // his Google account from the popup
      // const userData = decodeCredential(response.credential);
      console.log('response', response);
      // console.log("userData", userData);
      this.googleAuthResponse = response;
    },
    googleLogin() {
      googleSdkLoaded((google) => {
        google.accounts.oauth2.initTokenClient({
          client_id: '613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/youtube.readonly',
          callback: (response) => {
            console.log("Handle the response", response)
            this.$emit('googleAuth', response)
          }
        }).requestAccessToken()
      })
    },
  },
  created() {
    google.accounts.oauth2.initTokenClient({
      client_id: "613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/youtube.readonly"
    })
    google.accounts.id.initialize({
      client_id: "613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com",
      callback: this.callback
    });
    google.accounts.id.renderButton(
      document.getElementById("googleAuthButton"),
      { theme: "filled_blue", size: "large" }
    );
    google.accounts.id.prompt();
  },
};
</script>

<style>
.navBar {
  white-space: nowrap;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.navBar * {
  display: inline;
}
.navLogo {
  margin: 0.5em;
  margin-right: 1em;
}
.navLink {
  text-align: left;
  margin-right: 1em;
}
</style>
