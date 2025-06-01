import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Import your individual chart components
import MonthlyIncomeChart from './MonthlyIncomeChart'; // Adjust path as necessary
import WeeklyIncomeChart from './WeeklyIncomeChart'; // Adjust path as necessary
import YearlyIncomeChart from './YearlyIncomeChart'; // Adjust path as necessary

const IncomeChartsDashboard: React.FC = () => {
  return (
    <View style={styles.charts}>
      <Text style={styles.mainHeader}>Financial Overview</Text>

      {/* Render each self-contained chart component */}
      <WeeklyIncomeChart />
      <MonthlyIncomeChart />
      <YearlyIncomeChart />
    </View>
  );
};

const styles = StyleSheet.create({
  charts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Significantly increased padding
    backgroundColor: '#F5FCFF',
    width: '90%', // Increased width to occupy more screen space
    marginHorizontal: 'auto', // Centers the container horizontally
  },
  mainHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 25,
  },
});

export default IncomeChartsDashboard;