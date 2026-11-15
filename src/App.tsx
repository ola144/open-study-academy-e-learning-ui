import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

function App() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
