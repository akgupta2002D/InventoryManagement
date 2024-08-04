'use client'

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
import { Search, Add, Remove, CloudUpload } from '@mui/icons-material'
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
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemImage, setItemImage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setInventory(inventoryList)
  }

  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, image: itemImage })
    } else {
      await setDoc(docRef, { quantity: 1, image: itemImage })
    }

    await updateInventory()
    handleClose()
  }

  const removeItem = async item => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { ...docSnap.data(), quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemImage(null)
  }

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

  const filteredInventory = inventory.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const chartData = inventory.map(item => ({
    name: item.id,
    quantity: item.quantity
  }))

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant='h3' gutterBottom>
        Inventory Management Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant='h5' gutterBottom>
              Inventory Overview
            </Typography>
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
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={handleOpen}
              sx={{ mb: 2 }}
            >
              Add New Item
            </Button>
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
                    <Typography variant='h6'>{id}</Typography>
                    <Typography variant='subtitle1'>
                      Quantity: {quantity}
                    </Typography>
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
      </Grid>

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
          <TextField
            fullWidth
            label='Item Name'
            variant='outlined'
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            sx={{ mb: 2 }}
          />
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
          <Button variant='contained' onClick={addItem} fullWidth>
            Add Item
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}
