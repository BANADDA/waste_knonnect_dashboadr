import { Box, Button, Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '../../components';
import { db } from '../../config/firebaseConfig';

const ReviewManager = () => {
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [newReview, setNewReview] = useState({
        userId: '',
        companyId: '',
        scheduleId: '',
        rating: 0,
        comment: '',
        date: null,
    });
    const [editMode, setEditMode] = useState(false);
    const [currentReviewId, setCurrentReviewId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchReviews();
        fetchUsers();
        fetchCompanies();
        fetchSchedules();
    }, []);

    const fetchReviews = async () => {
        const reviewsCollection = collection(db, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        const reviewsList = reviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setReviews(reviewsList);
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

    const fetchCompanies = async () => {
        const companiesCollection = collection(db, 'companies');
        const companiesSnapshot = await getDocs(companiesCollection);
        const companiesList = companiesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setCompanies(companiesList);
    };

    const fetchSchedules = async () => {
        const schedulesCollection = collection(db, 'collectionSchedules');
        const schedulesSnapshot = await getDocs(schedulesCollection);
        const schedulesList = schedulesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSchedules(schedulesList);
    };

    const addReview = async () => {
        if (newReview.userId && newReview.companyId && newReview.scheduleId && newReview.rating && newReview.comment) {
            setLoading(true);
            try {
                const reviewData = { ...newReview, date: new Date() };
                if (editMode) {
                    const docRef = doc(db, 'reviews', currentReviewId);
                    await updateDoc(docRef, reviewData);
                    toast.success('Review updated successfully!');
                } else {
                    await addDoc(collection(db, 'reviews'), reviewData);
                    toast.success('Review added successfully!');
                }
                resetForm();
                fetchReviews();
                setLoading(false);
                setOpenModal(false); // Close modal
            } catch (error) {
                console.error('Error adding/updating review:', error);
                toast.error('Error adding or updating review. Please try again.');
                setLoading(false);
            }
        } else {
            toast.error('Please fill in all required fields!');
        }
    };

    const resetForm = () => {
        setNewReview({
            userId: '',
            companyId: '',
            scheduleId: '',
            rating: 0,
            comment: '',
            date: null,
        });
        setEditMode(false);
        setCurrentReviewId(null);
    };

    const handleEdit = (review) => {
        setNewReview(review);
        setEditMode(true);
        setCurrentReviewId(review.id);
        setOpenModal(true); // Open modal for editing
    };

    const handleDelete = async (id) => {
        const docRef = doc(db, 'reviews', id);
        await deleteDoc(docRef);
        fetchReviews();
        toast.success('Review deleted successfully!');
    };

    return (
        <Box m="20px">
            <Header title="Reviews Management" subtitle="Add or Manage Reviews" />

            {/* Add Review Button */}
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add Review
            </Button>

            {/* Reviews Table */}
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table sx={{ border: '1px solid #ccc' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
                            <TableCell sx={{ border: '1px solid #ccc' }}>User</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Company</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Schedule ID</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Rating</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Comment</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Date</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {users.find((user) => user.id === review.userId)?.name || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {companies.find((company) => company.id === review.companyId)?.name || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {review.scheduleId || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{review.rating}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>{review.comment}</TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    {dayjs(review.date.toDate()).format('YYYY-MM-DD')}
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #ccc' }}>
                                    <Button onClick={() => handleEdit(review)} color="primary">
                                        Edit
                                    </Button>
                                    <Button onClick={() => handleDelete(review.id)} color="secondary">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal for Adding/Editing Review */}
            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-review-modal">
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
                        <CardHeader className="font-semibold text-lg">{editMode ? 'Edit Review' : 'Add New Review'}</CardHeader>
                        <CardContent>
                            <FormControl fullWidth sx={{ m: 1 }}>
                                <InputLabel id="user-label">User</InputLabel>
                                <Select
                                    labelId="user-label"
                                    id="user-select"
                                    value={newReview.userId}
                                    onChange={(e) => setNewReview({ ...newReview, userId: e.target.value })}
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
                                    value={newReview.companyId}
                                    onChange={(e) => setNewReview({ ...newReview, companyId: e.target.value })}
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
                                <InputLabel id="schedule-label">Schedule</InputLabel>
                                <Select
                                    labelId="schedule-label"
                                    id="schedule-select"
                                    value={newReview.scheduleId}
                                    onChange={(e) => setNewReview({ ...newReview, scheduleId: e.target.value })}
                                    label="Schedule"
                                >
                                    {schedules.map((schedule) => (
                                        <MenuItem key={schedule.id} value={schedule.id}>
                                            {schedule.id}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <TextField
                                    id="rating"
                                    type="number"
                                    label="Rating"
                                    value={newReview.rating}
                                    onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                                    inputProps={{ min: 0, max: 5 }}
                                />
                            </FormControl>

                            <FormControl fullWidth sx={{ m: 1 }}>
                                <TextField
                                    id="comment"
                                    label="Comment"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    multiline
                                    rows={4}
                                />
                            </FormControl>

                            <Button
                                onClick={addReview}
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
                                {editMode ? 'Update Review' : 'Add Review'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Modal>

            <ToastContainer />
        </Box>
    );
};

export default ReviewManager;
