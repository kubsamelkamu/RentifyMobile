import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import profileReducer from './slices/profileSlice'; 
import propertiesReducer from './slices/propertiesSlice';
import chatReducer from './slices/chatslice'

const rootReducer = combineReducers(
    { auth: authReducer ,
      booking: bookingReducer,
      profile: profileReducer,
      properties: propertiesReducer,
      chat: chatReducer,
    }
);
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;