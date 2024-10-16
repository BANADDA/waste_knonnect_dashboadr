import { MenuItem } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";

const Item = ({ title, path, icon, onClick }) => {
  const location = useLocation();

  return (
    <MenuItem
      component={<Link to={path} />}
      to={path}
      icon={icon}
      onClick={onClick} // Pass onClick handler
      rootStyles={{
        color: path === location.pathname && "#6870fa",
      }}
    >
      {title}
    </MenuItem>
  );
};

export default Item;
