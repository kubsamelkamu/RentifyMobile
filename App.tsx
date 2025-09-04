import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./src/navigation";
import { store, persistor } from "./src/store/store";
import { connectSocket, disconnectSocket } from "./src/utils/socket";
import { RootState } from "./src/store/store";

function SocketManager() {

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return null; 
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <AppNavigator />
          <SocketManager />
        </>
      </PersistGate>
    </Provider>
  );
} 