import { DeleteForever } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from 'firebase/storage';
import { Edit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from "../../components";
import { db } from '../../config/firebaseConfig';

const WasteCompaniesManager = () => {
  const [companies, setCompanies] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [locationsOfOperation, setLocationsOfOperation] = useState([]);

  const [newCompany, setNewCompany] = useState({
    name: '',
    subtitle: '',
    email: '',
    phone: '',
    address: '',
    operationDays: [],
    wasteTypeIds: [],
    locationTypeIds: [],
    locationsOfOperationIds: [],
    subscriptionPeriod: '',
    originalPrice: '',
    discountedPrice: '',
    specialServices: [],
    imageUrl: '',
  });
  const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && acceptedFormats.includes(file.type)) {
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file); // Create URL for preview
      setNewCompany({ ...newCompany, imageUrl: fileUrl }); // Set image URL for preview
    } else {
      toast.error('Please upload a valid image file (jpeg, jpg, png, svg).');
    }
  };
  const [imageFile, setImageFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [loading, setLoading] = useState(false);

  const operationDaysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const specialServicesOptions = ['Hazardous Waste', 'Recycling', 'Bulk Pickup', 'Electronic Waste Disposal'];

  const locationOptions = [
    "Kampala Central",
    "Nakawa",
    "Rubaga",
    "Makindye",
    "Kawempe",
    "Ntinda",
    "Kololo",
    "Bugolobi",
    "Muyenga",
    // Add more areas as needed
  ];

  useEffect(() => {
    fetchCompanies();
    fetchWasteTypes();
    fetchLocationTypes();
    fetchLocationsOfOperation();
  }, []);

  const fetchCompanies = async () => {
    const companiesCollection = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesCollection);
    const companiesList = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCompanies(companiesList);
  };

  const fetchWasteTypes = async () => {
    const wasteTypesCollection = collection(db, 'wasteTypes');
    const wasteTypesSnapshot = await getDocs(wasteTypesCollection);
    const wasteTypesList = wasteTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWasteTypes(wasteTypesList);
  };

  const fetchLocationTypes = async () => {
    const locationTypesCollection = collection(db, 'locationTypes');
    const locationTypesSnapshot = await getDocs(locationTypesCollection);
    const locationTypesList = locationTypesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLocationTypes(locationTypesList);
  };

  const fetchLocationsOfOperation = async () => {
    const locationsCollection = collection(db, 'locationsOfOperation');
    const locationsSnapshot = await getDocs(locationsCollection);
    const locationsList = locationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLocationsOfOperation(locationsList);
  };

  const handleDropdownClose = (dropdown) => {
    // Handle dropdown close if necessary
  };

  const handleCompanySubmit = async () => {
    // Clean up undefined values in arrays
    const cleanOperationDays = newCompany.operationDays.filter(Boolean);
    const cleanSpecialServices = newCompany.specialServices.filter(Boolean);
    const cleanLocationTypeIds = newCompany.locationTypeIds.filter(Boolean);
    const cleanLocationsOfOperationIds = newCompany.locationsOfOperationIds.filter(Boolean);

    // Remove undefined fields from the newCompany object
    const companyData = Object.fromEntries(
      Object.entries({
        ...newCompany,
        operationDays: cleanOperationDays,
        specialServices: cleanSpecialServices,
        locationTypeIds: cleanLocationTypeIds,
        locationsOfOperationIds: cleanLocationsOfOperationIds,
      }).filter(([_, value]) => value !== undefined && value !== '')
    );

    if (companyData.name && companyData.operationDays.length > 0 && companyData.wasteTypeIds.length > 0) {
      setLoading(true);
      try {
        if (editMode) {
          const docRef = doc(db, 'companies', currentCompanyId);
          await updateDoc(docRef, companyData);
          toast.success('Company updated successfully!');
        } else {
          const companyRef = await addDoc(collection(db, 'companies'), companyData);

          const imageUrl = await uploadImage(companyRef.id);
          if (imageUrl) {
            await updateDoc(companyRef, { imageUrl });
            toast.success('Company added with image successfully!');
          } else {
            toast.success('Company added successfully without image.');
          }
        }

        setNewCompany({
          name: '',
          subtitle: '',
          email: '',
          phone: '',
          address: '',
          operationDays: [],
          wasteTypeIds: [],
          locationTypeIds: [],
          locationsOfOperationIds: [],
          subscriptionPeriod: '',
          originalPrice: '',
          discountedPrice: '',
          specialServices: [],
          imageUrl: '',
        });
        setImageFile(null);
        fetchCompanies();
        setLoading(false);
        setOpenModal(false);
      } catch (error) {
        console.error('Error adding/updating company:', error);
        toast.error('Error adding or updating company. Please try again.');
        setLoading(false);
      }
    } else {
      toast.error('Please fill in all required fields!');
    }
  };

  const handleEdit = (company) => {
    setNewCompany({
      name: company.name,
      subtitle: company.subtitle || '',
      email: company.email,
      phone: company.phone,
      address: company.address,
      operationDays: company.operationDays,
      wasteTypeIds: company.wasteTypeIds,
      locationTypeIds: company.locationTypeIds || [],
      locationsOfOperationIds: company.locationsOfOperationIds || [],
      subscriptionPeriod: company.subscriptionPeriod || '',
      originalPrice: company.originalPrice || '',
      discountedPrice: company.discountedPrice || '',
      specialServices: company.specialServices,
      imageUrl: company.imageUrl || '',
    });
    setEditMode(true);
    setCurrentCompanyId(company.id);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'companies', id);
    await deleteDoc(docRef);
    fetchCompanies();
    toast.success('Company deleted successfully!');
  };

  const handleOpenModal = () => {
    setEditMode(false);
    setNewCompany({
      name: '',
      subtitle: '',
      email: '',
      phone: '',
      address: '',
      operationDays: [],
      wasteTypeIds: [],
      locationTypeIds: [],
      locationsOfOperationIds: [],
      subscriptionPeriod: '',
      originalPrice: '',
      discountedPrice: '',
      specialServices: [],
      imageUrl: '',
    });
    setOpenModal(true);
  };

  const handleModalClose = () => setOpenModal(false);

  const uploadImage = async (companyId) => {
    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `companyImages/${companyId}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    }
    return null;
  };

  return (
    <Box m="20px">
      <Header title="Waste Collection Companies Management" subtitle="Add or Manage Waste Collection Companies" />

      {/* Add Company Button */}
      <Button sx={{ my: 2, color: "white", background: "darkGreen" }} variant="contained" color="primary" startIcon={<Plus />} onClick={handleOpenModal}>
        Add Company
      </Button>

      {/* Companies Table */}
      <TableContainer component={Paper}>
        <Table sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#4CAF50', color: '#ffffff' }}>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Name</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Subtitle</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Email</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Phone</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Address</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Operation Days</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Waste Types</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Location Types</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Locations of Operation</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Subscription Period</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Original Price</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Discounted Price</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Special Services</TableCell>
              <TableCell className="font-semibold" sx={{ border: '1px solid #ccc' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.name}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.subtitle || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.email || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.phone || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.address}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.operationDays.join(', ')}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {company.wasteTypeIds?.map(id => wasteTypes.find(w => w.id === id)?.name).join(', ') || '-'}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {company.locationTypeIds
                    ?.map(id => locationTypes.find(l => l.id === id)?.name)
                    .join(', ') || '-'}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  {company.locationsOfOperationIds
                    ?.map(id => locationsOfOperation.find(loc => loc.id === id)?.name)
                    .join(', ') || '-'}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.subscriptionPeriod || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.originalPrice || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.discountedPrice || '-'}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>{company.specialServices.join(', ')}</TableCell>
                <TableCell sx={{ border: '1px solid #ccc' }}>
                  <IconButton onClick={() => handleEdit(company)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(company.id)} color="secondary">
                    <DeleteForever sx={{ color: 'red' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Editing Company */}
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="add-company-modal"
        aria-describedby="add-or-edit-company"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          p={4}
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            width: 800,
      maxHeight: '90vh', 
      overflowY: 'auto',
            mx: 'auto',
            mt: '5%',
            boxShadow: 24,
            position: 'relative',
          }}
        >
          {/* Avatar Image Upload */}
          <Box
            sx={{
              width: '100%',
              height: 200,
              border: '2px dashed #B0B0B0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: '#F5F5F5',
              position: 'relative',
            }}
          >
            {newCompany.imageUrl ? (
              <img
                src={newCompany.imageUrl}
                alt="Uploaded"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <>
                <img src="src/assets/images/camera.png" alt="Upload" style={{ width: "auto", height: 100 }} />
                <p>Upload images</p>
                <small>Images with format of jpeg, jpg, png, and svg are acceptable</small>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/svg+xml"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
              onChange={handleImageUpload}
            />
          </Box>

          {/* Form Fields */}
          <FormControl fullWidth sx={{ m: 1 }}>
            <OutlinedInput
              id="company-name"
              placeholder="Company Name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            />
          </FormControl>

          {/* Subtitle Field */}
          <FormControl fullWidth sx={{ m: 1 }}>
            <OutlinedInput
              id="company-subtitle"
              placeholder="Company Motto"
              value={newCompany.subtitle}
              onChange={(e) => setNewCompany({ ...newCompany, subtitle: e.target.value })}
            />
          </FormControl>

          <Box display="flex" justifyContent="space-between" width="100%">
            <FormControl sx={{ width: '48%', mb: 2 }}>
              <OutlinedInput
                id="company-email"
                placeholder="Email"
                value={newCompany.email}
                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
              />
            </FormControl>
            <FormControl sx={{ width: '48%', mb: 2 }}>
              <OutlinedInput
                id="company-phone"
                placeholder="Phone Number"
                value={newCompany.phone}
                onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
              />
            </FormControl>
          </Box>
          <Box display="flex" justifyContent="space-between" width="100%">
            <FormControl sx={{ width: '48%', mb: 2 }}>
              <OutlinedInput
                id="company-address"
                placeholder="Physical Address"
                value={newCompany.address}
                onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
              />
            </FormControl>
            <FormControl sx={{ width: '48%', mb: 2 }}>
              <InputLabel id="operation-days-label">Operation Days</InputLabel>
              <Select
                labelId="operation-days-label"
                id="operation-days"
                multiple
                value={newCompany.operationDays}
                onChange={(e) => setNewCompany({ ...newCompany, operationDays: e.target.value })}
                renderValue={(selected) => selected.join(', ')}
              >
                {operationDaysOptions.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={newCompany.operationDays.indexOf(day) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
                <MenuItem>
                  <Button onClick={() => handleDropdownClose('Operation Days')}>
                    Done
                  </Button>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel id="waste-types-label">Waste Types</InputLabel>
            <Select
              labelId="waste-types-label"
              id="waste-types"
              multiple
              value={newCompany.wasteTypeIds}
              onChange={(e) => setNewCompany({ ...newCompany, wasteTypeIds: e.target.value })}
              renderValue={(selected) => selected
                .map(id => wasteTypes.find(w => w.id === id)?.name)
                .join(', ')
              }
            >
              {wasteTypes.map((wasteType) => (
                <MenuItem key={wasteType.id} value={wasteType.id}>
                  <Checkbox checked={newCompany.wasteTypeIds.indexOf(wasteType.id) > -1} />
                  <ListItemText primary={wasteType.name} />
                </MenuItem>
              ))}
              <MenuItem>
                <Button onClick={() => handleDropdownClose('Waste Types')}>
                  Done
                </Button>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Location Types */}
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel id="location-types-label">Location Types</InputLabel>
            <Select
              labelId="location-types-label"
              id="location-types"
              multiple
              value={newCompany.locationTypeIds}
              onChange={(e) => setNewCompany({ ...newCompany, locationTypeIds: e.target.value })}
              renderValue={(selected) => selected
                .map(id => locationTypes.find(l => l.id === id)?.name)
                .join(', ')
              }
            >
              {locationTypes.map((locationType) => (
                <MenuItem key={locationType.id} value={locationType.id}>
                  <Checkbox checked={newCompany.locationTypeIds.indexOf(locationType.id) > -1} />
                  <ListItemText primary={locationType.name} />
                </MenuItem>
              ))}
              <MenuItem>
                <Button onClick={() => handleDropdownClose('Location Types')}>
                  Done
                </Button>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Locations of Operation */}
          <FormControl fullWidth sx={{ m: 1 }}>
  <InputLabel id="locations-of-operation-label">Locations of Operation</InputLabel>
  <Select
    labelId="locations-of-operation-label"
    id="locations-of-operation"
    multiple // Remove this if you only want single selection
    value={newCompany.locationsOfOperation || []}
    onChange={(e) => setNewCompany({ ...newCompany, locationsOfOperation: e.target.value })}
    renderValue={(selected) => selected.join(', ')}
    label="Locations of Operation"
  >
    {locationOptions.map((location) => (
      <MenuItem key={location} value={location}>
        <Checkbox checked={newCompany.locationsOfOperation?.includes(location)} />
        <ListItemText primary={location} />
      </MenuItem>
    ))}
  </Select>
</FormControl>

          {/* Subscription Period */}
          <FormControl fullWidth sx={{ m: 1 }}>
  <InputLabel id="subscription-period-label">Subscription Period</InputLabel>
  <Select
    labelId="subscription-period-label"
    id="subscription-period"
    value={newCompany.subscriptionPeriod || ''} // Add subscriptionPeriod in newCompany object
    onChange={(e) => setNewCompany({ ...newCompany, subscriptionPeriod: e.target.value })}
    label="Subscription Period"
  >
    {/* Options for Subscription Period */}
    <MenuItem value="Monthly">Monthly</MenuItem>
    <MenuItem value="Quarterly">Quarterly</MenuItem>
    <MenuItem value="Yearly">Yearly</MenuItem>
  </Select>
</FormControl>

          {/* Original Price */}
          <FormControl fullWidth sx={{ m: 1 }}>
            <OutlinedInput
              id="original-price"
              placeholder="Original Price"
              type="number"
              value={newCompany.originalPrice}
              onChange={(e) => setNewCompany({ ...newCompany, originalPrice: e.target.value })}
            />
          </FormControl>

          {/* Discounted Price */}
          <FormControl fullWidth sx={{ m: 1 }}>
            <OutlinedInput
              id="discounted-price"
              placeholder="Discounted Price"
              type="number"
              value={newCompany.discountedPrice}
              onChange={(e) => setNewCompany({ ...newCompany, discountedPrice: e.target.value })}
            />
          </FormControl>

          {/* Special Services */}
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel id="special-services-label">Special Services</InputLabel>
            <Select
              labelId="special-services-label"
              id="special-services"
              multiple
              value={newCompany.specialServices}
              onChange={(e) => setNewCompany({ ...newCompany, specialServices: e.target.value })}
              renderValue={(selected) => selected.join(', ')}
            >
              {specialServicesOptions.map((service) => (
                <MenuItem key={service} value={service}>
                  <Checkbox checked={newCompany.specialServices.indexOf(service) > -1} />
                  <ListItemText primary={service} />
                </MenuItem>
              ))}
              <MenuItem>
                <Button onClick={() => handleDropdownClose('Special Services')}>
                  Done
                </Button>
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: 'green', color: 'white', marginTop: 2 }}
            onClick={handleCompanySubmit}
            disabled={loading}
          >
            {editMode ? 'Update Company' : 'Add Company'}
          </Button>
        </Box>
      </Modal>

      <ToastContainer />
    </Box>
  );
};

export default WasteCompaniesManager;
