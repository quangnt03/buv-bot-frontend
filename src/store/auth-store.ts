import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import {
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  getCurrentUser as cognitoGetCurrentUser,
} from "@/lib/cognito"
import { storeTokens, clearTokens, getAccessToken, getIdToken } from "@/lib/cognito-token"

interface User {
  username: string
  email: string
  [key: string]: any
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | undefined
  idToken: string | undefined
  error: string | null
}

interface AuthActions {
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
  refreshUser: () => Promise<void>
  setError: (error: string | null) => void
}

// Create the store with persist middleware
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: undefined,
      idToken: undefined,
      error: null,

      // Actions
      signIn: async (username: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          // Call Cognito sign in
          const session = await cognitoSignIn(username, password)

          // Get tokens from session
          const idToken = session.getIdToken().getJwtToken()
          const accessToken = session.getAccessToken().getJwtToken()
          const refreshToken = session.getRefreshToken().getToken()

          // Store tokens
          storeTokens(idToken, accessToken, refreshToken)

          // Get user data
          const userData = await cognitoGetCurrentUser()

          // Update state
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            accessToken,
            idToken,
          })
        } catch (error) {
          console.error("Sign in error:", error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Authentication failed",
          })
          throw error
        }
      },

      signOut: () => {
        try {
          // Call Cognito sign out
          cognitoSignOut()

          // Clear tokens
          clearTokens()

          // Reset state
          set({
            user: null,
            isAuthenticated: false,
            accessToken: undefined,
            idToken: undefined,
            error: null,
          })
        } catch (error) {
          console.error("Sign out error:", error)
          set({
            error: error instanceof Error ? error.message : "Sign out failed",
          })
        }
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true })

          // Get current user from Cognito
          const userData = await cognitoGetCurrentUser()

          // Get tokens from cookies/storage
          const accessToken = getAccessToken()
          const idToken = getIdToken()

          // Update state
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            accessToken,
            idToken,
          })
        } catch (error) {
          console.error("Refresh user error:", error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: undefined,
            idToken: undefined,
          })
        }
      },

      setError: (error) => {
        set({ error })
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage instead of localStorage for better security
      partialize: (state) => ({
        // Only persist these fields, don't persist tokens in the browser storage
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

