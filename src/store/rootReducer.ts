import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice'; 
import propertiesReducer from './slices/propertiesSlice';

const rootReducer = combineReducers(
    { auth: authReducer ,
      profile: profileReducer,
      properties: propertiesReducer,
    }
);
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;