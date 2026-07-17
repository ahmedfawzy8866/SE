import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const COMPOUNDS = [
  "Mivida", "Hyde Park", "Mountain View iCity", "Uptown Cairo", "Madinaty", 
  "Eastown", "Villette", "Palm Hills New Cairo", "Taj City", "Celia", 
  "ZED East", "Azad", "Fifth Square", "District 5", "The Waterway", 
  "Lake View Residence", "Sarai", "Stone Residence", "Galleria Moon Valley", 
  "Layan", "Swan Lake Residences"
];
const BEDS = ["1", "2", "3", "4", "5+"];
const FINISHING = ["Core & Shell", "Semi-Finished", "Fully Finished", "Furnished"];
const LISTING_TYPES = ["Rent", "Resale", "Primary"];

interface Props {
  compounds: string[];
  setCompounds: (c: string[]) => void;
  beds: string[];
  setBeds: (b: string[]) => void;
  finishing: string[];
  setFinishing: (f: string[]) => void;
  listingType?: string[];
  setListingType?: (t: string[]) => void;
}

export function MobileFilterChips({
  compounds,
  setCompounds,
  beds,
  setBeds,
  finishing,
  setFinishing,
  listingType = [],
  setListingType = () => {},
}: Props) {
  const colors = useColors();
  const [sheet, setSheet] = useState<"compounds" | "beds" | "finishing" | "listingType" | null>(null);

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearSheet = () => {
    if (sheet === "compounds") setCompounds([]);
    if (sheet === "beds") setBeds([]);
    if (sheet === "finishing") setFinishing([]);
    if (sheet === "listingType") setListingType([]);
  };

  const getSheetTitle = () => {
    if (sheet === "compounds") return "Clusters & Compounds";
    if (sheet === "beds") return "Bedrooms";
    if (sheet === "finishing") return "Finishing";
    if (sheet === "listingType") return "Listing Type";
    return "";
  };

  const getSheetData = () => {
    if (sheet === "compounds") return COMPOUNDS;
    if (sheet === "beds") return BEDS;
    if (sheet === "finishing") return FINISHING;
    if (sheet === "listingType") return LISTING_TYPES;
    return [];
  };

  const getSheetActiveList = () => {
    if (sheet === "compounds") return compounds;
    if (sheet === "beds") return beds;
    if (sheet === "finishing") return finishing;
    if (sheet === "listingType") return listingType;
    return [];
  };

  const getSheetSetter = () => {
    if (sheet === "compounds") return setCompounds;
    if (sheet === "beds") return setBeds;
    if (sheet === "finishing") return setFinishing;
    if (sheet === "listingType") return setListingType;
    return () => {};
  };

  const activeList = getSheetActiveList();
  const activeSetter = getSheetSetter();
  const data = getSheetData();

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: listingType.length > 0 ? colors.gold + "20" : colors.card,
              borderColor: listingType.length > 0 ? colors.gold : colors.border,
            },
          ]}
          onPress={() => setSheet("listingType")}
        >
          <Text style={[styles.chipText, { color: listingType.length > 0 ? colors.gold : colors.text }]}>
            🔖 Type {listingType.length > 0 ? `(${listingType.length})` : ""}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: compounds.length > 0 ? colors.gold + "20" : colors.card,
              borderColor: compounds.length > 0 ? colors.gold : colors.border,
            },
          ]}
          onPress={() => setSheet("compounds")}
        >
          <Text style={[styles.chipText, { color: compounds.length > 0 ? colors.gold : colors.text }]}>
            🏢 Clusters {compounds.length > 0 ? `(${compounds.length})` : ""}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: beds.length > 0 ? colors.gold + "20" : colors.card,
              borderColor: beds.length > 0 ? colors.gold : colors.border,
            },
          ]}
          onPress={() => setSheet("beds")}
        >
          <Text style={[styles.chipText, { color: beds.length > 0 ? colors.gold : colors.text }]}>
            🛏️ Beds {beds.length > 0 ? `(${beds.length})` : ""}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: finishing.length > 0 ? colors.gold + "20" : colors.card,
              borderColor: finishing.length > 0 ? colors.gold : colors.border,
            },
          ]}
          onPress={() => setSheet("finishing")}
        >
          <Text style={[styles.chipText, { color: finishing.length > 0 ? colors.gold : colors.text }]}>
            ✨ Finishing {finishing.length > 0 ? `(${finishing.length})` : ""}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal visible={sheet !== null} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSheet(null)} />
          <View style={[styles.sheetContent, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{getSheetTitle()}</Text>
              <Pressable onPress={() => setSheet(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetScroll}>
              {sheet === "compounds" ? (
                <View style={styles.grid}>
                  {data.map((item) => {
                    const isSelected = activeList.includes(item);
                    return (
                      <Pressable
                        key={item}
                        onPress={() => toggleItem(activeList, activeSetter, item)}
                        style={[
                          styles.gridItem,
                          {
                            backgroundColor: isSelected ? colors.gold + "20" : colors.background,
                            borderColor: isSelected ? colors.gold : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.gridItemText, { color: isSelected ? colors.gold : colors.text }]} numberOfLines={1}>
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.list}>
                  {data.map((item) => {
                    const isSelected = activeList.includes(item);
                    return (
                      <Pressable
                        key={item}
                        onPress={() => toggleItem(activeList, activeSetter, item)}
                        style={[
                          styles.listItem,
                          { borderBottomColor: colors.border },
                          isSelected && { backgroundColor: colors.gold + "10" },
                        ]}
                      >
                        <Text style={[styles.listItemText, { color: isSelected ? colors.gold : colors.text }]}>
                          {item}
                        </Text>
                        {isSelected && <Feather name="check" size={16} color={colors.gold} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
              <Pressable style={styles.clearBtn} onPress={clearSheet}>
                <Text style={[styles.clearBtnText, { color: colors.mutedForeground }]}>Clear</Text>
              </Pressable>
              <Pressable style={[styles.applyBtn, { backgroundColor: colors.gold }]} onPress={() => setSheet(null)}>
                <Text style={[styles.applyBtnText, { color: colors.navyDeep }]}>
                  Show Results
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetContent: {
    maxHeight: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -12,
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    gap: 0,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  sheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
  },
  clearBtn: {
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  applyBtn: {
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
