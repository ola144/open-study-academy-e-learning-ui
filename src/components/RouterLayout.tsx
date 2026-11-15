import ScrollToTop from "./ScrollToTop";
import { Outlet } from "react-router-dom";

const RouterLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default RouterLayout;
