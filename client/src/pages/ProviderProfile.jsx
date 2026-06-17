import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProviderProfilePage() {
  const [businessName, setBusinessName] = useState('Quick Fix Plumbing');
  const [category, setCategory] = useState('Plumbing Services');
  const [experience, setExperience] = useState('5 Years');
  const [bio, setBio] = useState('Professional plumbing services including leak repairs, pipe installations, and emergency fixes.');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Business profile updated successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="briefcase" size={60} color="#ccc" />
              </View>
            )}
            {isEditing && (
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{businessName}</Text>
        <Text style={styles.subtitle}>{category}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Availability Status</Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#767577', true: '#28a745' }}
            thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.label}>Business / Provider Name</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={businessName}
          onChangeText={setBusinessName}
          editable={isEditing}
        />

        <Text style={styles.label}>Service Category</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={category}
          onChangeText={setCategory}
          editable={isEditing}
        />

        <Text style={styles.label}>Experience</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={experience}
          onChangeText={setExperience}
          editable={isEditing}
        />

        <Text style={styles.label}>Business Bio / Description</Text>
        <TextInput
          style={[styles.input, styles.bioInput, !isEditing && styles.disabledInput]}
          value={bio}
          onChangeText={setBio}
          editable={isEditing}
          multiline
          numberOfLines={4}
        />

        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Business Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Business Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#f1f3f5', borderBottomWidth: 1, borderColor: '#e9ecef' },
  imageContainer: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', backgroundColor: '#e1e4e8', justifyContent: 'center', alignItems: 'center', marginBottom: 15, position: 'relative' },
  profileImage: { width: '100%', height: '100%' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#28a745', padding: 8, borderRadius: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#212529' },
  subtitle: { fontSize: 14, color: '#495057', marginTop: 5 },
  form: { padding: 20 },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#edf2f7' },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, color: '#333', backgroundColor: '#fff' },
  bioInput: { height: 100, textAlignVertical: 'top' },
  disabledInput: { backgroundColor: '#f5f5f5', borderColor: '#e3e3e3', color: '#777' },
  editButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  saveButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
