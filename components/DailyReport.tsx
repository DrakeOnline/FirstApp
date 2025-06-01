import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getCurrentDay, getDay } from '../utils/ClockifyReport'; // Ensure this path is correct

const DailyReport = () => {
  const [daysSinceLastWorked, setDaysSinceLastWorked] = useState<number | null>(null);
  const [moneyMadeToday, setMoneyMadeToday] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      let todayEarnings: number | null = null;
      let lastWorkDayFound: number | null = null;

      try {
        // 1. Fetch money made today
        const todayReport = await getCurrentDay(); //
        todayEarnings = todayReport.totalEarnings;
        setMoneyMadeToday(todayEarnings);

        // 2. Determine days since last worked
        if (todayEarnings !== null && todayEarnings > 0) {
          lastWorkDayFound = 0; // Worked today
        } else {
          // If no earnings today, or if there was an error fetching today's earnings, check previous days
          let daysToCheck = 1;
          for (let i = 0; i < 365; i++) { // Limit search to prevent infinite loops, e.g., 365 days
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysToCheck);
            try {
              const pastDayReport = await getDay(pastDate); //
              if (pastDayReport.totalEarnings !== null && pastDayReport.totalEarnings > 0) {
                lastWorkDayFound = daysToCheck;
                break;
              }
            } catch (e: any) {
              // Log error for the specific day and continue searching
              console.warn(`Error fetching report for ${pastDate.toISOString().split('T')[0]}: ${e.message}`);
            }
            daysToCheck++;
          }
        }
        setDaysSinceLastWorked(lastWorkDayFound);

      } catch (e: any) {
        // Catch any critical errors not handled by individual fetches
        setError(e.message || 'An unexpected error occurred while fetching summary data.');
        setMoneyMadeToday(null); // Clear data on critical error
        setDaysSinceLastWorked(null); // Clear data on critical error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.summaryContainer, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Gathering your latest work insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const lastWorkedText = daysSinceLastWorked === null
    ? 'More than a year ago or data unavailable'
    : daysSinceLastWorked === 0
    ? 'Today'
    : `${daysSinceLastWorked} day${daysSinceLastWorked > 1 ? 's' : ''} ago`;

  const moneyTodayFormatted = (moneyMadeToday ?? 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD', // You might want to make this dynamic or configurable
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // The calculateTotalEarnings function from ClockifyReport.tsx already returns amount in dollars.

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Latest Contribution:</Text>
        <Text style={styles.summaryValue}>{lastWorkedText}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Earnings Today:</Text>
        <Text style={styles.summaryValue}>{moneyTodayFormatted}</Text>
      </View>
    </View>
  );
};

// Styles inspired by the user's example (summaryStyles)
const styles = StyleSheet.create({
  summaryContainer: {
    padding: 16,
    backgroundColor: '#ffffff', // A clean white background
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    marginLeft: '10%',
    marginRight: '10%'
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // A very light separator
  },
  summaryItemLast: { // Apply this to the last item if you don't want a border
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333333', // Dark grey for readability
    fontWeight: '600', // A bit bolder for emphasis
  },
  summaryValue: {
    fontSize: 16,
    color: '#4cae4c', // A vibrant blue for the value
    fontWeight: '700', // Bold for prominence
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  }
});

export default DailyReport;