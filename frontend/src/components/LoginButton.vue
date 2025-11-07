<script setup lang="ts">
import {
  useTokenClient,
  type AuthCodeFlowSuccessResponse,
  type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";
import { authState } from "../store/auth";

const ALLOWED_EMAIL = "athora627446@gmail.com";

const handleOnSuccess = (response: AuthCodeFlowSuccessResponse) => {
  console.log("Access Token: ", response.access_token);

  // Fetch user info from Google API using the token
  fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${response.access_token}` },
  })
    .then(res => res.json())
    .then((userInfo) => {
      console.log("User Info:", userInfo);

      if (userInfo.email === ALLOWED_EMAIL) {
        authState.user = { email: userInfo.email, name: userInfo.name };
        authState.isAuthenticated = true;
      } else {
        alert("Access denied: unauthorized email");
        authState.user = null;
        authState.isAuthenticated = false;
      }
    })
    .catch(err => {
      console.error("Failed to fetch user info:", err);
      authState.user = null;
      authState.isAuthenticated = false;
    });
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
  console.log("Error: ", errorResponse);
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError
});
</script>

<template>
  <button :disabled="!isReady" @click="() => login()">Login with Google</button>
</template>
