// js/auth.js
import { 
  auth, 
  googleProvider, 
  signInWithPopup,
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

// Google Sign In
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // New user - create basic profile
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        role: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Redirect to role selection
      window.location.href = "/auth/choose-role.html";
    } else {
      // Existing user - go to dashboard
      const role = userDoc.data().role;
      if (role === 'local') {
        window.location.href = "/dashboard/local.html";
      } else if (role === 'traveler') {
        window.location.href = "/dashboard/traveler.html";
      } else if (role === 'admin') {
        window.location.href = "/dashboard/admin.html";
      } else {
        window.location.href = "/auth/choose-role.html";
      }
    }
    
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    alert("Sign in failed. Please try again.");
  }
}

// Email/Password Sign Up
export async function signUpWithEmail(email, password, name) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Create user document
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name,
      role: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    window.location.href = "/auth/choose-role.html";
    return user;
  } catch (error) {
    console.error("Sign up error:", error);
    alert(error.message);
  }
}

// Email/Password Sign In
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      window.location.href = "/auth/choose-role.html";
      return user;
    }
    
    const role = userDoc.data().role;
    
    if (role === 'local') {
      window.location.href = "/dashboard/local.html";
    } else if (role === 'traveler') {
      window.location.href = "/dashboard/traveler.html";
    } else if (role === 'admin') {
      window.location.href = "/dashboard/admin.html";
    } else {
      window.location.href = "/auth/choose-role.html";
    }
    
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    alert(error.message);
  }
}

// Sign Out
export async function logout() {
  await signOut(auth);
  window.location.href = "/index.html";
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
export function requireAuth(redirectTo = "/auth/login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectTo;
    }
  });
}

// Check role and redirect if not authorized
export async function requireRole(allowedRoles, redirectTo = "/index.html") {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "/auth/login.html";
    return false;
  }
  
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    window.location.href = "/auth/choose-role.html";
    return false;
  }
  
  const role = userDoc.data().role;
  if (!allowedRoles.includes(role)) {
    window.location.href = redirectTo;
    return false;
  }
  
  return true;
}
