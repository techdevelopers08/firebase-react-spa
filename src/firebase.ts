    import { initializeApp } from 'firebase/app';
    import { getFirestore,connectFirestoreEmulator } from 'firebase/firestore';
    import { getAuth,connectAuthEmulator } from 'firebase/auth';

    const fetchFirebaseConfig = async () => {
    try {
        const response = await fetch('https://retail.deploywork.com:4438/firebase');
        if (!response.ok) {
        throw new Error('Failed to fetch Firebase config');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching Firebase config:', error);
        return null;
    }
    };

    const initializeFirebase = async () => {
    const firebaseConfig = await fetchFirebaseConfig();
    if (!firebaseConfig) {
        throw new Error('Firebase config is not available');
    }

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    if (process.env.NODE_ENV === 'development') {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    }

    return { db, auth };
    };

    export default initializeFirebase;

