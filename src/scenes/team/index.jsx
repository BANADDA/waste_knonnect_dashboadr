import { Box, Button, Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Modal, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import emailjs from 'emailjs-com'; // Make sure emailjs is installed
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '../../components';
import { auth, db, storage } from '../../config/firebaseConfig'; // Import storage for Firebase Storage

const Team = () => {
    const [team, setTeam] = useState([]);
    const [newMember, setNewMember] = useState({
        name: '',
        age: '',
        phone: '',
        email: '',
        access: 'user', // Default to user
        imageUrl: '', // To store image URL
    });
    const [imageFile, setImageFile] = useState(null); // To hold the selected image file
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // To store the image preview URL
    const [editMode, setEditMode] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        const teamCollection = collection(db, 'team');
        const teamSnapshot = await getDocs(teamCollection);
        const teamList = teamSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setTeam(teamList);
    };

    // Password generator
    const generatePassword = () => {
        const length = 12; // length of the password
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const addMember = async () => {
        if (newMember.name && newMember.age && newMember.phone && newMember.email && newMember.access) {
            setLoading(true);

            const generatedPassword = generatePassword(); // Generate a password

            try {
                // Step 1: Create user in Firebase Authentication (password is hashed automatically by Firebase)
                const userCredential = await createUserWithEmailAndPassword(auth, newMember.email, generatedPassword);
                const user = userCredential.user;

                // Step 2: Upload the image if selected
                let imageUrl = '';
                if (imageFile) {
                    imageUrl = await uploadImage(user.uid);
                }

                // Step 3: Save user details in Firestore (excluding password)
                const memberData = { 
                    ...newMember,
                    uid: user.uid, // Firebase Auth UID
                    imageUrl, // Add image URL if the image was uploaded
                };

                await addDoc(collection(db, 'team'), memberData);

                // Step 4: Send confirmation email with password and login URL using EmailJS
                emailjs.send(
                  "service_kkhzxo1",       // Your EmailJS service ID
                  "template_141n6hr",      // Your EmailJS template ID
                  {
                    from_name: "mubarakabanadda68@gmail.com",
                    name: "Waste Konnect",
                    email: newMember.email,
                    password: generatedPassword,  // Include the generated password in the email
                    loginUrl: "https://your-login-url.com",  // Replace with your actual login URL
                    reply_to: "mubarakabanadda68@gmail.com",
                  },
                  "1bJtvRR-4vExy8zTu"  // Replace with your actual EmailJS user ID
                )
                  .then((response) => {
                    console.log('Email sent successfully!', response.status, response.text);
                  })
                  .catch((error) => {
                    console.error('Error sending email:', error);
                  });                

                toast.success('Member added successfully!');
                resetForm();
                fetchTeam();
                setLoading(false);
                setOpenModal(false); // Close modal

            } catch (error) {
                console.error('Error adding member:', error);
                toast.error('Error adding member. Please try again.');
                setLoading(false);
            }
        } else {
            toast.error('Please fill in all required fields!');
        }
    };

    const uploadImage = async (uid) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `teamImages/${uid}/${imageFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, imageFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {},
                (error) => {
                    toast.error('Error uploading image: ' + error.message);
                    setLoading(false);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const resetForm = () => {
        setNewMember({
            name: '',
            age: '',
            phone: '',
            email: '',
            access: 'user',
            imageUrl: '',
        });
        setImageFile(null); // Reset image file
        setImagePreviewUrl(''); // Reset preview URL
        setEditMode(false);
        setCurrentMemberId(null);
    };

    const handleEdit = (member) => {
        setNewMember(member);
        setEditMode(true);
        setCurrentMemberId(member.id);
        setOpenModal(true); // Open modal for editing
    };

    const handleDelete = async (id) => {
        const docRef = doc(db, 'team', id);
        await deleteDoc(docRef);
        fetchTeam();
        toast.success('Member deleted successfully!');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file)); // Create preview URL
    };

    return (
        <Box m="20px">
            <Header title="Team Management" subtitle="Add or Manage Team Members" />

            {/* Add Member Button */}
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add Member
            </Button>

            {/* Team Table */}
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table sx={{ border: '1px solid #ccc' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Name</TableCell>
                            {/* <TableCell sx={{ border: '1px solid #ccc' }}>Age</TableCell> */}
                            <TableCell sx={{ border: '1px solid #ccc' }}>Phone</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Email</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Access Level</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Image</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {team.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{member.name}</TableCell>
                                {/* <TableCell sx={{ border: '1px solid #ccc' }}>{member.age}</TableCell> */}
                                <TableCell sx={{ border: '1px solid #ccc' }}>{member.phone}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{member.email}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{member.access}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {member.imageUrl ? <img src={member.imageUrl} alt="Team member" width="50" height="50" /> : 'No Image'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    <Button onClick={() => handleEdit(member)} color="primary">
                                        Edit
                                    </Button>
                                    <Button onClick={() => handleDelete(member.id)} color="secondary">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal for Adding/Editing Member */}
            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-member-modal">
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 2,
                        width: 800,
                        mx: 'auto',
                        mt: '5%',
                        boxShadow: 24,
                        position: 'relative',
                    }}
                >
                    <Card className="bg-white shadow-md mb-4">
                        <CardHeader className="font-semibold text-lg">{editMode ? 'Edit Member' : 'Add New Member'}</CardHeader>
                        <CardContent>
                            {/* Image Upload */}
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel shrink={true} htmlFor="image-upload">
                                    Upload Image
                                </InputLabel>
                                <label
                                    htmlFor="image-upload"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        border: '1px dashed grey',
                                        padding: '20px',
                                        textAlign: 'center',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {imagePreviewUrl ? (
                                        <img src={imagePreviewUrl} alt="Preview" style={{ width: '100px', height: '100px' }} />
                                    ) : (
                                        <img
                                            src="https://icon-library.com/images/upload-image-icon/upload-image-icon-16.jpg"
                                            alt="Upload Icon"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    )}
                                    <span>Upload Image</span>
                                    <small>Images with formats of jpeg, jpg, png, and svg are acceptable</small>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </FormControl>

                            {/* Other Form Fields */}
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel htmlFor="name">Name</InputLabel>
                                <OutlinedInput
                                    id="name"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    label="Name"
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel htmlFor="age">Age</InputLabel>
                                <OutlinedInput
                                    id="age"
                                    value={newMember.age}
                                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                    label="Age"
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel htmlFor="phone">Phone</InputLabel>
                                <OutlinedInput
                                    id="phone"
                                    value={newMember.phone}
                                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                    label="Phone"
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel htmlFor="email">Email</InputLabel>
                                <OutlinedInput
                                    id="email"
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    label="Email"
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel id="access-label">Access Level</InputLabel>
                                <Select
                                    labelId="access-label"
                                    id="access-select"
                                    value={newMember.access}
                                    onChange={(e) => setNewMember({ ...newMember, access: e.target.value })}
                                    label="Access Level"
                                >
                                    <MenuItem value="super-admin">Super Admin</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                onClick={addMember}
                                sx={{
                                    mt: 2,
                                    backgroundColor: 'darkgreen',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#004d00' },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '10px 20px',
                                }}
                                className="w-full"
                                disabled={loading}
                            >
                                {editMode ? 'Update Member' : 'Add Member'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Modal>

            <ToastContainer />
        </Box>
    );
};

export default Team;
