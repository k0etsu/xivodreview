import { ref, watch, onBeforeUnmount } from "vue";

export function useAuth() {
  const googleAuthToken = ref<Record<string, any>>({});
  const googleAuthTokenTimer = ref(0);
  const fflogsAuthToken = ref<Record<string, any>>({});
  const fflogsAuthTokenTimer = ref(0);
  const fflogsAuthCode = ref("");
  const fflogsAuthState = ref("");
  const fflogsCodeVerifier = ref("");
  const fflogsCodeChallenge = ref("");
  const fflogsAuthUrl = ref<any>(null);

  function dec2hex(dec: number): string {
    return ("0" + dec.toString(16)).substr(-2);
  }

  function generateCodeVerifier() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
  }

  function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  }

  function base64urlencode(a: ArrayBuffer): string {
    let str = "";
    const bytes = new Uint8Array(a);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function generateCodeChallengeFromVerifier(v: string): Promise<string> {
    const hashed = await sha256(v);
    const base64encoded = base64urlencode(hashed);
    return base64encoded;
  }

  function storeGoogleAuthToken(tokenResponse: Record<string, any>) {
    googleAuthToken.value = tokenResponse;
    googleAuthToken.value["expires_in"] = googleAuthToken.value["expires_in"] * 1000;
    googleAuthToken.value["created_time"] = Date.now();
    localStorage.setItem("cachedGoogleAuthToken", JSON.stringify(googleAuthToken.value));
    clearTimeout(googleAuthTokenTimer.value);
    googleAuthTokenTimer.value = setTimeout(
      clearGoogleAuthToken,
      googleAuthToken.value["expires_in"]
    );
  }

  function getCachedGoogleToken() {
    const cachedGoogleAuthToken = localStorage.getItem("cachedGoogleAuthToken");
    if (cachedGoogleAuthToken) {
      const cachedGoogleAuthObj = JSON.parse(cachedGoogleAuthToken);
      if (
        cachedGoogleAuthObj["created_time"] + cachedGoogleAuthObj["expires_in"] >
        Date.now()
      ) {
        googleAuthToken.value = JSON.parse(cachedGoogleAuthToken);
        const tokenTimeout =
          googleAuthToken.value["created_time"] +
          googleAuthToken.value["expires_in"] -
          Date.now();
        googleAuthTokenTimer.value = setTimeout(clearGoogleAuthToken, tokenTimeout);
      } else {
        localStorage.removeItem("cachedGoogleAuthToken");
      }
    }
  }

  function clearGoogleAuthToken() {
    if (googleAuthTokenTimer.value) {
      clearTimeout(googleAuthTokenTimer.value);
    }
    googleAuthToken.value = {};
    googleAuthTokenTimer.value = 0;
    localStorage.removeItem("cachedGoogleAuthToken");
  }

  async function createFflogsAuthUrl() {
    const fflogsClientId = "984bcd26-7d4e-4d0a-b8aa-80b24755d685";
    fflogsAuthState.value = generateCodeVerifier();
    fflogsAuthUrl.value = new URL("https://www.fflogs.com/oauth/authorize");
    fflogsAuthUrl.value.searchParams.set("client_id", fflogsClientId);
    fflogsCodeVerifier.value = generateCodeVerifier();
    fflogsCodeChallenge.value = await generateCodeChallengeFromVerifier(
      fflogsCodeVerifier.value
    );
    fflogsAuthUrl.value.searchParams.set("code_challenge", fflogsCodeChallenge.value);
    fflogsAuthUrl.value.searchParams.set("code_challenge_method", "S256");
    fflogsAuthUrl.value.searchParams.set("state", fflogsAuthState.value);
    fflogsAuthUrl.value.searchParams.set(
      "redirect_uri",
      `${window.location.origin}/oauth-callback.html`
    );
    fflogsAuthUrl.value.searchParams.set("response_type", "code");
  }

  async function getFflogsAuthToken() {
    createFflogsAuthUrl().then(async () => {
      const fflogsPopup = window.open(
        fflogsAuthUrl.value.href,
        "fflogsAuth",
        "popup=true,width=500, height=500"
      );
      const checkPopup = setInterval(() => {
        try {
          const href = fflogsPopup!.window.location.href;
          if (href.includes("oauth-callback.html")) {
            const url = new URL(href);
            const state = url.searchParams.get("state");
            clearInterval(checkPopup);
            fflogsPopup!.close();
            if (state === fflogsAuthState.value) {
              fflogsAuthCode.value = url.searchParams.get("code") ?? "";
            } else {
              console.error("FFLogs auth state mismatch");
            }
          }
        } catch {
          // Popup is still on fflogs.com (cross-origin) — keep polling
        }
        if (fflogsPopup!.closed) clearInterval(checkPopup);
      }, 500);
    });
  }

  function getCachedFflogsAuthToken() {
    const cachedfflogsAuthToken = localStorage.getItem("cachedFflogsAuthToken");
    if (cachedfflogsAuthToken) {
      const cachedFflogsAuthObj = JSON.parse(cachedfflogsAuthToken);
      if (
        cachedFflogsAuthObj["created_time"] + cachedFflogsAuthObj["expires_in"] >
        Date.now()
      ) {
        fflogsAuthToken.value = cachedFflogsAuthObj;
        const tokenTimeout =
          fflogsAuthToken.value["created_time"] +
          fflogsAuthToken.value["expires_in"] -
          Date.now();
        fflogsAuthTokenTimer.value = setTimeout(clearFflogsAuthToken, tokenTimeout);
      } else {
        localStorage.removeItem("cachedFflogsAuthToken");
      }
    }
  }

  function clearFflogsAuthToken() {
    fflogsAuthToken.value = {};
    localStorage.removeItem("cachedFflogsAuthToken");
  }

  watch(fflogsAuthCode, async (code) => {
    const fflogsClientId = "984bcd26-7d4e-4d0a-b8aa-80b24755d685";
    await fetch("https://www.fflogs.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: fflogsClientId,
        code_verifier: fflogsCodeVerifier.value,
        redirect_uri: `${window.location.origin}/oauth-callback.html`,
        grant_type: "authorization_code",
        code: code,
      }),
    }).then(async (res) => {
      fflogsAuthToken.value = await res.json();
      fflogsAuthToken.value["expires_in"] = fflogsAuthToken.value["expires_in"] * 1000;
      fflogsAuthToken.value["created_time"] = Date.now();
      localStorage.setItem(
        "cachedFflogsAuthToken",
        JSON.stringify(fflogsAuthToken.value)
      );
    });
  });

  getCachedGoogleToken();
  getCachedFflogsAuthToken();

  onBeforeUnmount(() => {
    clearTimeout(googleAuthTokenTimer.value);
    clearTimeout(fflogsAuthTokenTimer.value);
  });

  return {
    googleAuthToken,
    googleAuthTokenTimer,
    fflogsAuthToken,
    fflogsAuthTokenTimer,
    fflogsAuthCode,
    fflogsAuthState,
    fflogsCodeVerifier,
    fflogsCodeChallenge,
    fflogsAuthUrl,
    storeGoogleAuthToken,
    getCachedGoogleToken,
    clearGoogleAuthToken,
    createFflogsAuthUrl,
    getFflogsAuthToken,
    getCachedFflogsAuthToken,
    clearFflogsAuthToken,
  };
}
