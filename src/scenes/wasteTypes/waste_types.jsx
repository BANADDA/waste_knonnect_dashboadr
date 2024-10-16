import { DeleteForever } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, FormControl, IconButton, InputLabel, Modal, OutlinedInput, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Edit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Header } from "../../components";
import { db } from '../../config/firebaseConfig';

const WasteTypesManager = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [newWasteType, setNewWasteType] = useState({ name: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentWasteTypeId, setCurrentWasteTypeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false); // Control for modal

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  const fetchWasteTypes = async () => {
    const wasteTypesCollection = collection(db, 'wasteTypes');
    const wasteTypesSnapshot = await getDocs(wasteTypesCollection);
    const wasteTypesList = wasteTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setWasteTypes(wasteTypesList);
  };

  const addWasteType = async () => {
    if (newWasteType.name && newWasteType.description) {
      setLoading(true);
      if (editMode) {
        const docRef = doc(db, 'wasteTypes', currentWasteTypeId);
        await updateDoc(docRef, newWasteType);
        setEditMode(false);
        setCurrentWasteTypeId(null);
      } else {
        await addDoc(collection(db, 'wasteTypes'), newWasteType);
      }
      setNewWasteType({ name: '', description: '' });
      fetchWasteTypes();
      setLoading(false);
      handleCloseModal(); // Close the modal after saving
    }
  };

  const handleEdit = (wasteType) => {
    setNewWasteType({ name: wasteType.name, description: wasteType.description });
    setEditMode(true);
    setCurrentWasteTypeId(wasteType.id);
    setOpenModal(true); // Open modal for editing
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'wasteTypes', id);
    await deleteDoc(docRef);
    fetchWasteTypes();
  };

  const handleOpenModal = () => {
    setEditMode(false);
    setNewWasteType({ name: '', description: '' });
    setOpenModal(true); // Open modal for adding new waste type
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close modal
  };

  return (
    <Box m="20px">
      <Header title="Waste Types Management" subtitle="Add or Manage Waste Types" />

      {/* Add New Waste Type Button */}
      <Button variant="contained" color="primary" startIcon={<Plus />} onClick={handleOpenModal}>
        Add Waste Type
      </Button>

      {/* Waste Types Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Waste Type Name</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Description</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wasteTypes.map((wasteType) => (
              <TableRow key={wasteType.id}>
                <TableCell sx={{ border: '1px solid #ccc' }}>{wasteType.name}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{wasteType.description}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <IconButton onClick={() => handleEdit(wasteType)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(wasteType.id)} sx={{ color: "red" }}>
                    <DeleteForever />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Editing Waste Type */}
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
          <Card className="bg-white shadow-md mb-4" sx={{ width: '100%' }}>
            <CardHeader className="font-semibold text-lg">
              {editMode ? "Edit Waste Type" : "Add New Waste Type"}
            </CardHeader>
            <CardContent>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="waste-name">Waste Type Name</InputLabel>
                <OutlinedInput
                  id="waste-name"
                  value={newWasteType.name}
                  onChange={(e) => setNewWasteType({ ...newWasteType, name: e.target.value })}
                  label="Waste Type Name"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="waste-description">Description</InputLabel>
                <OutlinedInput
                  id="waste-description"
                  value={newWasteType.description}
                  onChange={(e) => setNewWasteType({ ...newWasteType, description: e.target.value })}
                  label="Description"
                />
              </FormControl>
              <Button
                onClick={addWasteType}
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
                  {editMode ? "Update Waste Type" : "Add Waste Type"}
                </span>
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </Box>
  );
};

export default WasteTypesManager;
