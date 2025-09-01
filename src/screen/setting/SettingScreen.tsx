import {View,Text,StyleSheet,TouchableOpacity,SafeAreaView,Image,ScrollView,Alert,Switch,} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { logout } from "../../store/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootStackNavigator";

type SettingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingScreen = () => {

  const dispatch = useDispatch();
  const navigation = useNavigation<SettingScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const renderAvatar = () => {
    if (user?.profilePhoto) {
      return <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />;
    } else if (user?.name) {
      return (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={32} color="#6B7280" />
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          {renderAvatar()}
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name || "Guest User"}</Text>
            {user?.email && <Text style={styles.email}>{user.email}</Text>}
            {user?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.itemContent}>
              <Ionicons name="person-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.item}>
            <View style={styles.itemContent}>
              <Ionicons name="mail-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={emailNotifications ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.item}>
            <View style={styles.itemContent}>
              <Ionicons name="notifications-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={pushNotifications ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          <TouchableOpacity style={styles.item}>
            <View style={styles.itemContent}>
              <Ionicons name="language-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Language</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.item}>
            <View style={styles.itemContent}>
              <Ionicons name="color-palette-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Theme</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>Light</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <TouchableOpacity 
            style={styles.item}
            onPress={() => navigation.navigate("HelpSupport")}
          >
            <View style={styles.itemContent}>
              <Ionicons name="help-circle-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.item}
            onPress={() => navigation.navigate("About")}
          >
            <View style={styles.itemContent}>
              <Ionicons name="information-circle-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.item}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <View style={styles.itemContent}>  
              <Ionicons name="shield-checkmark-outline" size={22} color="#4B5563" style={styles.itemIcon} />
              <Text style={styles.itemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB"
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF"
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B82F6",
    textAlign: "center"
  },
  content: { 
    padding: 20,
  },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    marginBottom: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4B5563",
  },
  name: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#111827",
    marginBottom: 4
  },
  email: { 
    fontSize: 14, 
    color: "#6B7280", 
    marginBottom: 6 
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500"
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#EFF6FF"
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    paddingLeft: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemIcon: {
    marginRight: 16,
    width: 24
  },
  itemText: { 
    fontSize: 16, 
    color: "#374151",
    fontWeight: "500" 
  },
  itemValue: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FEF2F2",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  logoutIcon: {
    marginRight: 8
  },
  logoutText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#DC2626" 
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  versionText: {
    fontSize: 12,
    color: "#6B7280"
  }
});