import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, getAuth, GoogleAuthProvider, signOut, sendPasswordResetEmail, signInWithPopup, RecaptchaVerifier } from "firebase/auth";
import { clientApp } from ".";

export const auth = getAuth(clientApp);

export async function setSession(idToken) {
    return await fetch('/api/createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
}

export async function getSignup(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        const response = await setSession(idToken);

        if (!response.ok) {
            const text = await response.text();
            throw new Error("Failed to set session cookie: " + text);
        }

    } catch (error) {
        console.log(error);
    }
}


export async function getLogin(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const response = await setSession(idToken);

    if (!response.ok) {
        const text = await response.text();
        throw new Error("Failed to set session cookie: " + text);
    }

}

export async function getGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    const response = await setSession(idToken);
    if (!response.ok) {
        const text = await response.text();
        throw new Error("Failed to set session cookie: " + text);
    }
    return userCredential.user
}

export async function logout() {
    await signOut(auth)
    await fetch('/api/sessionLogout', {
        method: 'POST',
    });
}

export async function resetPassword() {
    await sendPasswordResetEmail(auth, email)
}

export async function getOneTap(userCredential) {
    const idToken = await userCredential.user.getIdToken();
    const response = await setSession(idToken);
    if (!response.ok) {
        const text = await response.text();
        throw new Error("Failed to set session cookie: " + text);
    }
}
auth.useDeviceLanguage();


export function setupRecaptcha(auth) {
    // On localhost, disable app verification for testing
    if (window.location.hostname === "localhost") {
        auth.settings.appVerificationDisabledForTesting = true;
        console.warn("⚠️ reCAPTCHA disabled for localhost testing");
        return;
    }

    // Production / staging → Use real reCAPTCHA
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
            "recaptcha-container", // must exist in DOM
            {
                size: "invisible",
                callback: (response) => {
                    console.log("✅ reCAPTCHA solved:", response);
                },
                "expired-callback": () => {
                    console.warn("⚠️ reCAPTCHA expired, reset required");
                },
            },
            auth
        );

        window.recaptchaVerifier.render();
    }
}

export async function phoneSignIn(authFn, phoneNumber) {
    try {
        // Ensure reCAPTCHA is set up (or disabled for localhost)
        setupRecaptcha(authFn);

        const number = `+91 ${phoneNumber}`;
        console.log("📞 Phone number formatted for Firebase:", number);

        const appVerifier = window.recaptchaVerifier || undefined;

        const confirmationResult = await signInWithPhoneNumber(authFn, number, appVerifier);
        console.log("✅ Confirmation result:", confirmationResult);

        return confirmationResult;
    } catch (error) {
        console.error("❌ Error during phone sign-in:", error);
        throw new Error("Phone sign-in failed: " + error.message);
    }
}

export async function verifyPhoneCode(confirmationResult, code) {
    try {
        const result = await confirmationResult.confirm(code);
        console.log("✅ Phone code verified:", result);

        const idToken = await result.user.getIdToken();

        const response = await setSession(idToken);
        if (!response.ok) {
            const text = await response.text();
            throw new Error("Failed to set session cookie: " + text);
        }
        return result;
    } catch (error) {
        console.error("Error verifying phone code:", error);
        throw new Error("Phone code verification failed: " + error.message);
    }
}
