import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// You will need to import these from your ClockifyReport.tsx file
import { MAX_INCOME_CALGRANT, MAX_INCOME_SNAP, getMonth } from '../utils/ClockifyReport'; // Adjust path as necessary

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

const YearlyIncomeChart: React.FC = () => { // No props needed anymore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearChartData, setYearChartData] = useState<MyLineChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const currentYear = new Date().getFullYear();

        // --- Fetch data for Yearly Chart (Individual Month Reports) ---
        const monthlyEarnings: number[] = [];
        const monthlyCalGrantTarget: number[] = [];
        const monthlySNAPTarget: number[] = [];
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(currentYear, i, 1);
          // Note: getMonth is called here for each month to simulate yearly breakdown
          const monthReport = await getMonth(monthDate);
          monthlyEarnings.push(monthReport.totalEarnings || 0);
          monthlyCalGrantTarget.push(MAX_INCOME_CALGRANT / 12);
          monthlySNAPTarget.push(MAX_INCOME_SNAP / 12);
        }

        setYearChartData({
          labels: monthLabels,
          datasets: [
            {
              data: monthlyEarnings,
              color: (opacity = 1) => `rgba(25, 255, 25, ${opacity})`, // Green for Income
              strokeWidth: 2
            },
            {
              data: monthlyCalGrantTarget,
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue for Cal Grant
              strokeWidth: 2
            },
            {
              data: monthlySNAPTarget,
              color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Cyan for SNAP
              strokeWidth: 2
            }
          ],
          legend: ["Income", "Cal Grant", "SNAP"]
        });

      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
        console.error("Error fetching yearly chart data:", err);
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
        <Text>Loading yearly report...</Text>
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
      <Text style={styles.header}>Income Limits (monthly)</Text>
      {yearChartData && (
        <LineChart
          data={yearChartData}
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

export default YearlyIncomeChart;