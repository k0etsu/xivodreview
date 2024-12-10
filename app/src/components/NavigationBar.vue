<script setup lang="ts">
defineProps<{
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
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-github"
                viewBox="0 0 16 16"
                style="margin-top: -6px"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link py-2 px-0 px-lg-2"
              href="https://discord.gg/C7Z7AjnupD"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-discord"
                viewBox="0 0 16 16"
                style="margin-top: -6px"
              >
                <path
                  d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"
                />
              </svg>
            </a>
          </li>
          <li class="nav-item">
            <a href="https://ko-fi.com/K3K1I3DWE" target="_blank"
              ><img
                height="36"
                style="border: 0px; height: 36px; margin: 2px 8px"
                src="https://storage.ko-fi.com/cdn/brandasset/kofi_s_logo_nolabel.png"
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
