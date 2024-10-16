import { Box, Button, Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '../../components';
import { db } from '../../config/firebaseConfig';

const SubscriptionsManager = () => {
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]); // Filtered plans based on the selected company
    const [newSubscriptionType, setNewSubscriptionType] = useState({
        companyId: '',
        subscriptionType: 'Normal', // Default to Normal
        planId: '',
        startDate: '',
        endDate: '',
        status: 'active',
    });
    const [editMode, setEditMode] = useState(false);
    const [currentSubscriptionTypeId, setCurrentSubscriptionTypeId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchSubscriptionTypes();
        fetchCompanies();
        fetchPlans();
    }, []);

    const fetchSubscriptionTypes = async () => {
        const subscriptionTypesCollection = collection(db, 'subscriptionTypes');
        const subscriptionTypesSnapshot = await getDocs(subscriptionTypesCollection);
        const subscriptionTypesList = subscriptionTypesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSubscriptionTypes(subscriptionTypesList);
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

    const fetchPlans = async () => {
        const plansCollection = collection(db, 'specialPlans');
        const plansSnapshot = await getDocs(plansCollection);
        const plansList = plansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setPlans(plansList);
    };

    const addSubscriptionType = async () => {
        if (newSubscriptionType.companyId && newSubscriptionType.startDate && newSubscriptionType.endDate) {
            setLoading(true);
            try {
                if (editMode) {
                    const docRef = doc(db, 'subscriptionTypes', currentSubscriptionTypeId);
                    await updateDoc(docRef, newSubscriptionType);
                    toast.success('Subscription Type updated successfully!');
                } else {
                    await addDoc(collection(db, 'subscriptionTypes'), newSubscriptionType);
                    toast.success('Subscription Type added successfully!');
                }
                resetForm();
                fetchSubscriptionTypes();
                setLoading(false);
                setOpenModal(false); // Close modal
            } catch (error) {
                console.error('Error adding/updating subscription type:', error);
                toast.error('Error adding or updating subscription type. Please try again.');
                setLoading(false);
            }
        } else {
            toast.error('Please fill in all required fields!');
        }
    };

    const resetForm = () => {
        setNewSubscriptionType({
            companyId: '',
            subscriptionType: 'Normal',
            planId: '',
            startDate: '',
            endDate: '',
            status: 'active',
        });
        setEditMode(false);
        setCurrentSubscriptionTypeId(null);
    };

    const handleCompanyChange = (companyId) => {
        setNewSubscriptionType({ ...newSubscriptionType, companyId });

        // Filter plans based on the selected company
        const filtered = plans.filter(plan => plan.companyId === companyId);
        setFilteredPlans(filtered);
    };

    const handleEdit = (subscriptionType) => {
        setNewSubscriptionType(subscriptionType);
        setEditMode(true);
        setCurrentSubscriptionTypeId(subscriptionType.id);
        setOpenModal(true); // Open modal for editing
    };

    const handleDelete = async (id) => {
        const docRef = doc(db, 'subscriptionTypes', id);
        await deleteDoc(docRef);
        fetchSubscriptionTypes();
        toast.success('Subscription Type deleted successfully!');
    };

    return (
        <Box m="20px">
            <Header title="Subscription Types Management" subtitle="Add or Manage Subscription Types" />

            {/* Add Subscription Type Button */}
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add Subscription Type
            </Button>

            {/* Subscription Types Table */}
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table sx={{ border: '1px solid #ccc' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Company</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Type</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Plan</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Start Date</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>End Date</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Status</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subscriptionTypes.map((subscriptionType) => (
                            <TableRow key={subscriptionType.id}>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {companies.find((c) => c.id === subscriptionType.companyId)?.name || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{subscriptionType.subscriptionType}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {subscriptionType.subscriptionType === 'Special' && subscriptionType.planId
                                        ? plans.find((p) => p.id === subscriptionType.planId)?.planName || 'N/A'
                                        : 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{dayjs(subscriptionType.startDate).format('YYYY-MM-DD')}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{dayjs(subscriptionType.endDate).format('YYYY-MM-DD')}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{subscriptionType.status}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    <Button onClick={() => handleEdit(subscriptionType)} color="primary">
                                        Edit
                                    </Button>
                                    <Button onClick={() => handleDelete(subscriptionType.id)} color="secondary">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal for Adding/Editing Subscription Type */}
            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-subscription-type-modal">
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
                    <Card sx={{ width: '100%' }}>
                        <CardHeader title={editMode ? 'Edit Subscription Type' : 'Add New Subscription Type'} />
                        <CardContent>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel id="company-label">Company</InputLabel>
                                <Select
                                    labelId="company-label"
                                    id="company-select"
                                    value={newSubscriptionType.companyId}
                                    onChange={(e) => handleCompanyChange(e.target.value)}
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
                                <InputLabel id="subscription-type-label">Subscription Type</InputLabel>
                                <Select
                                    labelId="subscription-type-label"
                                    id="subscription-type-select"
                                    value={newSubscriptionType.subscriptionType}
                                    onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, subscriptionType: e.target.value })}
                                    label="Subscription Type"
                                >
                                    <MenuItem value="Normal">Normal</MenuItem>
                                    <MenuItem value="Special">Special</MenuItem>
                                </Select>
                            </FormControl>

                            {newSubscriptionType.subscriptionType === 'Special' && (
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <InputLabel id="plan-label">Plan</InputLabel>
                                    <Select
                                        labelId="plan-label"
                                        id="plan-select"
                                        value={newSubscriptionType.planId}
                                        onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, planId: e.target.value })}
                                        label="Plan"
                                    >
                                        {filteredPlans.map((plan) => (
                                            <MenuItem key={plan.id} value={plan.id}>
                                                {plan.planName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <TextField
                                    label="Start Date"
                                    id="start-date"
                                    type="date"
                                    value={newSubscriptionType.startDate}
                                    onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, startDate: e.target.value })}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </FormControl>

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <TextField
                                    label="End Date"
                                    id="end-date"
                                    type="date"
                                    value={newSubscriptionType.endDate}
                                    onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, endDate: e.target.value })}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </FormControl>

                            <Button
                                onClick={addSubscriptionType}
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
                                {editMode ? 'Update Subscription Type' : 'Add Subscription Type'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Modal>

            <ToastContainer />
        </Box>
    );
};

export default SubscriptionsManager;
