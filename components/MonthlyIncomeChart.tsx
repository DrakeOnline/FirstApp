import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// Adjust path as necessary based on your project structure
import { getMonth, MAX_INCOME_CALGRANT, MAX_INCOME_SNAP } from '../utils/ClockifyReport';


const screenWidth = Dimensions.get('window').width; // Re-introduced screenWidth

// Define the interface for your ChartData, accommodating a single dataset with multiple labels for BarChart
interface MyBarChartData {
  labels: string[]; // Now holds "Income", "Cal Grant", "SNAP"
  datasets: Array<{
    data: number[];
    colors?: ((opacity: number) => string)[]; // Colors for each bar in the single dataset
  }>;
  legend?: string[]; // Legend might be less necessary here as labels are clear
}

// Define the interface for your ChartConfig
interface MyChartConfig {
  backgroundColor: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  decimalPlaces?: number;
  color: (opacity: number) => string;
  labelColor?: (opacity: number) => string;
  barPercentage?: number;
  propsForBackgroundLines?: object;
  propsForLabels?: object;
  propsForVerticalLabels?: object;
  propsForHorizontalLabels?: object;
  fillShadowGradient?: string;
  fillShadowGradientOpacity?: number;
}

// Common chart configuration
const commonChartConfig: MyChartConfig = {
  backgroundColor: '#333',
  backgroundGradientFrom: '#444',
  backgroundGradientTo: '#666',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.95, // Adjusted to make bars closer together
  propsForLabels: {
    fontSize: 10,
  },
  propsForVerticalLabels: {
    fontSize: 10,
  },
  propsForHorizontalLabels: {
    fontSize: 10,
  },
  fillShadowGradient: 'rgba(255, 255, 255, 0.5)',
  fillShadowGradientOpacity: 0.3,
};

const MonthlyIncomeChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthChartData, setMonthChartData] = useState<MyBarChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const currentMonthReport = await getMonth(new Date());
        const currentMonthEarnings = currentMonthReport.totalEarnings || 0;
        const currentMaxIncomeMonthly = MAX_INCOME_CALGRANT / 12;
        const currentMaxSnapMonthly = MAX_INCOME_SNAP / 12;

        setMonthChartData({
          labels: ["SNAP", "Income", "Cal Grant"], // Each point is now its own label for separate bars
          datasets: [
            {
              data: [currentMaxSnapMonthly, currentMonthEarnings, currentMaxIncomeMonthly ],
              colors: [
                (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Cyan for SNAP
                (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Red for Income
                (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue for Cal Grant
              ],
            }
          ],
          legend: ["SNAP", "Income", "Cal Grant"], // Added a proper legend for color coordination
        });

      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
        console.error("Error fetching monthly chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading monthly report...</Text>
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
      <Text style={styles.header}>Monthly Comparison (Bar Chart)</Text>
      {monthChartData && (
        <BarChart
          data={monthChartData}
          width={screenWidth * 0.75} // Changed to 75% of screen width
          height={250}
          chartConfig={commonChartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          yAxisLabel="$"
          yAxisSuffix=""
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

export default MonthlyIncomeChart;