"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Container,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Snackbar,
  Pagination,
} from "@mui/material";
import {
  collection,
  query,
  getDocs,
  setDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { Attachment } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#191970",
    },
    secondary: {
      main: "#50E3C2",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [openIncrement, setOpenIncrement] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [lowStockAlert, setLowStockAlert] = useState(false);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [categories] = useState([
    "Produce",
    "Bakery",
    "Dairy",
    "Beverages",
    "Snacks",
  ]);

  // Fetch inventory from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  // Add item to inventory
  const addItem = async (item, quantity, category) => {
    if (!category) {
      // Ensure a category is selected
      alert("Please select a category for the item.");
      return;
    }

    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: currentQuantity + quantity, category });
    } else {
      await setDoc(docRef, { quantity, category });
    }

    await updateInventory();
  };

  // Increment item quantity
  const incrementItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity, category } = docSnap.data();
      await setDoc(docRef, { quantity: currentQuantity + quantity, category });
    }

    await updateInventory();
  };

  // Remove item from inventory
  const removeItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      if (currentQuantity <= quantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: currentQuantity - quantity });
      }
    }

    await updateInventory();
  };

  // Handle sorting
  const sortedInventory = () => {
    return [...inventory].sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return a.quantity - b.quantity;
      }
    });
  };

  // Handle pagination
  const paginatedInventory = () => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedInventory()
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(startIndex, startIndex + itemsPerPage);
  };

  // Handle low stock alert
  useEffect(() => {
    const lowStockItems = inventory.filter((item) => item.quantity < 5);
    setLowStockAlert(lowStockItems.length > 0);
  }, [inventory]);

  // Handle category change
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setItemName("");
    setItemQuantity(1);
    setCategory(""); // Reset category selection
  };
  const handleOpenRemove = (item) => {
    setSelectedItem(item);
    setOpenRemove(true);
  };
  const handleCloseRemove = () => setOpenRemove(false);
  const handleOpenIncrement = (item) => {
    setSelectedItem(item);
    setOpenIncrement(true);
  };
  const handleCloseIncrement = () => {
    setOpenIncrement(false);
    setItemQuantity(1); // Reset item quantity
  };
  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setOpenDetails(true);
  };
  const handleCloseDetails = () => setOpenDetails(false);
  const handleChangePage = (event, value) => setPage(value);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(315deg, rgba(101,0,94,1) 3%, rgba(60,132,206,1) 38%, rgba(48,238,226,1) 68%, rgba(255,25,25,1) 98%)",
          animation: "gradient 15s ease infinite",
          color: "#FFFFFF",
          padding: "2rem",
        }}
      >
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", color: "white" }}
            >
              Pantry Tracker
            </Typography>
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: 1,
                color: "#191970",
              }}
            />
          </Toolbar>
        </AppBar>

        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
          }}
        >
          <Box display="flex" justifyContent="center" mb={2} gap={2}>
            <Button
              variant="contained"
              onClick={handleOpenAdd}
              sx={{
                backgroundColor: "#191970",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#191970",
                },
              }}
            >Add New Item
            </Button>
            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              
              <InputLabel>Sort By</InputLabel>
            
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Sort By"
                sx={{ backgroundColor: "#FFFFFF", color: "#191970" }}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="quantity">Quantity</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Modal open={openAdd} onClose={handleCloseAdd}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="#F5F5F5"
              borderRadius={2}
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: "translate(-50%,-50%)",
                animation: "fadeIn 0.3s",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              <Typography variant="h6" textAlign="center" color="#191970">
                Add Item
              </Typography>
              <Stack width="100%" direction="column" spacing={2}>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                />
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(itemName, itemQuantity, category);
                    setItemName("");
                    setItemQuantity(1);
                    setCategory("");
                    handleCloseAdd();
                  }}
                  sx={{
                    backgroundColor: "#191970",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#357ABD",
                    },
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>

          <Modal open={openRemove} onClose={handleCloseRemove}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="#F5F5F5"
              borderRadius={2}
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: "translate(-50%,-50%)",
                animation: "fadeIn 0.3s",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              <Typography variant="h6" textAlign="center" color="#191970">
                Remove Item
              </Typography>
              <Stack width="100%" direction="column" spacing={2}>
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(selectedItem, itemQuantity);
                    setItemQuantity(1);
                    handleCloseRemove();
                  }}
                  sx={{
                    backgroundColor: "#191970",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#357ABD",
                    },
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          </Modal>

          <Modal open={openIncrement} onClose={handleCloseIncrement}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="#F5F5F5"
              borderRadius={2}
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: "translate(-50%,-50%)",
                animation: "fadeIn 0.3s",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              <Typography variant="h6" textAlign="center" color="#191970">
                Add Quantity
              </Typography>
              <Stack width="100%" direction="column" spacing={2}>
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    incrementItem(selectedItem, itemQuantity);
                    setItemQuantity(1);
                    handleCloseIncrement();
                  }}
                  sx={{
                    backgroundColor: "#191970",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#357ABD",
                    },
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>

          <Modal open={openDetails} onClose={handleCloseDetails}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="#F5F5F5"
              borderRadius={2}
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: "translate(-50%,-50%)",
                animation: "fadeIn 0.3s",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              <Typography variant="h6" textAlign="center" color="#191970">
                Item Details
              </Typography>
              {selectedItem && (
                <Stack width="100%" direction="column" spacing={2}>
                  <Typography variant="body1" color="#191970">
                    <strong>Name:</strong> {selectedItem.name}
                  </Typography>
                  <Typography variant="body1" color="#191970">
                    <strong>Quantity:</strong> {selectedItem.quantity}
                  </Typography>
                  <Typography variant="body1" color="#191970">
                    <strong>Category:</strong> {selectedItem.category}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleCloseDetails}
                    sx={{
                      backgroundColor: "#191970",
                      color: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#357ABD",
                      },
                    }}
                  >
                    Close
                  </Button>
                </Stack>
              )}
            </Box>
          </Modal>

          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            width="100%"
            alignItems="center"
          >
            {paginatedInventory().map(({ name, quantity, category }) => (
              <Card
                key={name}
                sx={{
                  width: "100%",
                  maxWidth: 600,
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  backgroundColor: "#F5F5F5",
                  "&:hover": { transform: "scale(1.02)" },
                  borderLeft: quantity < 5 ? "5px solid #FF4D4D" : "none", // Highlight low stock
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box display="flex" flexDirection="column">
                    <Typography
                      variant="h5"
                      component="div"
                      color="191970"
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        handleOpenDetails({ name, quantity, category })
                      }
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="#7B7B7B">
                      Quantity: {quantity}
                    </Typography>
                    <Typography variant="body2" color="#7B7B7B">
                      Category: {category}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() =>
                      handleOpenDetails({ name, quantity, category })
                    }
                  >
                    <EditIcon color="primary" />
                  </IconButton>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleOpenRemove(name)}
                    sx={{
                      backgroundColor: "191970",
                      color: "#FFFFFF",
                      marginRight: 1,
                      "&:hover": {
                        backgroundColor: "#357ABD",
                      },
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleOpenIncrement(name)}
                    sx={{
                      backgroundColor: "#191970",
                      color: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#357ABD",
                      },
                    }}
                  >
                    Add
                  </Button>
                </CardActions>
              </Card>
            ))}
            <Pagination
              count={Math.ceil(
                inventory.filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length / itemsPerPage
              )}
              page={page}
              onChange={handleChangePage}
              sx={{ mt: 2, color: "#FFFFFF" }}
            />
          </Box>
        </Container>

        <Snackbar
          open={lowStockAlert}
          autoHideDuration={6000}
          onClose={() => setLowStockAlert(false)}
        >
          <Alert
            onClose={() => setLowStockAlert(false)}
            severity="warning"
            sx={{ width: "100%" }}
          >
            Some items are low in stock!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
