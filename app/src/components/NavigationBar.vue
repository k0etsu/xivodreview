<script setup lang="ts">
defineProps<{
  msg: string;
  googleAuthToken: {};
  fflogsAuthToken: {};
}>();
</script>

<template>
  <header class="navbar navbar-expand-lg bd-navbar sticky-top">
    <nav
      class="container-fluid bd-gutter flex-wrap flex-lg-nowrap"
      aria-label="Main navigation"
    >
      <a class="navbar-brand" href="/">xivodreview</a>
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
            <a class="nav-link py-2 px-0 px-lg-2" href="/privacy-policy.html"
              >Privacy Policy</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link py-2 px-0 px-lg-2"
              href="https://github.com/k0etsu/xivodreview"
              target="_blank"
              >{{ msg }}</a
            >
          </li>
          <li class="nav-item">
            <a href="https://ko-fi.com/K3K1I3DWE" target="_blank"
              ><img
                height="36"
                style="border: 0px; height: 36px; margin: 2px 8px"
                src="https://storage.ko-fi.com/cdn/kofi3.png?v=3"
                border="0"
                alt="Buy Me a Coffee at ko-fi.com"
            /></a>
            <!-- <script type='text/javascript' src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('kofi', '#f26a66', 'K3K1I3DWE');kofiwidget2.draw();</script>  -->
          </li>
        </ul>
        <ul class="navbar-nav flex-row flex-wrap ms-md-auto">
          <li
            v-if="Object.keys(fflogsAuthToken).length == 0"
            class="nav-item py-1 px-0 px-lg-2"
          >
            <button
              type="button"
              class="btn btn-outline-primary text-nowrap"
              @click="$emit('getFflogsAuthToken')"
            >
              <img
                src="https://assets.rpglogs.com/img/ff/favicon.png?v=2"
                style="height: 1.5em"
              />Login
            </button>
          </li>
          <li v-else class="nav-item py-1 px-0 px-lg-2">
            <button
              type="button"
              class="btn btn-outline-primary text-nowrap"
              @click="$emit('clearFflogsAuthToken')"
            >
              <img
                src="https://assets.rpglogs.com/img/ff/favicon.png?v=2"
                style="height: 1.5em"
              />Logout
            </button>
          </li>
          <li
            v-if="
              googleAuthToken.created_time + googleAuthToken.expires_in >
              Date.now()
            "
            class="nav-item py-1 px-0 px-lg-2"
          >
            <button
              type="button"
              class="btn btn-outline-danger text-nowrap"
              @click="$emit('clearGoogleAuthToken')"
            >
              <img
                src="https://www.youtube.com/s/desktop/82a4cf4f/img/favicon_144x144.png"
                style="height: 1.5em"
              />
              Logout
            </button>
          </li>
          <li v-else class="nav-item py-1 px-0 px-lg-2">
            <button
              type="button"
              class="btn btn-outline-danger text-nowrap"
              @click="$emit('getGoogleAuthToken')"
            >
              <img
                src="https://www.youtube.com/s/desktop/82a4cf4f/img/favicon_144x144.png"
                style="height: 1.5em"
              />
              Login
            </button>
          </li>
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
                  @click="setLightTheme"
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
                  @click="setDarkTheme"
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
                  @click="getColorTheme"
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
            <GoogleLogin
              id="google-auth-button"
              data-theme="filled_blue"
              :callback="callback"
            />
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
      colorTheme: "",
      tooltipList: null,
    };
  },
  emits: [
    "googleAuth",
    "clearGoogleAuthToken",
    "getGoogleAuthToken",
    "getFflogsAuthToken",
    "clearFflogsAuthToken",
  ],
  watch: {
    googleAuthResponse(newValue) {
      this.$emit("googleAuth", newValue);
    },
  },
  methods: {
    callback(response) {
      this.googleAuthResponse = response;
    },
    getColorTheme() {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.colorTheme = "dark";
      } else {
        this.colorTheme = "light";
      }
    },
    setDarkTheme() {
      this.colorTheme = "dark";
    },
    setLightTheme() {
      this.colorTheme = "light";
    },
  },
  created() {
    this.colorTheme = localStorage.getItem("theme");
    if (this.colorTheme == "auto") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.colorTheme = "dark";
      } else {
        this.colorTheme = "light";
      }
    }
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

#bd-theme {
  margin-left: 1em;
}

#google-auth-button {
  margin-left: 1em;
}
</style>
