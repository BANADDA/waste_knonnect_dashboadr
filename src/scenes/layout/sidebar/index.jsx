import {
  ContactsOutlined,
  DashboardOutlined,
  Delete,
  FactoryRounded,
  FolderSpecial,
  HelpOutlineOutlined,
  LocationCityRounded,
  LogoutRounded,
  MenuOutlined,
  PeopleAltOutlined,
  Reviews,
  Schedule,
  Subscriptions
} from "@mui/icons-material";
import { Avatar, Box, IconButton, Typography, useTheme } from "@mui/material";
import { signOut } from "firebase/auth"; // Firebase logout function
import { useContext, useState } from "react";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { ToggledContext } from "../../../App";
import { useAuthContext } from "../../../AuthContext"; // Import AuthContext for currentUser
import avatarPlaceholder from "../../../assets/images/avatar.png";
import logo from "../../../assets/images/logo.png";
import { auth } from "../../../config/firebaseConfig"; // Firebase config
import { tokens } from "../../../theme";
import Item from "./Item"; // Custom item component

const SideBar = () => {
  const { currentUser } = useAuthContext(); // Get the current logged-in user from AuthContext
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out successfully");
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Logout error:", error); // Log error if logout fails
    }
  };

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{
        border: 0,
        height: "100%",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ":hover": { background: "transparent" } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                alignItems="center"
                gap="12px"
                sx={{ transition: ".3s ease" }}
              >
                <img
                  style={{ width: "55px", height: "55px", borderRadius: "8px" }}
                  src={logo}
                  alt="Argon"
                />
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      {!collapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            mb: "25px",
          }}
        >
          <Avatar
            alt="avatar"
            src={currentUser?.photoURL || avatarPlaceholder}
            sx={{ width: "100px", height: "100px" }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" fontWeight="bold" color={colors.gray[100]}>
              {currentUser?.displayName || "Guest User"}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="500"
              color={colors.greenAccent[500]}
            >
              {currentUser?.role || "Super Admin"} {/* Dynamically display role */}
            </Typography>
          </Box>
        </Box>
      )}

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#868dfb",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          {/* Your Routes */}
          <Item
            title="Dashboard"
            path="/"
            colors={colors}
            icon={<DashboardOutlined />}
          />
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{ m: "15px 0 5px 20px", fontWeight: "600" }}
          >
            {!collapsed ? "Konnect Menu" : " "}
          </Typography>
          <Item
            title="Manage Team"
            path="/team"
            colors={colors}
            icon={<PeopleAltOutlined />}
          />
          <Item
            title="Add Customers"
            path="/add-customers"
            colors={colors}
            icon={<ContactsOutlined />}
          />
          <Item
            title="Location Types"
            path="/locations"
            colors={colors}
            icon={<LocationCityRounded />}
          />
          <Item
            title="Waste Categories"
            path="/waste-types"
            colors={colors}
            icon={<Delete />}
          />
          <Item
            title="Add Companies"
            path="/add-company"
            colors={colors}
            icon={<FactoryRounded />}
          />
          <Item
            title="Plans"
            path="/plans"
            colors={colors}
            icon={<FolderSpecial />}
          />
          <Item
            title="Subscriptions"
            path="/subscriptions"
            colors={colors}
            icon={<Subscriptions />}
          />
          <Item
            title="Schedules"
            path="/schedules"
            colors={colors}
            icon={<Schedule />}
          />
          <Item
            title="Reviews"
            path="/reviews"
            colors={colors}
            icon={<Reviews />}
          />
          <Item
            title="FAQ Page"
            path="/faq"
            colors={colors}
            icon={<HelpOutlineOutlined />}
          />
          {/* Logout */}
          <Item
            title="Logout"
            path="#"
            colors={colors}
            icon={<LogoutRounded />}
            onClick={handleLogout}
          />
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
