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
} from './firebase.js';  // Note: './firebase.js' not '/js/firebase.js'

// Export EVERY function
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        role: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      window.location.href = "/auth/choose-role.html";
    } else {
      const role = userDoc.data().role;
      if (role === 'local') window.location.href = "/dashboard/local.html";
      else if (role === 'traveler') window.location.href = "/dashboard/traveler.html";
      else if (role === 'admin') window.location.href = "/dashboard/admin.html";
      else window.location.href = "/auth/choose-role.html";
    }
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    alert("Sign in failed: " + error.message);
  }
}

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
    
    window.location.href = "/auth/choose-role.html";
    return user;
  } catch (error) {
    console.error("Sign up error:", error);
    alert(error.message);
  }
}

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
    
    if (role === 'local') window.location.href = "/dashboard/local.html";
    else if (role === 'traveler') window.location.href = "/dashboard/traveler.html";
    else if (role === 'admin') window.location.href = "/dashboard/admin.html";
    else window.location.href = "/auth/choose-role.html";
    
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    alert(error.message);
  }
}

export async function logout() {
  await signOut(auth);
  window.location.href = "/index.html";
}

export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    }, reject);
  });
}

export function requireAuth(redirectTo = "/auth/login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectTo;
    }
  });
}
