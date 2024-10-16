import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use for navigation after login
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '../config/firebaseConfig';

const LoginManager = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for button
    const [errorEmail, setErrorEmail] = useState(false);
    const [errorPassword, setErrorPassword] = useState(false);
    const navigate = useNavigate();

    // Google provider
    const googleProvider = new GoogleAuthProvider();

    // Handle login with email and password
    const handleLogin = async () => {
        if (!email) setErrorEmail(true);
        if (!password) setErrorPassword(true);

        if (email && password) {
            setLoading(true); // Set loading to true when login starts
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                toast.success('Logged in successfully!', { position: 'top-center' });
                console.log("Login successful:", userCredential.user); // Log login success
                navigate("/"); // Redirect to home on successful login
            } catch (error) {
                let errorMessage = '';
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No user found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password. Please try again.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format. Please check your email.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many attempts. Please try again later.';
                        break;
                    default:
                        errorMessage = 'Login failed. Please check your credentials.';
                        break;
                }
                toast.error(errorMessage, { position: 'top-center' });
            } finally {
                setLoading(false); // Reset loading state after login attempt
            }
        }
    };

    // Handle Google login
    const handleGoogleLogin = () => {
        setLoading(true); // Set loading for Google login as well
        signInWithPopup(auth, googleProvider)
            .then(() => {
                toast.success('Logged in with Google successfully!', { position: 'top-center' });
                navigate("/"); // Redirect to home on successful login
            })
            .catch((error) => {
                toast.error('Google login failed: ' + error.message, { position: 'top-center' });
            })
            .finally(() => {
                setLoading(false); // Reset loading state
            });
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            bgcolor: '#FCFCFDFF',
            padding: 2
        }}>
            <ToastContainer />
            <Box sx={{
                padding: 5,
                borderRadius: 2,
                boxShadow: 5,
                maxWidth: 800,  // Increased width of the box
                width: '100%',   // Ensures the box takes up full width
                bgcolor: 'white',
                textAlign: 'center'
            }}>
                <Typography variant="h4" gutterBottom>
                    Waste-Konnect
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Sign in to continue
                </Typography>

                <TextField
                    fullWidth
                    variant="outlined"
                    label="Email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorEmail(false); }}
                    error={errorEmail}
                    helperText={errorEmail ? 'Email is required' : ''}
                    sx={{ mb: 3, fontSize: '1.2rem' }}
                />

                <Box sx={{ position: 'relative', mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorPassword(false); }}
                        error={errorPassword}
                        helperText={errorPassword ? 'Password is required' : ''}
                    />
                    <IconButton
                        onClick={togglePasswordVisibility}
                        sx={{ position: 'absolute', right: 10, top: 10 }}
                    >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 3, backgroundColor: '#004d40', color: '#fff', fontSize: '1.1rem', '&:hover': { backgroundColor: '#00332c' } }}
                    onClick={handleLogin}
                    disabled={loading} // Disable button when loading
                >
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
                </Button>

                <Typography variant="subtitle2" gutterBottom sx={{ color: 'gray' }}>
                    Or sign in with
                </Typography>

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleLogin}
                    sx={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB4437', mb: 3 }}
                    disabled={loading} // Disable Google login button when loading
                >
                    {loading ? <CircularProgress size={24} /> : <>
                        <Google sx={{ mr: 1 }} /> Sign In with Google
                    </>}
                </Button>
            </Box>
        </Box>
    );
};

export default LoginManager;
