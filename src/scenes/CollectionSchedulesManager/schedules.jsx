import { Box, Button, Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Modal, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '../../components';
import { db } from '../../config/firebaseConfig';

const CollectionSchedulesManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [users, setUsers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [specialPlans, setSpecialPlans] = useState([]); // To store special plans
    const [companies, setCompanies] = useState([]);
    const [newSchedule, setNewSchedule] = useState({
        userId: '',
        companyId: '',
        subscriptionType: 'Normal', // Default to Normal
        subscriptionId: '',
        collectionDay: null,
        collectionTime: null,
        status: 'scheduled', // Default status
    });
    const [editMode, setEditMode] = useState(false);
    const [currentScheduleId, setCurrentScheduleId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchSchedules();
        fetchUsers();
        fetchCompanies();
        fetchSubscriptions();
        fetchSpecialPlans(); // Fetch special plans separately
    }, []);

    const fetchCompanies = async () => {
        try {
            const companiesCollection = collection(db, 'companies');
            const companiesSnapshot = await getDocs(companiesCollection);
            const companiesList = companiesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCompanies(companiesList); // Assuming setCompanies is already defined
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchSchedules = async () => {
        const schedulesCollection = collection(db, 'collectionSchedules');
        const schedulesSnapshot = await getDocs(schedulesCollection);
        const schedulesList = schedulesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSchedules(schedulesList);
        console.log(schedulesList);
    };

    const fetchUsers = async () => {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setUsers(usersList);
    };

    const fetchSubscriptions = async () => {
        const subscriptionsCollection = collection(db, 'subscriptionTypes');
        const subscriptionsSnapshot = await getDocs(subscriptionsCollection);
        const subscriptionsList = subscriptionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSubscriptions(subscriptionsList);
    };

    const fetchSpecialPlans = async () => {
        const plansCollection = collection(db, 'specialPlans');
        const plansSnapshot = await getDocs(plansCollection);
        const plansList = plansSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSpecialPlans(plansList);
    };

    const addSchedule = async () => {
        if (newSchedule.userId && newSchedule.companyId && newSchedule.subscriptionId && newSchedule.collectionDay && newSchedule.collectionTime) {
            setLoading(true);
            try {
                if (editMode) {
                    const docRef = doc(db, 'collectionSchedules', currentScheduleId);
                    await updateDoc(docRef, newSchedule);
                    toast.success('Schedule updated successfully!');
                } else {
                    await addDoc(collection(db, 'collectionSchedules'), newSchedule);
                    toast.success('Schedule added successfully!');
                }
                resetForm();
                fetchSchedules();
                setLoading(false);
                setOpenModal(false); // Close modal
            } catch (error) {
                console.error('Error adding/updating schedule:', error);
                toast.error('Error adding or updating schedule. Please try again.');
                setLoading(false);
            }
        } else {
            toast.error('Please fill in all required fields!');
        }
    };

    const resetForm = () => {
        setNewSchedule({
            userId: '',
            companyId: '',
            subscriptionType: 'Normal', // Reset to default
            subscriptionId: '',
            collectionDay: null,
            collectionTime: null,
            status: 'scheduled',
        });
        setEditMode(false);
        setCurrentScheduleId(null);
    };

    const handleEdit = (schedule) => {
        setNewSchedule({
            ...schedule,
            collectionDay: dayjs(schedule.collectionDay), // Convert date string to dayjs object
            collectionTime: dayjs(schedule.collectionTime, 'HH:mm'),
        });
        setEditMode(true);
        setCurrentScheduleId(schedule.id);
        setOpenModal(true); // Open modal for editing
    };

    const handleDelete = async (id) => {
        const docRef = doc(db, 'collectionSchedules', id);
        await deleteDoc(docRef);
        fetchSchedules();
        toast.success('Schedule deleted successfully!');
    };

    const handleCompanyChange = (companyId) => {
        setNewSchedule({
            ...newSchedule,
            companyId,
            subscriptionType: 'Normal', // Reset to Normal when company changes
            subscriptionId: '', // Reset selected subscription
        });
    };

    const filterSubscriptionsByCompany = (companyId) => {
        return subscriptions.filter((sub) => sub.companyId === companyId);
    };

    const filterSpecialPlansByCompany = (companyId) => {
        return specialPlans.filter((plan) => plan.companyId === companyId);
    };

    return (
        <Box m="20px">
            <Header title="Collection Schedules Management" subtitle="Add or Manage Collection Schedules" />

            {/* Add Schedule Button */}
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add Schedule
            </Button>

            {/* Schedules Table */}
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table sx={{ border: '1px solid #ccc' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Schedule ID</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>User</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Company</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Subscription</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Collection Day</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Collection Time</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Status</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {schedule.id}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {users.find((user) => user.id === schedule.userId)?.name || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {companies.find((company) => company.id === schedule.companyId)?.name || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {subscriptions.find((sub) => sub.id === schedule.subscriptionId)?.subscriptionType || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {schedule.collectionDay ? dayjs(schedule.collectionDay).format('YYYY-MM-DD') : 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {schedule.collectionTime ? schedule.collectionTime : 'Invalid Time'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{schedule.status}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    <Button onClick={() => handleEdit(schedule)} color="primary">
                                        Edit
                                    </Button>
                                    <Button onClick={() => handleDelete(schedule.id)} color="secondary">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


            {/* Modal for Adding/Editing Schedule */}
            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-schedule-modal">
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
                        <CardHeader className="font-semibold text-lg">{editMode ? 'Edit Schedule' : 'Add New Schedule'}</CardHeader>
                        <CardContent>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel id="user-label">User</InputLabel>
                                <Select
                                    labelId="user-label"
                                    id="user-select"
                                    value={newSchedule.userId}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, userId: e.target.value })}
                                    label="User"
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel id="company-label">Company</InputLabel>
                                <Select
                                    labelId="company-label"
                                    id="company-select"
                                    value={newSchedule.companyId}
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
                                    value={newSchedule.subscriptionType}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, subscriptionType: e.target.value, subscriptionId: '' })} // Reset subscriptionId when type changes
                                    label="Subscription Type"
                                >
                                    <MenuItem value="Normal">Normal</MenuItem>
                                    <MenuItem value="Special">Special</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Conditionally show normal or special subscriptions */}
                            {newSchedule.subscriptionType === 'Normal' && (
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <InputLabel id="subscription-label">Subscription</InputLabel>
                                    <Select
                                        labelId="subscription-label"
                                        id="subscription-select"
                                        value={newSchedule.subscriptionId}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, subscriptionId: e.target.value })}
                                        label="Subscription"
                                    >
                                        {filterSubscriptionsByCompany(newSchedule.companyId).map((subscription) => (
                                            <MenuItem key={subscription.id} value={subscription.id}>
                                                {subscription.subscriptionType}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {newSchedule.subscriptionType === 'Special' && (
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <InputLabel id="special-plan-label">Special Plan</InputLabel>
                                    <Select
                                        labelId="special-plan-label"
                                        id="special-plan-select"
                                        value={newSchedule.subscriptionId}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, subscriptionId: e.target.value })}
                                        label="Special Plan"
                                    >
                                        {filterSpecialPlansByCompany(newSchedule.companyId).map((plan) => (
                                            <MenuItem key={plan.id} value={plan.id}>
                                                {plan.planName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <OutlinedInput
                                    id="collection-day"
                                    type="date"
                                    value={newSchedule.collectionDay}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, collectionDay: e.target.value })}
                                    label="Collection Day"
                                    inputProps={{
                                        min: dayjs(subscriptions.find(sub => sub.id === newSchedule.subscriptionId)?.startDate).format('YYYY-MM-DD'),
                                        max: dayjs(subscriptions.find(sub => sub.id === newSchedule.subscriptionId)?.endDate).format('YYYY-MM-DD'),
                                    }}
                                />
                            </FormControl>

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <OutlinedInput
                                    id="collection-time"
                                    type="time"
                                    value={newSchedule.collectionTime}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, collectionTime: e.target.value })}
                                    label="Collection Time"
                                    inputProps={{
                                        max: '16:00',
                                    }}
                                />
                            </FormControl>

                            <Button
                                onClick={addSchedule}
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
                                {editMode ? 'Update Schedule' : 'Add Schedule'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Modal>

            <ToastContainer />
        </Box>
    );
};

export default CollectionSchedulesManager;
