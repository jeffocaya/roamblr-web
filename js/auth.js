import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc
} from './firebase.js';

// Google Sign In
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in database
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // New user - ask for role
      window.location.href = "/choose-role.html";
    } else {
      // Existing user - redirect to dashboard
      const role = userDoc.data().role;
      window.location.href = `/dashboard/${role}.html`;
    }
    
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    alert("Sign in failed. Try again.");
  }
}

// Sign Out
async function logout() {
  await signOut(auth);
  window.location.href = "/index.html";
}

// Check auth state
function checkAuthState(redirectTo = "/index.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user && redirectTo) {
      window.location.href = redirectTo;
    }
  });
}

// Get current user
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    }, reject);
  });
}

export { signInWithGoogle, logout, checkAuthState, getCurrentUser };
