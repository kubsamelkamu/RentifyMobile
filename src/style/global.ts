import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2563EB',   
  background: '#FFFFFF',
  text: '#111827',   
};

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    marginTop: 24,
    width: '60%',
  },
   input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
