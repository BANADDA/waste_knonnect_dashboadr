import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '../../components';
import { db } from '../../config/firebaseConfig';
  
  const CollectionSchedulesManager = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      fetchSubscriptions();
      fetchUsers();
      fetchCompanies();
    }, []);
  
    const fetchCompanies = async () => {
      try {
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        const companiesList = companiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(companiesList);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
  
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
        const subscriptionsList = subscriptionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubscriptions(subscriptionsList);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };
  
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    const handleCancelSubscription = async (subscriptionId) => {
      try {
        setLoading(true);
        await updateDoc(doc(db, 'subscriptions', subscriptionId), { status: 'cancelled' });
        toast.success('Subscription cancelled successfully!');
        fetchSubscriptions();
        setLoading(false);
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Failed to cancel subscription.');
        setLoading(false);
      }
    };
  
    const getNextPickupDate = (dayOfWeek) => {
      const daysOfWeekMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
  
      const today = dayjs();
      const targetDayIndex = daysOfWeekMap[dayOfWeek];
  
      if (targetDayIndex === undefined) return 'Invalid Day';
  
      let nextPickup = today.day(targetDayIndex);
      if (nextPickup.isBefore(today, 'day')) {
        nextPickup = nextPickup.add(1, 'week');
      }
  
      return nextPickup.format('YYYY-MM-DD');
    };
  
    return (
      <Box m="20px">
        <Header title="Subscriptions Management" subtitle="Manage Subscriptions as in the App" />
  
        {/* Subscriptions Table */}
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
                <TableCell>Subscription ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Collection Day</TableCell>
                <TableCell>Collection Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Next Pickup</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Coordinates</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((subscription) => {
                const user = users.find((user) => user.id === subscription.userId);
                const company = companies.find((company) => company.id === subscription.companyId);
                const contactInfo = subscription.phoneNumber || 'N/A';
                const coordinates = subscription.location
                  ? `${subscription.location.latitude}, ${subscription.location.longitude}`
                  : 'N/A';
  
                return (
                  <TableRow key={subscription.id}>
                    <TableCell>{subscription.id}</TableCell>
                    <TableCell>{user ? user.name || user.email : 'N/A'}</TableCell>
                    <TableCell>{company ? company.name : 'N/A'}</TableCell>
                    <TableCell>{subscription.schedule?.day || 'N/A'}</TableCell>
                    <TableCell>{subscription.schedule?.time || 'N/A'}</TableCell>
                    <TableCell>{subscription.status}</TableCell>
                    <TableCell>{getNextPickupDate(subscription.schedule?.day)}</TableCell>
                    <TableCell>{contactInfo}</TableCell>
                    <TableCell>{coordinates}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        color="secondary"
                        disabled={subscription.status === 'cancelled'}
                      >
                        {subscription.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
  
        <ToastContainer />
      </Box>
    );
  };
  
  export default CollectionSchedulesManager;
  