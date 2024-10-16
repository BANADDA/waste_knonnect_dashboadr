import {
  CarRentalRounded,
  DownloadOutlined,
  LocationCity,
  RecyclingRounded,
  VerifiedUserSharp
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Header,
  StatBox
} from "../../components";
import DonutChart from "../../components/BarChart";
import BarSubChart from "../../components/LineChart";
import SubscriptionPieChart from "../../components/mapline";
import { mockSubscriptions } from "../../data/mockData";
import { tokens } from "../../theme";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const isXsDevices = useMediaQuery("(max-width: 436px)");
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between">
        <Header title="WASTE KONNECT" subtitle="Welcome to waste konnect dashboard" />
        {!isXsDevices && (
          <Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.blueAccent[700],
                color: "#fcfcfc",
                fontSize: isMdDevices ? "14px" : "10px",
                fontWeight: "bold",
                p: "10px 20px",
                mt: "18px",
                transition: ".3s ease",
                ":hover": {
                  bgcolor: colors.blueAccent[800],
                },
              }}
              startIcon={<DownloadOutlined />}
            >
              DOWNLOAD REPORTS
            </Button>
          </Box>
        )}
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns={
          isXlDevices
            ? "repeat(12, 1fr)"
            : isMdDevices
              ? "repeat(6, 1fr)"
              : "repeat(3, 1fr)"
        }
        gridAutoRows="140px"
        gap="20px"
      >
        {/* Statistic Items */}
        <Box
          gridColumn="span 3"
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="11,361"
            subtitle="Waste Collection Points"
            progress="0.75"
            increase="+14%"
            icon={
              <LocationCity
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="431,225"
            subtitle="Total Users"
            progress="0.50"
            increase="+21%"
            icon={
              <VerifiedUserSharp
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="32,441"
            subtitle="Waste Categories"
            progress="0.30"
            increase="+5%"
            icon={
              <RecyclingRounded
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="1,325,134"
            subtitle="Collection Companies"
            progress="0.80"
            increase="+43%"
            icon={
              <CarRentalRounded
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ---------------- Row 2 ---------------- */}

        {/* Bar Chart */}
        <Box
          gridColumn={
            isXlDevices ? "span 8" : isMdDevices ? "span 6" : "span 3"
          }
          gridRow="span 2"
          bgcolor={colors.primary[400]}
        >
          <Box
            mt="25px"
            px="30px"
            display="flex"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.gray[100]}
              >
                Subscription by Company
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                Total Subscriptions
              </Typography>
            </Box>
            <IconButton>
              <DownloadOutlined
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box height="250px" mt="-20px">
            <BarSubChart isDashboard={true} />
          </Box>
        </Box>

        {/* Recent Subscriptions */}
<Box
  gridColumn={isXlDevices ? "span 4" : "span 3"}
  gridRow="span 2"
  bgcolor={colors.primary[400]}
  overflow="auto"
>
  <Box borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
    <Typography color={colors.gray[100]} variant="h5" fontWeight="600">
      Recent Subscriptions
    </Typography>
  </Box>

  {mockSubscriptions.map((subscription, index) => (
    <Box
      key={`${subscription.userId}-${index}`}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderBottom={`4px solid ${colors.primary[500]}`}
      p="15px"
    >
      <Box>
        <Typography
          color={colors.greenAccent[500]}
          variant="h5"
          fontWeight="600"
        >
          {subscription.userId}
        </Typography>
        <Typography color={colors.gray[100]}>
          {subscription.company}
        </Typography>
      </Box>
      <Typography color={colors.gray[100]}>
        {subscription.date}
      </Typography>
    </Box>
  ))}
</Box>

        {/* Bar Chart */}
        <Box
          gridColumn={isXlDevices ? "span 6" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ p: "30px 30px 0 30px" }}
          >
            Group by Waste Types
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="250px"
            mt="-20px"
          >
            <DonutChart isDashboard={true} />
          </Box>
        </Box>

        {/* Geography Chart */}
        <Box
          gridColumn={isXlDevices ? "span 6" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography variant="h5" fontWeight="600" mb="15px">
            Group by Location
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            <SubscriptionPieChart />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
