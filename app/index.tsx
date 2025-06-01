import { ScrollView, StyleSheet } from 'react-native';
import Charts from '../components/Charts';
import DailyReport from '../components/DailyReport';
import Projects from '../components/Projects';
export default function Index() {
  
  return (
    <ScrollView>
      {/* <Text style={styles.text}>Lookin snacky, lil' mama</Text> */}
      <DailyReport />
      <Projects />
      <Charts />
      {/* <Text style={styles.text}>Peekaboo!</Text> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    alignSelf: 'center',
    color: '#000',
  }
});
