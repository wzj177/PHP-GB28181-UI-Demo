// src/mock/setup.ts
import Mock from './index'
import { enableProdMode } from 'mockjs'

// Determine if we need to mock based on environment
const isMockEnabled = import.meta.env.VITE_MOCK_ENABLED !== 'false'

if (isMockEnabled && import.meta.env.DEV) {
  Mock.setup({
    timeout: '200-600' // Simulate network delay
  })
  console.log('Mock enabled')
} else {
  enableProdMode() // Enable production mode for Mock.js
  console.log('Mock disabled')
}

export {}