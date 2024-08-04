'use client'

// Import necessary dependencies
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  IconButton,
  Grid,
  Paper
} from '@mui/material'
import {
  Search,
  Add,
  Remove,
  CloudUpload,
  BluetoothConnectedOutlined // Note: This icon is imported but not used in the component
} from '@mui/icons-material'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Style configuration for the modal
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
}

export default function Home () {
  // State management using hooks
  const [inventory, setInventory] = useState([]) // Stores the list of inventory items
  const [open, setOpen] = useState(false) // Controls the visibility of the "Add Item" modal
  const [itemName, setItemName] = useState('') // Stores the name of the new item being added
  const [itemImage, setItemImage] = useState(null) // Stores the image of the new item being added
  const [searchTerm, setSearchTerm] = useState('') // Stores the current search term for filtering inventory

  // Function to fetch and update the inventory from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setInventory(inventoryList)
  }

  // Function to add a new item to the inventory
  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      // If the item exists, increment its quantity
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, image: itemImage })
    } else {
      // If the item doesn't exist, create a new document with quantity 1
      await setDoc(docRef, { quantity: 1, image: itemImage })
    }

    await updateInventory()
    handleClose()
  }

  // Function to remove an item from the inventory
  const removeItem = async item => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        // If quantity is 1, remove the item completely
        await deleteDoc(docRef)
      } else {
        // If quantity is more than 1, decrement it
        await setDoc(docRef, { ...docSnap.data(), quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }

  // Effect hook to fetch inventory data when the component mounts
  useEffect(() => {
    updateInventory()
  }, [])

  // Handler functions for the modal
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemImage(null)
  }

  // Function to handle image upload
  const handleImageUpload = e => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      setItemImage(reader.result)
    }
    if (file) {
      reader.readAsDataURL(file)
    }
  }

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Prepare data for the chart
  const chartData = inventory.map(item => ({
    name: item.id,
    quantity: item.quantity
  }))

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      {/* Dashboard Title */}
      <Typography
        variant='h4'
        gutterBottom
        sx={{
          backgroundColor: '#1976d2',
          borderRadius: '20px',
          color: 'white',
          p: 3
        }}
      >
        Inventory Management Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Chart Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '50%' }}>
            <Typography variant='h5' gutterBottom>
              Inventory Distribution
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='quantity' stroke='#8884d8' />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Inventory List Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant='h5' gutterBottom>
              Inventory Overview
            </Typography>
            {/* Search Input */}
            <TextField
              fullWidth
              variant='outlined'
              placeholder='Search inventory...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            {/* Add New Item Button */}
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={handleOpen}
              sx={{ mb: 2 }}
            >
              Add New Item
            </Button>
            {/* Inventory Items List */}
            <Stack spacing={2}>
              {filteredInventory.map(({ id, quantity, image }) => (
                <Card key={id}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Item Image */}
                    {image && (
                      <Box
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          mr: 2
                        }}
                      >
                        <Image
                          src={image}
                          alt={id}
                          layout='fill'
                          objectFit='contain'
                        />
                      </Box>
                    )}
                    {/* Item Name */}
                    <Typography variant='h6'>{id}</Typography>
                    {/* Item Quantity */}
                    <Typography variant='subtitle1'>
                      Quantity: {quantity}
                    </Typography>
                    {/* Remove Item Button */}
                    <Button
                      variant='outlined'
                      startIcon={<Remove />}
                      onClick={() => removeItem(id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Add New Item Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography
            id='modal-modal-title'
            variant='h6'
            component='h2'
            gutterBottom
          >
            Add New Item
          </Typography>
          {/* Item Name Input */}
          <TextField
            fullWidth
            label='Item Name'
            variant='outlined'
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {/* Image Upload Input */}
          <input
            accept='image/*'
            style={{ display: 'none' }}
            id='raised-button-file'
            type='file'
            onChange={handleImageUpload}
          />
          <label htmlFor='raised-button-file'>
            <Button
              variant='outlined'
              component='span'
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Image
            </Button>
          </label>
          {/* Image Preview */}
          {itemImage && (
            <Box
              sx={{ mb: 2, position: 'relative', width: '100%', height: 200 }}
            >
              <Image
                src={itemImage}
                alt='Preview'
                layout='fill'
                objectFit='contain'
              />
            </Box>
          )}
          {/* Add Item Button */}
          <Button variant='contained' onClick={addItem} fullWidth>
            Add Item
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}
