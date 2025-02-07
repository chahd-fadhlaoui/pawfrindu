import { createContext } from "react";
import { pets } from "../assets/assets";

export const AppContext = createContext()

const AppcontextProvider=(props)=>{
    const value ={
        pets
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppcontextProvider