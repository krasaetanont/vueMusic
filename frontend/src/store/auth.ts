// src/store/auth.ts
import { reactive } from 'vue'

export const authState = reactive({
  user: null as null | { email: string, name: string },
  isAuthenticated: false,
})
