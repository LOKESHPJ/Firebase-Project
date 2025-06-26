import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export const signUp = async (name: string, email: string, password: string): Promise<AuthResult> => {
  try {
    // Validate inputs
    if (!name.trim()) {
      return { success: false, error: "Name is required" }
    }
    if (!email.trim()) {
      return { success: false, error: "Email is required" }
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    console.log("Attempting to create user with email:", email)

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log("User created successfully:", userCredential.user.uid)

    // Update the user's display name
    await updateProfile(userCredential.user, {
      displayName: name.trim(),
    })

    console.log("Profile updated successfully")

    return {
      success: true,
      user: userCredential.user,
    }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: getErrorMessage(error.code),
    }
  }
}

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    if (!email.trim()) {
      return { success: false, error: "Email is required" }
    }
    if (!password) {
      return { success: false, error: "Password is required" }
    }

    console.log("Attempting to sign in with email:", email)

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("Sign in successful:", userCredential.user.uid)

    return {
      success: true,
      user: userCredential.user,
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: getErrorMessage(error.code),
    }
  }
}

export const logOut = async (): Promise<AuthResult> => {
  try {
    await signOut(auth)
    console.log("Sign out successful")
    return { success: true }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: getErrorMessage(error.code),
    }
  }
}

export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    if (!email.trim()) {
      return { success: false, error: "Email is required" }
    }

    console.log("Sending password reset email to:", email)
    await sendPasswordResetEmail(auth, email)
    console.log("Password reset email sent successfully")

    return { success: true }
  } catch (error: any) {
    console.error("Password reset error:", error)
    return {
      success: false,
      error: getErrorMessage(error.code),
    }
  }
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      return { success: false, error: "No user logged in" }
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" }
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)
    return { success: true }
  } catch (error: any) {
    console.error("Password change error:", error)
    return {
      success: false,
      error: getErrorMessage(error.code),
    }
  }
}

export const updateUserProfile = async (displayName: string): Promise<AuthResult> => {
  try {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: "No user logged in" }
    }

    if (!displayName.trim()) {
      return { success: false, error: "Name is required" }
    }

    await updateProfile(user, { displayName: displayName.trim() })
    return { success: true, user }
  } catch (error: any) {
    console.error("Profile update error:", error)
    return {
      success: false,
      error: getErrorMessage(error.code),
    }
  }
}

const getErrorMessage = (errorCode: string): string => {
  console.log("Firebase error code:", errorCode)

  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password should be at least 6 characters."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again."
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/requires-recent-login":
      return "Please log in again to perform this action."
    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled. Please contact support."
    case "auth/invalid-api-key":
      return "Invalid API key. Please check your Firebase configuration."
    case "auth/app-deleted":
      return "Firebase app has been deleted. Please refresh the page."
    case "auth/expired-action-code":
      return "The action code has expired. Please try again."
    case "auth/invalid-action-code":
      return "The action code is invalid. Please try again."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support."
    default:
      return `Authentication error: ${errorCode}. Please try again.`
  }
}
