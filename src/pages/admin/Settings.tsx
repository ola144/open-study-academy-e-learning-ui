import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import AdminSchoolInfo from "../../components/AdminSchoolInfo";
import AdminProfile from "../../components/AdminProfile";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("school info");

  const tabs = ["school info", "profile"];

  useEffect(() => {
    document.title = `Settings | OpenStudy`;
  }, []);

  return (
    <Box
      component="div"
      sx={{ display: "flex", flexDirection: "column", gap: "40px" }}
    >
      <Box
        component="div"
        sx={{ display: "flex", alignItems: "center ", gap: "6px" }}
      >
        {tabs.map((tab) => (
          <Button
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? "contained" : "text"}
            key={tab}
            sx={{ textTransform: "uppercase", transition: "all" }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {activeTab === "school info" && <AdminSchoolInfo />}
      {activeTab === "profile" && <AdminProfile />}
    </Box>
  );
};

export default Settings;
