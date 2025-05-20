import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import Header from '@/components/Header'
import { hp } from '@/helpers/common'
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart } from "react-native-gifted-charts";
import Barchart from '@/components/charts/Barchart'

const dashboard = () => {
  const data = [{ value: 50, label: 'b' }, { value: 80 }, { value: 90 }, { value: 70 }]
  return (
    <ScreenWrapper>
      <ThemedView style={styles.container}>
        <Header name="Dashboard" />
        <ThemedView style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Barchart />
        </ThemedView>
      </ThemedView>
    </ScreenWrapper>
  )
}

export default dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: hp(1),
  }
})