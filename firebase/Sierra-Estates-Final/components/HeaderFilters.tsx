import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';

const STATUS_OPTIONS = ['Rent', 'Resale'];
const ROOM_OPTIONS = ['Any', '1', '2', '3', '4', '5+'];
const FURNISHED_OPTIONS = ['Any', 'Yes', 'No'];

export function HeaderFilters() {
  const colors = useColors();
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [status, setStatus] = useState<string>('Rent/Resale');
  const [rooms, setRooms] = useState<string>('Any');
  const [furnished, setFurnished] = useState<string>('Any');

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSearch = () => {
    setActiveDropdown(null);
    router.push(`/listings?status=${status}&rooms=${rooms}&furnished=${furnished}`);
  };

  return (
    <View style={{ zIndex: 50 }}>
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        
        {/* Status Dropdown */}
        <Pressable style={styles.filterItem} onPress={() => toggleDropdown('status')}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Status</Text>
          <Text style={[styles.filterValue, { color: colors.mutedForeground }]}>{status}</Text>
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        {/* Compounds - Simplification: clicking redirects to advanced search for multi-select */}
        <Pressable style={styles.filterItem} onPress={() => router.push('/listings')}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Compounds</Text>
          <Text style={[styles.filterValue, { color: colors.mutedForeground }]}>26 Compounds</Text>
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Rooms Dropdown */}
        <Pressable style={styles.filterItem} onPress={() => toggleDropdown('rooms')}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Rooms</Text>
          <Text style={[styles.filterValue, { color: colors.mutedForeground }]}>{rooms}</Text>
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        {/* Furnished Dropdown */}
        <Pressable style={styles.filterItem} onPress={() => toggleDropdown('furnished')}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Furnished</Text>
          <Text style={[styles.filterValue, { color: colors.mutedForeground }]}>{furnished}</Text>
        </Pressable>

        <Pressable style={[styles.searchBtn, { backgroundColor: colors.gold }]} onPress={handleSearch}>
          <Feather name="search" size={16} color={colors.navyDeep} />
        </Pressable>
      </View>

      {/* Dropdown Menus */}
      {activeDropdown === 'status' && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border, left: 0 }]}>
          {STATUS_OPTIONS.map(opt => (
            <Pressable key={opt} style={styles.dropdownItem} onPress={() => { setStatus(opt); setActiveDropdown(null); }}>
              <Text style={{ color: colors.text }}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
      
      {activeDropdown === 'rooms' && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border, left: 160 }]}>
          {ROOM_OPTIONS.map(opt => (
            <Pressable key={opt} style={styles.dropdownItem} onPress={() => { setRooms(opt); setActiveDropdown(null); }}>
              <Text style={{ color: colors.text }}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {activeDropdown === 'furnished' && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border, right: 40 }]}>
          {FURNISHED_OPTIONS.map(opt => (
            <Pressable key={opt} style={styles.dropdownItem} onPress={() => { setFurnished(opt); setActiveDropdown(null); }}>
              <Text style={{ color: colors.text }}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 30,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  filterItem: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  filterValue: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  searchBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    width: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  }
});
