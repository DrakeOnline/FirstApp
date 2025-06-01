import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// You will need to import these from your ClockifyReport.tsx file
import { getDailyReportsForCurrentWeek, MAX_INCOME_CALGRANT, MAX_INCOME_SNAP } from '../utils/ClockifyReport'; // Adjust path as necessary

const screenWidth = Dimensions.get('window').width; // Re-introduced screenWidth

// Define the interface for your LineChartData, accommodating multiple datasets
interface MyLineChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
  legend?: string[];
}

// Define the interface for your ChartConfig
interface MyChartConfig {
  backgroundColor: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  decimalPlaces?: number;
  color: (opacity: number) => string;
  labelColor?: (opacity: number) => string;
  style?: object;
  propsForDots?: object;
  propsForBackgroundLines?: object;
  propsForLabels?: object;
}

// Common chart configuration (can be defined outside or passed as prop if needed)
const commonChartConfig: MyChartConfig = {
  backgroundColor: '#333',
  backgroundGradientFrom: '#444',
  backgroundGradientTo: '#666',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#fff'
  }
};

const WeeklyIncomeChart: React.FC = () => { // No props needed anymore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekChartData, setWeekChartData] = useState<MyLineChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // --- Fetch data for Weekly Chart (Individual Day Reports) ---
        const dailyReports = await getDailyReportsForCurrentWeek();
        const dailyEarnings: number[] = [];
        const dailyCalGrantTarget: number[] = [];
        const dailySNAPTarget: number[] = [];
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // Calculate daily targets based on the weekly workday assumption
        const maxIncomeDaily = (MAX_INCOME_CALGRANT / 52) / 5; // Annual / 52 weeks / 5 workdays per week
        const maxSnapDaily = (MAX_INCOME_SNAP / 52) / 5; // Annual / 52 weeks / 5 workdays per week

        for (const report of dailyReports) {
          dailyEarnings.push(report.totalEarnings || 0);
          dailyCalGrantTarget.push(maxIncomeDaily);
          dailySNAPTarget.push(maxSnapDaily);
        }

        setWeekChartData({
          labels: dayLabels,
          datasets: [
            {
              data: dailyEarnings,
              color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`, // Orange for Income
              strokeWidth: 2
            },
            {
              data: dailyCalGrantTarget,
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue for Cal Grant
              strokeWidth: 2
            },
            {
              data: dailySNAPTarget,
              color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Cyan for SNAP
              strokeWidth: 2
            }
          ],
          legend: ["Income", "Cal Grant", "SNAP"]
        });

      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
        console.error("Error fetching weekly chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading weekly report...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.header}>Income Limits (Daily)</Text>
      {weekChartData && (
        <LineChart
          data={weekChartData}
          width={screenWidth * 0.75}
          height={250}
          chartConfig={commonChartConfig}
          bezier
          style={styles.chart}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default WeeklyIncomeChart;