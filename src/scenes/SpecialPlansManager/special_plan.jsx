import { Box, Button, Card, CardContent, CardHeader, FormControl, IconButton, InputLabel, MenuItem, Modal, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Delete, Edit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '../../components';
import { db } from '../../config/firebaseConfig';

const SpecialPlansManager = () => {
  const [plans, setPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]); // Vehicle types data
  const [companies, setCompanies] = useState([]);
  const [newPlan, setNewPlan] = useState({
    planName: '',
    companyId: '',
    planDescription: '',
    planDuration: '',
    planPrice: '',
    servicesIncluded: [],
    eligibilityCriteria: '',
    vehicleTypes: [],
    discount: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const servicesOptions = ['Recycling', 'Paper Disposal', 'Hazardous Waste', 'Chemical Disposal']; // Example services
  const vehicleOptions = ['Truck', 'Van', 'Specialized Hazardous Waste Vehicle']; // Vehicle options

  useEffect(() => {
    fetchPlans();
    fetchCompanies();
    fetchVehicleTypes();
  }, []);

  const fetchPlans = async () => {
    const plansCollection = collection(db, 'specialPlans');
    const plansSnapshot = await getDocs(plansCollection);
    const plansList = plansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPlans(plansList);
  };

  const fetchCompanies = async () => {
    const companiesCollection = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesCollection);
    const companiesList = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCompanies(companiesList);
  };

  const fetchVehicleTypes = async () => {
    // Assuming vehicles are stored in Firestore. If they are fixed, skip Firestore and use static options.
    const vehiclesCollection = collection(db, 'vehicles');
    const vehiclesSnapshot = await getDocs(vehiclesCollection);
    const vehiclesList = vehiclesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVehicles(vehiclesList);
  };

  const addPlan = async () => {
    if (newPlan.planName && newPlan.companyId && newPlan.vehicleTypes.length > 0 && newPlan.servicesIncluded.length > 0) {
      setLoading(true);
      try {
        if (editMode) {
          const docRef = doc(db, 'specialPlans', currentPlanId);
          await updateDoc(docRef, newPlan);
          toast.success('Plan updated successfully!');
        } else {
          await addDoc(collection(db, 'specialPlans'), newPlan);
          toast.success('Plan added successfully!');
        }
        resetForm();
        fetchPlans();
        setLoading(false);
        setOpenModal(false); // Close modal
      } catch (error) {
        console.error('Error adding/updating plan:', error);
        toast.error('Error adding or updating plan. Please try again.');
        setLoading(false);
      }
    } else {
      toast.error('Please fill in all required fields!');
    }
  };

  const resetForm = () => {
    setNewPlan({
      planName: '',
      companyId: '',
      planDescription: '',
      planDuration: '',
      planPrice: '',
      servicesIncluded: [],
      eligibilityCriteria: '',
      vehicleTypes: [],
      discount: '',
    });
    setEditMode(false);
    setCurrentPlanId(null);
  };

  const handleEdit = (plan) => {
    setNewPlan(plan);
    setEditMode(true);
    setCurrentPlanId(plan.id);
    setOpenModal(true); // Open modal for editing
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'specialPlans', id);
    await deleteDoc(docRef);
    fetchPlans();
    toast.success('Plan deleted successfully!');
  };

  return (
    <Box m="20px">
      <Header title="Special Plans Management" subtitle="Add or Manage Special Plans" />

      {/* Add Plan Button */}
      <Button variant="contained" color="primary" startIcon={<Plus />} onClick={() => setOpenModal(true)}>
        Add Plan
      </Button>

      {/* Plans Table */}
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
              <TableCell sx={{ border: '1px solid #ccc' }}>Plan Name</TableCell>
              <TableCell sx={{ border: '1px solid #ccc' }}>Company</TableCell>
              <TableCell sx={{ border: '1px solid #ccc' }}>Price</TableCell>
              <TableCell sx={{ border: '1px solid #ccc' }}>Services</TableCell>
              <TableCell sx={{ border: '1px solid #ccc' }}>Vehicles</TableCell>
              <TableCell sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell sx={{ border: '1px solid #ccc' }}>{plan.planName}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {companies.find((c) => c.id === plan.companyId)?.name || 'N/A'}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>${plan.planPrice}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{plan.servicesIncluded.join(', ')}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{plan.vehicleTypes.join(', ')}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <IconButton onClick={() => handleEdit(plan)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(plan.id)} color="secondary">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Editing Plan */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-plan-modal">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
        //   p={4}
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
            <CardHeader className="font-semibold text-lg">
              {editMode ? "Edit Special Plan" : "Add New Special Plan"}
            </CardHeader>
            <CardContent>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="plan-name">Plan Name</InputLabel>
                <OutlinedInput
                  id="plan-name"
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                  label="Plan Name"
                />
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="company-label">Company</InputLabel>
                <Select
                  labelId="company-label"
                  id="company-select"
                  value={newPlan.companyId}
                  onChange={(e) => setNewPlan({ ...newPlan, companyId: e.target.value })}
                  label="Company"
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="plan-price">Price</InputLabel>
                <OutlinedInput
                  id="plan-price"
                  type="number"
                  value={newPlan.planPrice}
                  onChange={(e) => setNewPlan({ ...newPlan, planPrice: e.target.value })}
                  label="Price"
                />
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="services-label">Services Included</InputLabel>
                <Select
                  labelId="services-label"
                  id="services-select"
                  multiple
                  value={newPlan.servicesIncluded}
                  onChange={(e) => setNewPlan({ ...newPlan, servicesIncluded: e.target.value })}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {servicesOptions.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="vehicle-label">Vehicle Types</InputLabel>
                <Select
                  labelId="vehicle-label"
                  id="vehicle-select"
                  multiple
                  value={newPlan.vehicleTypes}
                  onChange={(e) => setNewPlan({ ...newPlan, vehicleTypes: e.target.value })}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {vehicleOptions.map((vehicle) => (
                    <MenuItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="plan-description">Description</InputLabel>
                <OutlinedInput
                  id="plan-description"
                  value={newPlan.planDescription}
                  onChange={(e) => setNewPlan({ ...newPlan, planDescription: e.target.value })}
                  label="Description"
                />
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="plan-duration">Duration</InputLabel>
                <OutlinedInput
                  id="plan-duration"
                  value={newPlan.planDuration}
                  onChange={(e) => setNewPlan({ ...newPlan, planDuration: e.target.value })}
                  label="Duration"
                />
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="plan-discount">Discount</InputLabel>
                <OutlinedInput
                  id="plan-discount"
                  type="number"
                  value={newPlan.discount}
                  onChange={(e) => setNewPlan({ ...newPlan, discount: e.target.value })}
                  label="Discount"
                />
              </FormControl>

              <Button
                onClick={addPlan}
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
                {editMode ? "Update Plan" : "Add Plan"}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Modal>

      <ToastContainer />
    </Box>
  );
};

export default SpecialPlansManager;
