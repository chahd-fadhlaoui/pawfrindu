import { createContext } from "react";
import { pets } from "../assets/assets";

export const AppContext = createContext();

const AppcontextProvider = (props) => {
  const currencySymbol = "Dt";
  const value = {
    pets,
    currencySymbol,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
export default AppcontextProvider;
