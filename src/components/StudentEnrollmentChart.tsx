import { useMemo, useState } from "react";
import { useAdminDashboardEnrollmentActivityQuery } from "../hooks/useDashboard";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EnrollmentPeriod } from "../api/dashboard";
import "../pages/admin/admin-pages.css";

const StudentEnrollmentChart = () => {
  const [period, setPeriod] = useState("weekly" as EnrollmentPeriod);

  const {
    data: enrollemntActivity,
    isLoading,
    isError,
  } = useAdminDashboardEnrollmentActivityQuery(period);

  const activity = useMemo(() => {
    return enrollemntActivity?.data;
  }, [enrollemntActivity?.data]);

  const formatLabel = (date: string) => {
    const parsedDate = new Date(`${date}T12:00:00`);

    if (enrollemntActivity?.groupBy === "week") {
      return `Week of ${parsedDate.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Lagos",
      })}`;
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      timeZone: "Africa/Lagos",
    });
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            justifyContent: "space-between",
            alignItems: "start",
            mb: 3,
            display: "flex",
          }}
        >
          <div className="admin-panel-heading">
            <div>
              <Typography component="h3">Enrollment activity</Typography>
              <Typography>New student registrations flow.</Typography>
            </div>
            <div className="admin-chart-legend">
              <span /> Total Enrollments{" "}
              <strong>
                {isLoading ? "..." : enrollemntActivity?.totalEnrollments}
              </strong>
            </div>
            {/* <Chip label="This week" size="small" variant="outlined" /> */}
          </div>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as EnrollmentPeriod)
              }
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="twoWeeks">Two weeks</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="twoMonths">Two months</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">
            Unable to load enrollment activity.
          </Typography>
        ) : (
          <LineChart
            style={{
              width: "100%",
              aspectRatio: 1.618,
              maxWidth: 800,
              margin: "auto",
            }}
            responsive
            data={activity}
            // margin={{ top: 20, right: 24, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis
              dataKey="date"
              tickFormatter={(date: string) => {
                const parsedDate = new Date(`${date}:12:00:00`);

                return parsedDate.toLocaleDateString("en-Ng", {
                  day: "2-digit",
                  month: "2-digit",
                  timeZone: "Africa/Lagos",
                });
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={40}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value) => [value, "New students"]}
              labelFormatter={(label) =>
                `${formatLabel(String(label))} enrollment`
              }
            />

            <Line
              type="monotone"
              dataKey="value"
              name="New students"
              stroke="#4c8a68"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Legend verticalAlign="top" align="right" />
            {/* <RechartsDevtools /> */}
          </LineChart>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentEnrollmentChart;
