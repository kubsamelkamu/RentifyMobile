import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import propertiesReducer from './slices/propertiesSlice';

const rootReducer = combineReducers(
    { auth: authReducer ,
      properties: propertiesReducer,
    }
);
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;