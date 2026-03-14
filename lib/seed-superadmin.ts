/**
 * Run this ONCE to create the superadmin account.
 * Execute from browser console or a one-time script.
 *
 * Superadmin credentials:
 *   cédula: 1007260358
 *   password: romanos812
 */

import { auth, db, doc, setDoc, Timestamp, createUserWithEmailAndPassword } from "./firebase";

export async function seedSuperAdmin() {
  const email = "1007260358@univalle.edu.co";
  const password = "romanos812";

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", credential.user.uid), {
      name: "Super Administrador",
      cedula: "1007260358",
      area: "Dirección",
      role: "superadmin",
      createdBy: "system",
      createdAt: Timestamp.now(),
    });
    console.log("Superadmin creado:", credential.user.uid);
    return { success: true };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error };
  }
}
