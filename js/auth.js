// js/auth.js
import { 
  auth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from './firebase.js';

// Email/Password Sign Up ONLY
export async function signUpWithEmail(email, password, name) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name,
      role: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    window.location.href = "/roamblr-web/auth/choose-role.html";
    return user;
  } catch (error) {
    console.error("Sign up error:", error);
    alert(error.message);
  }
}

// Email/Password Sign In ONLY
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      window.location.href = "/roamblr-web/auth/choose-role.html";
      return user;
    }
    
    const role = userDoc.data().role;
    
    if (role === 'local') window.location.href = "/roamblr-web/dashboard/local.html";
    else if (role === 'traveler') window.location.href = "/roamblr-web/dashboard/traveler.html";
    else if (role === 'admin') window.location.href = "/roamblr-web/dashboard/admin.html";
    else window.location.href = "/roamblr-web/auth/choose-role.html";
    
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    alert(error.message);
  }
}

// Sign Out
export async function logout() {
  await signOut(auth);
  window.location.href = "/roamblr-web/index.html";
}

// Get current user
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    }, reject);
  });
}

// Check if user is logged in, redirect if not
export function requireAuth(redirectTo = "/roamblr-web/auth/login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectTo;
    }
  });
}
