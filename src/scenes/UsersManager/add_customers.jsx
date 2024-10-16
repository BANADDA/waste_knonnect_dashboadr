import { DeleteForever } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, FormControl, IconButton, InputLabel, MenuItem, Modal, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Edit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from "../../components";
import { auth, db } from '../../config/firebaseConfig';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    locationTypeId: '',
    address: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false); // For controlling the modal visibility

  useEffect(() => {
    fetchUsers();
    fetchLocationTypes();
  }, []);

  const fetchUsers = async () => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsers(usersList);
  };

  const fetchLocationTypes = async () => {
    const locationTypesCollection = collection(db, 'locationTypes');
    const locationTypesSnapshot = await getDocs(locationTypesCollection);
    const locationTypesList = locationTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLocationTypes(locationTypesList);
  };

  const addUser = async () => {
    if (newUser.name && newUser.locationTypeId) {
      setLoading(true);
      let authUser = null;
  
      try {
        if (newUser.email) {
          try {
            console.log(`Attempting to create user with email: ${newUser.email}`);
            
            // Create the new user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, 'defaultPassword');
            authUser = userCredential.user;
            console.log('User created in Firebase Auth:', authUser);
  
            await updateProfile(authUser, { displayName: newUser.name });
  
            await addDoc(collection(db, 'users'), {
              name: newUser.name,
              email: newUser.email || null,
              phone: newUser.phone || null,
              locationTypeId: newUser.locationTypeId,
              address: newUser.address,
              uid: authUser.uid,
            });
            toast.success('User created successfully!');
          } catch (error) {
            console.error('Error creating user with Firebase:', error); 
            handleFirebaseError(error);
          }
        } else {
          await addDoc(collection(db, 'users'), {
            name: newUser.name,
            phone: newUser.phone || null,
            locationTypeId: newUser.locationTypeId,
            address: newUser.address,
          });
          toast.success('User added successfully!');
        }
  
        setNewUser({ name: '', email: '', phone: '', locationTypeId: '', address: '' });
        fetchUsers();
        setLoading(false);
        setOpenModal(false); // Close the modal
      } catch (error) {
        console.error('Error in addUser function:', error); 
        handleFirebaseError(error);
        setLoading(false);
      }
    } else {
      toast.error('Please fill in all required fields!');
    }
  };
  
  const handleFirebaseError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        toast.error('Email is already in use by another account.');
        break;
      case 'auth/invalid-email':
        toast.error('The email address is not valid.');
        break;
      case 'auth/weak-password':
        toast.error('The password is too weak.');
        break;
      default:
        toast.error('An unexpected error occurred. Please try again.');
    }
  };  

  const handleEdit = (user) => {
    setNewUser({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      locationTypeId: user.locationTypeId,
      address: user.address,
    });
    setEditMode(true);
    setCurrentUserId(user.id);
    setOpenModal(true); // Open modal for editing
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
    fetchUsers();
    toast.success('User deleted successfully!');
  };

  const handleOpenModal = () => {
    setEditMode(false);
    setNewUser({ name: '', email: '', phone: '', locationTypeId: '', address: '' });
    setOpenModal(true); // Open modal for adding a new user
  };

  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box m="20px">
      <Header title="Users Management" subtitle="Add or Manage Users" />

      {/* Button to Add New User */}
      <Button variant="contained" color="primary" startIcon={<Plus />} onClick={handleOpenModal}>
        Add User
      </Button>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Name</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Email</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Phone</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Location Type</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Address</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={{ border: '1px solid #ccc' }}>{user.name}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{user.email || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{user.phone || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {locationTypes.find((lt) => lt.id === user.locationTypeId)?.name || '-'}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{user.address}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <IconButton onClick={() => handleEdit(user)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="secondary">
                    <DeleteForever sx={{color: "red"}} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Editing Users */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          // p={4}
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            width: 800,
            mx: 'auto',
            mt: '10%',
            boxShadow: 24,
            position: 'relative',
          }}
        >
          <Card sx={{ width: '100%' }}>
            <CardHeader title={editMode ? "Edit User" : "Add New User"} />
            <CardContent>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="user-name">Name</InputLabel>
                <OutlinedInput
                  id="user-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  label="Name"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="user-email">Email (optional)</InputLabel>
                <OutlinedInput
                  id="user-email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  label="Email"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="user-phone">Phone (optional)</InputLabel>
                <OutlinedInput
                  id="user-phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  label="Phone"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="location-type-label">Location Type</InputLabel>
                <Select
                  labelId="location-type-label"
                  id="location-type"
                  value={newUser.locationTypeId}
                  onChange={(e) => setNewUser({ ...newUser, locationTypeId: e.target.value })}
                >
                  {locationTypes.map((locationType) => (
                    <MenuItem key={locationType.id} value={locationType.id}>
                      {locationType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="user-address">Address</InputLabel>
                <OutlinedInput
                  id="user-address"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  label="Address"
                />
              </FormControl>
              <Button
                onClick={addUser}
                sx={{
                  mt: 2,
                  backgroundColor: "darkgreen",
                  color: "white",
                  '&:hover': {
                    backgroundColor: "#004d00",
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 20px',
                }}
                className="w-full"
                disabled={loading}
              >
                <span className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" style={{ verticalAlign: 'middle' }} />
                  {editMode ? "Update User" : "Add User"}
                </span>
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      <ToastContainer />
    </Box>
  );
};

export default UsersManager;
