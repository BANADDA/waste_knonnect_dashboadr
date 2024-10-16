import { DeleteForever } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, FormControl, IconButton, InputLabel, Modal, OutlinedInput, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Edit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Header } from '../../components';
import { db } from '../../config/firebaseConfig';

const LocationTypesManager = () => {
  const [locationTypes, setLocationTypes] = useState([]);
  const [newLocationType, setNewLocationType] = useState({ name: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentLocationTypeId, setCurrentLocationTypeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false); // For controlling the modal visibility

  useEffect(() => {
    fetchLocationTypes();
  }, []);

  const fetchLocationTypes = async () => {
    const locationTypesCollection = collection(db, 'locationTypes');
    const locationTypesSnapshot = await getDocs(locationTypesCollection);
    const locationTypesList = locationTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLocationTypes(locationTypesList);
  };

  const addLocationType = async () => {
    if (newLocationType.name && newLocationType.description) {
      setLoading(true);
      try {
        if (editMode) {
          const docRef = doc(db, 'locationTypes', currentLocationTypeId);
          await updateDoc(docRef, newLocationType);
          setEditMode(false);
          setCurrentLocationTypeId(null);
        } else {
          await addDoc(collection(db, 'locationTypes'), newLocationType);
        }
        setNewLocationType({ name: '', description: '' });
        fetchLocationTypes();
        setLoading(false);
        setOpenModal(false); // Close the modal
      } catch (error) {
        console.error('Error adding/updating location type:', error);
        setLoading(false);
      }
    }
  };

  const handleEdit = (locationType) => {
    setNewLocationType({ name: locationType.name, description: locationType.description });
    setEditMode(true);
    setCurrentLocationTypeId(locationType.id);
    setOpenModal(true); // Open modal for editing
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'locationTypes', id);
    await deleteDoc(docRef);
    fetchLocationTypes();
  };

  const handleOpenModal = () => {
    setEditMode(false);
    setNewLocationType({ name: '', description: '' });
    setOpenModal(true); // Open modal for adding a new location type
  };

  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box m="20px">
      <Header title="Location Types Management" subtitle="Add or Manage Location Types" />

      {/* Button to Add New Location Type */}
      <Button variant="contained" color="primary" startIcon={<Plus />} onClick={handleOpenModal}>
        Add Location Type
      </Button>

      {/* Location Types Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Location Type Name</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Description</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locationTypes.map((locationType) => (
              <TableRow key={locationType.id}>
                <TableCell sx={{ border: '1px solid #ccc' }}>{locationType.name}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{locationType.description}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <IconButton onClick={() => handleEdit(locationType)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(locationType.id)} color="secondary">
                  <DeleteForever sx={{color: "red"}} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Editing Location Types */}
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
            <CardHeader title={editMode ? "Edit Location Type" : "Add New Location Type"} />
            <CardContent>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="location-name">Location Type Name</InputLabel>
                <OutlinedInput
                  id="location-name"
                  value={newLocationType.name}
                  onChange={(e) => setNewLocationType({ ...newLocationType, name: e.target.value })}
                  label="Location Type Name"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="location-description">Description</InputLabel>
                <OutlinedInput
                  id="location-description"
                  value={newLocationType.description}
                  onChange={(e) => setNewLocationType({ ...newLocationType, description: e.target.value })}
                  label="Description"
                />
              </FormControl>
              <Button
                onClick={addLocationType}
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
                  {editMode ? "Update Location Type" : "Add Location Type"}
                </span>
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </Box>
  );
};

export default LocationTypesManager;
