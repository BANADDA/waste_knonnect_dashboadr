import { Box, Typography } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";

const DonutChart = () => {
  const data = [
    { id: "Plastic", label: "Plastic", value: 120, color: "hsl(20, 70%, 50%)" },
    { id: "Organic", label: "Organic", value: 80, color: "hsl(160, 70%, 50%)" },
    { id: "Glass", label: "Glass", value: 100, color: "hsl(90, 70%, 50%)" },
    { id: "Metal", label: "Metal", value: 60, color: "hsl(45, 70%, 50%)" },
    { id: "Paper", label: "Paper", value: 140, color: "hsl(220, 70%, 50%)" },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
    >
      <Box height="200px" width="200px" mt="25px">
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          colors={{ datum: "data.color" }}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          enableArcLinkLabels={false}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          arcLinkLabelsColor={{ from: "color" }}
          arcLinkLabelsThickness={2}
          arcLabelsRadiusOffset={0.55}
          arcLabelsSkipAngle={10}
          arcLabel={(d) => `${d.value} (${Math.round((d.value / 500) * 100)}%)`}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "#999",
              symbolSize: 18,
              symbolShape: "circle",
            },
          ]}
        />
      </Box>
      <Typography
        textAlign="center"
        variant="h5"
        color="greenAccent[500]"
        sx={{ mt: "15px" }}
      >
        Total Waste Collected: 500 units
      </Typography>
    </Box>
  );
};

export default DonutChart;
