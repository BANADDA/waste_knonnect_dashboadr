/* eslint-disable react/prop-types */
import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";

const DonutChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const data = [
    { id: "Plastic", label: "Plastic", value: 350, color: "#f47560" },
    { id: "Paper", label: "Paper", value: 200, color: "#f1e15b" },
    { id: "Organic", label: "Organic", value: 150, color: "#e8c1a0" },
    { id: "Metal", label: "Metal", value: 100, color: "#61cdbb" },
    { id: "Glass", label: "Glass", value: 50, color: "#97e3d5" },
  ];

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
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
      tooltip={({ datum: { id, value, color } }) => (
        <div
          style={{
            padding: "12px",
            background: "white",
            border: `1px solid ${color}`,
            color: color,
          }}
        >
          <strong>{id}:</strong> {value} units
        </div>
      )}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.gray[100],
            },
          },
          ticks: {
            text: {
              fill: colors.gray[100],
            },
          },
        },
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

export default DonutChart;
