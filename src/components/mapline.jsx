/* eslint-disable react/prop-types */
import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";

const SubscriptionPieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const data = [
    { id: "Household", label: "Household", value: 450, color: "#f47560" },
    { id: "Business", label: "Business", value: 300, color: "#61cdbb" },
    { id: "School", label: "School", value: 150, color: "#f1e15b" },
    { id: "Office", label: "Office", value: 200, color: "#97e3d5" },
    { id: "Industry", label: "Industry", value: 100, color: "#e8c1a0" },
  ];

  // Calculate the total for percentage calculation
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 20, right: 20, bottom: 30, left: 30 }}
      innerRadius={0} // Full pie chart, not a donut
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={{ scheme: "nivo" }}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.gray[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      // Display percentage inside the pie chart slices
      arcLabels={({ datum: { value } }) => `${((value / total) * 100).toFixed(2)}%`}
      tooltip={({ datum: { id, value, color } }) => {
        const percentage = ((value / total) * 100).toFixed(2); // Calculate percentage
        return (
          <div
            style={{
              padding: "12px",
              background: "white",
              border: `1px solid ${color}`,
              color: color,
            }}
          >
            <strong>{id}:</strong> {percentage}% ({value} subscriptions)
          </div>
        );
      }}
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
          itemTextColor: colors.gray[100],
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

export default SubscriptionPieChart;
