import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'firebase/auth';
import {auth} from '../firebaseConfig';
import {isAdmin} from '../adminConfig'; // Updated import
// @ts-ignore
import styles from './AuthPage.module.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [emailHistory, setEmailHistory] = useState<string[]>([]);

    // Load email history from localStorage
    useEffect(() => {
        const savedEmails = localStorage.getItem('emailHistory');
        if (savedEmails) {
            try {
                const parsed = JSON.parse(savedEmails);
                if (Array.isArray(parsed)) {
                    setEmailHistory(parsed);
                }
            } catch (e) {
                console.error('Failed to parse email history', e);
            }
        }
    }, []);

    // Handle email link sign-in
    useEffect(() => {
        const handleSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                setIsProcessing(true);

                try {
                    // Get stored email or prompt user
                    let storedEmail = localStorage.getItem('emailForSignIn');
                    if (!storedEmail) {
                        // Use first email from history if available
                        if (emailHistory.length > 0) {
                            storedEmail = emailHistory[0];
                        } else {
                            setMessage('Please enter your email to complete sign-in');
                            setIsProcessing(false);
                            return;
                        }
                    }

                    // Complete sign-in
                    const result = await signInWithEmailLink(auth, storedEmail, window.location.href);

                    // Check if user is admin
                    if (!isAdmin(result.user.uid)) {
                        await auth.signOut();
                        setMessage('⛔ You do not have admin privileges');
                        setIsProcessing(false);
                        return;
                    }

                    // Save email to history
                    if (!emailHistory.includes(storedEmail)) {
                        const newHistory = [storedEmail, ...emailHistory.filter(e => e !== storedEmail)].slice(0, 5);
                        setEmailHistory(newHistory);
                        localStorage.setItem('emailHistory', JSON.stringify(newHistory));
                    }

                    localStorage.removeItem('emailForSignIn');
                    navigate('/');
                } catch (error) {
                    console.error('Email sign-in error:', error);
                    setMessage('Error completing sign-in. Please try again.');
                    setIsProcessing(false);
                }
            }
        };

        handleSignIn();
    }, [navigate, emailHistory]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setMessage('');

        try {
            const actionCodeSettings = {
                url: `${window.location.origin}/admin`,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            localStorage.setItem('emailForSignIn', email);

            // Add to email history
            const newHistory = [email, ...emailHistory.filter(e => e !== email)].slice(0, 5);
            setEmailHistory(newHistory);
            localStorage.setItem('emailHistory', JSON.stringify(newHistory));

            setMessage('✅ Sign-in link sent to your email!');
        } catch (error: any) {
            console.error('Error sending sign-in link:', error);
            setMessage(`❌ ${error.message || 'Failed to send sign-in link'}`);
        }
        setIsProcessing(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Admin Login</h1>

                {message && (
                    <p className={message.includes('⛔') ? styles.error : styles.message}>
                        {message}
                    </p>
                )}

                {isProcessing ? (
                    <p className={styles.message}>Processing...</p>
                ) : isSignInWithEmailLink(auth, window.location.href) ? (
                    <div>
                        <p>Check your email for the sign-in link</p>
                        <p>If you're on a different device, enter your email:</p>
                        <form onSubmit={handleEmailSubmit} className={styles.form}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className={styles.input}
                                required
                                list="email-history"
                            />
                            <datalist id="email-history">
                                {emailHistory.map((email, i) => (
                                    <option key={i} value={email}/>
                                ))}
                            </datalist>
                            <button type="submit" className={styles.button}>
                                Complete Sign-in
                            </button>
                        </form>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} className={styles.form}>
                        <div className={styles.inputContainer}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className={styles.input}
                                required
                                list="email-history"
                            />
                            <datalist id="email-history">
                                {emailHistory.map((email, i) => (
                                    <option key={i} value={email}/>
                                ))}
                            </datalist>
                        </div>
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={isProcessing}
                        >
                            Send Sign-in Link
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;