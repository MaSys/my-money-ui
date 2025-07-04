<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Chart.js Test</h1>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Simple Test Chart</h2>
      <div class="relative h-64">
        <canvas ref="testCanvas" class="w-full h-full"></canvas>
      </div>
    </div>
    
    <div class="mt-4">
      <button 
        @click="createTestChart"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create Test Chart
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

const testCanvas = ref(null)
let testChartInstance = null

const createTestChart = () => {
  console.log('Creating test chart...')
  
  if (!testCanvas.value) {
    console.error('Canvas not found')
    return
  }
  
  // Destroy existing chart
  if (testChartInstance) {
    testChartInstance.destroy()
  }
  
  // Sample data
  const testData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Test Data',
      data: [100, 200, 150, 300, 250],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1
    }]
  }
  
  try {
    testChartInstance = new Chart(testCanvas.value, {
      type: 'line',
      data: testData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
    
    console.log('Test chart created successfully!')
  } catch (error) {
    console.error('Error creating test chart:', error)
  }
}

onMounted(() => {
  console.log('Chart test component mounted')
  // Auto-create chart on mount
  setTimeout(createTestChart, 100)
})
</script> 