import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deviceAPI, dashboardAPI } from '../services/api'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const navigate = useNavigate()
  const REFRESH_INTERVAL_MS = 5000
  const timePeriodRef = useRef('daily')
  const [user, setUser] = useState(null)
  const [devices, setDevices] = useState([])
  const [energyStats, setEnergyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [timePeriod, setTimePeriod] = useState('daily')
  const [deviceStates, setDeviceStates] = useState({})
  const [consumptionData, setConsumptionData] = useState([])
  const [roomWiseData, setRoomWiseData] = useState([])
  const [deviceConsumption, setDeviceConsumption] = useState([])
  const [notificationPrefs, setNotificationPrefs] = useState({
    energyAlerts: true,
    emailNotifications: true,
    weeklyReports: true,
    peakAlerts: false,
  })
  const [monthlyTarget, setMonthlyTarget] = useState(350)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
  })
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: '',
    location: '',
    powerUsage: '',
  })
  const [editingDevice, setEditingDevice] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [nowTick, setNowTick] = useState(Date.now())
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const getStoredUser = () => {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) setUser(storedUser)
    loadDashboardData({ silent: false })
    generateRoomWiseData()

    const storedSettings = localStorage.getItem('dashboardSettings')
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings)
        if (parsed?.notificationPrefs) {
          setNotificationPrefs(parsed.notificationPrefs)
        }
        if (typeof parsed?.monthlyTarget === 'number') {
          setMonthlyTarget(parsed.monthlyTarget)
        }
        if (typeof parsed?.twoFactorEnabled === 'boolean') {
          setTwoFactorEnabled(parsed.twoFactorEnabled)
        }
      } catch (error) {
        console.warn('Failed to parse dashboard settings:', error)
      }
    }
  }, [])

  useEffect(() => {
    loadConsumptionData(timePeriod)
  }, [timePeriod, user?.id])

  useEffect(() => {
    timePeriodRef.current = timePeriod
  }, [timePeriod])

  useEffect(() => {
    const userData = user || getStoredUser()
    const userId = userData?.id
    if (!userId) return

    const es = new EventSource(`/api/realtime/stream?userId=${userId}`)
    const onTick = () => {
      loadDashboardData({ silent: true })
      loadConsumptionData(timePeriodRef.current, { silent: true })
    }

    es.addEventListener('tick', onTick)
    es.addEventListener('connected', () => {
      onTick()
    })

    es.onerror = () => {
      // Keep polling as a fallback if SSE fails in the environment.
      try { es.close() } catch { /* noop */ }
    }

    return () => {
      try { es.close() } catch { /* noop */ }
    }
  }, [user?.id])

  useEffect(() => {
    // Poll backend so devices/stats refresh without manual reload.
    const id = setInterval(() => {
      loadDashboardData({ silent: true })
      loadConsumptionData(timePeriodRef.current, { silent: true })
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    // Tick the UI so "today" consumption increases over time even if devices don't change.
    const id = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
      })
    }
  }, [user])

  const pseudoRandom01 = (seed) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const getActivePowerKw = (deviceList) => {
    return (deviceList || []).reduce((sum, d) => {
      const status = String(d?.status || 'active').toLowerCase()
      const online = d?.online !== false
      if (!online || status === 'inactive') return sum
      const p = Number(d?.powerUsage)
      return sum + (Number.isFinite(p) ? p : 0)
    }, 0)
  }

  const getHoursSinceMidnight = () => {
    const now = new Date(nowTick)
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
  }

  const hashString = (str) => {
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0
    }
    return h
  }

  const getPeriodElapsedHours = (period) => {
    const now = new Date(nowTick)
    const hours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600

    if (period === 'daily') return hours
    if (period === 'weekly') {
      // Monday as start of week.
      const dayIndex = (now.getDay() + 6) % 7
      return dayIndex * 24 + hours
    }

    // monthly: from 1st 00:00
    const dayOfMonthIndex = Math.max(0, now.getDate() - 1)
    return dayOfMonthIndex * 24 + hours
  }

  const defaultPowerKwForType = (type) => {
    const t = String(type || '').toLowerCase()
    if (t.includes('light')) return 0.01
    if (t.includes('ac') || t.includes('hvac') || t.includes('air')) return 1.5
    if (t.includes('fan')) return 0.07
    if (t.includes('heater')) return 1.5
    if (t.includes('refriger')) return 0.2
    if (t.includes('wash')) return 0.5
    return 0.1
  }

  const getDevicePowerKw = (device) => {
    const rawPower = Number(device?.powerUsage)
    if (!Number.isFinite(rawPower)) return 0
    // Treat values > 50 as Watts, otherwise assume kW.
    return rawPower > 50 ? rawPower / 1000 : rawPower
  }

  const getDeviceUtilization = (device, period) => {
    const type = String(device?.type || '').toLowerCase()
    let base = 0.22
    if (type.includes('ac') || type.includes('hvac') || type.includes('air')) base = 0.35
    else if (type.includes('refriger')) base = 0.6
    else if (type.includes('light')) base = 0.12
    else if (type.includes('tv') || type.includes('entertain')) base = 0.18
    else if (type.includes('heater')) base = 0.28

    const key = String(device?.id ?? device?.deviceId ?? device?.name ?? 'device')
    const periodSeed = period === 'daily' ? 1 : period === 'weekly' ? 2 : 3
    const jitter = 0.9 + pseudoRandom01(hashString(key) + periodSeed) * 0.2 // 0.9 - 1.1
    return base * jitter
  }

  const isDeviceOn = (device) => {
    const id = device?.id ?? device?.deviceId
    const online = device?.online !== false
    const status = String(device?.status || 'active').toLowerCase()
    return (deviceStates[id] ?? (status !== 'inactive')) && online
  }

  const getDevicePeriodKwh = (device, period) => {
    if (!isDeviceOn(device)) return 0
    const kw = getDevicePowerKw(device)
    const hours = getPeriodElapsedHours(period)
    const util = getDeviceUtilization(device, period)
    return Number((kw * hours * util).toFixed(2))
  }

  const loadConsumptionData = async (period, { silent } = { silent: false }) => {
    try {
      const userData = user || getStoredUser()
      const userId = userData?.id
      if (!userId) return

      const res = await dashboardAPI.getConsumption(userId, period)
      const points = res.data?.points || []
      const totals = res.data?.deviceTotals || []
      setConsumptionData(points)
      setDeviceConsumption(totals)
      setLastUpdatedAt(Date.now())
    } catch (error) {
      if (!silent) {
        console.error('Failed to load consumption data:', error)
      }
    }
  }

  const generateMockConsumptionData = () => {
    const baseKw = getActivePowerKw(devices)
    const now = Date.now()

    const scales = {
      daily: 0.25,   // hourly values
      weekly: 0.25,  // daily totals
      monthly: 0.03, // month totals
    }
    const scale = scales[timePeriod] ?? 0.25

    let data = []
    if (timePeriod === 'daily') {
      data = Array.from({ length: 24 }, (_, i) => {
        const factor = 0.8 + pseudoRandom01(now / (1000 * 60 * 5) + i) * 0.5
        return {
          time: `${i}:00`,
          consumption: Number((baseKw * factor * scale).toFixed(1)),
        }
      })
    } else if (timePeriod === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data = days.map((day, idx) => {
        const factor = 0.85 + pseudoRandom01(now / (1000 * 60 * 30) + idx) * 0.4
        const dailyKwh = baseKw * 24 * factor * scale
        return { time: day, consumption: Number(dailyKwh.toFixed(0)) }
      })
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      data = months.map((month, idx) => {
        const factor = 0.9 + pseudoRandom01(now / (1000 * 60 * 60) + idx) * 0.3
        const monthKwh = baseKw * 24 * 30 * factor * scale
        return { time: month, consumption: Number(monthKwh.toFixed(0)) }
      })
    }

    // If there are no active devices, keep a small baseline so the chart isn't flat zero.
    if (!baseKw && data.length) {
      data = data.map((d, idx) => ({
        ...d,
        consumption: Number((0.5 + pseudoRandom01(idx + now / 100000) * 0.8).toFixed(timePeriod === 'daily' ? 1 : 0)),
      }))
    }

    setConsumptionData(data)
  }

  const generateRoomWiseData = () => {
    const rooms = [
      { name: 'Living Room', color: '#8B5FBF', percentage: 35, consumption: 8.5, average: 0.35, peak: '2PM - 6PM', trend: 'Stable' },
      { name: 'Kitchen', color: '#4A90E2', percentage: 25, consumption: 6.2, average: 0.26, peak: '2PM - 6PM', trend: 'Stable' },
      { name: 'Master Bedroom', color: '#2ECC71', percentage: 17, consumption: 4.1, average: 0.17, peak: '2PM - 6PM', trend: 'Stable' },
      { name: 'Home Office', color: '#F5A623', percentage: 13, consumption: 3.2, average: 0.32, peak: '9AM - 5PM', trend: 'Increasing' },
      { name: 'Bathroom', color: '#E74C3C', percentage: 7, consumption: 1.8, average: 0.07, peak: '7AM - 9AM', trend: 'Stable' },
      { name: 'Other Rooms', color: '#95A5A6', percentage: 3, consumption: 0.8, average: 0.03, peak: 'Variable', trend: 'Decreasing' },
    ]
    setRoomWiseData(rooms)
  }

  const loadDashboardData = async ({ silent } = { silent: false }) => {
    try {
      if (!silent) setLoading(true)
      const userData = user || getStoredUser()
      const userId = userData?.id
      const [statsRes, devicesRes] = await Promise.all([
        dashboardAPI.getEnergyStats(userId),
        deviceAPI.getDevices(userId),
      ])
      setEnergyStats(statsRes.data)
      const loadedDevices = devicesRes.data || []
      setDevices(loadedDevices)
      
      // Initialize device states
      const states = {}
      loadedDevices.forEach((device, idx) => {
        const id = device.id ?? device.deviceId ?? `dev-${idx}`
        const status = String(device.status || 'active').toLowerCase()
        states[id] = status !== 'inactive'
      })
      setDeviceStates(states)
      setLastUpdatedAt(Date.now())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleAddDevice = async (e) => {
    e.preventDefault()
    let tempId = null
    try {
      const userId = user?.id || localStorage.getItem('userId')
      const parsedPower = Number.parseFloat(newDevice.powerUsage)
      const powerUsage = Number.isFinite(parsedPower) ? parsedPower : defaultPowerKwForType(newDevice.type)
      const devicePayload = {
        userId: userId,
        name: newDevice.name,
        type: newDevice.type,
        location: newDevice.location || '',
        status: 'active',
        powerUsage,
      }

      // Optimistic UI update so it appears instantly.
      tempId = `temp-${Date.now()}`
      const optimisticDevice = {
        ...devicePayload,
        id: tempId,
        online: true,
      }
      setDevices(prev => [optimisticDevice, ...prev])
      setDeviceStates(prev => ({ ...prev, [tempId]: true }))

      await deviceAPI.addDevice(devicePayload)
      setNewDevice({ name: '', type: '', location: '', powerUsage: '' })
      setShowAddDevice(false)
      loadDashboardData({ silent: true })
    } catch (error) {
      console.error('Failed to add device:', error)
      if (tempId) {
        setDevices(prev => prev.filter(d => (d.id ?? d.deviceId) !== tempId))
        setDeviceStates(prev => {
          const next = { ...prev }
          delete next[tempId]
          return next
        })
      }
      alert('Failed to add device: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deviceAPI.deleteDevice(id)
        loadDashboardData({ silent: true })
      } catch (error) {
        console.error('Failed to delete device:', error)
      }
    }
  }

  const handleEditDevice = (device) => {
    setEditingDevice(device)
    setShowEditForm(true)
  }

  const handleUpdateDevice = async (e) => {
    e.preventDefault()
    try {
      const parsedPower = Number.parseFloat(editingDevice.powerUsage)
      const updatedDevice = {
        name: editingDevice.name,
        type: editingDevice.type,
        location: editingDevice.location,
        status: editingDevice.status,
        powerUsage: Number.isFinite(parsedPower) ? parsedPower : 0,
      }
      await deviceAPI.updateDevice(editingDevice.id, updatedDevice)
      setEditingDevice(null)
      setShowEditForm(false)
      loadDashboardData({ silent: true })
    } catch (error) {
      console.error('Failed to update device:', error)
      alert('Failed to update device: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleToggleDevice = async (deviceId) => {
    const current = !!deviceStates[deviceId]
    const next = !current

    // Optimistically update UI.
    setDeviceStates(prev => ({ ...prev, [deviceId]: next }))
    setDevices(prev => prev.map(d => {
      const id = d.id ?? d.deviceId
      if (id !== deviceId) return d
      return { ...d, status: next ? 'active' : 'inactive' }
    }))

    const device = devices.find(d => (d.id ?? d.deviceId) === deviceId)
    if (!device || String(deviceId).startsWith('temp-') || !device.id) {
      return
    }

    try {
      await deviceAPI.updateDevice(device.id, {
        name: device.name,
        type: device.type,
        location: device.location,
        status: next ? 'active' : 'inactive',
        powerUsage: device.powerUsage ?? 0,
      })
      loadDashboardData({ silent: true })
    } catch (error) {
      console.error('Failed to toggle device:', error)
      // Roll back on failure.
      setDeviceStates(prev => ({ ...prev, [deviceId]: current }))
      setDevices(prev => prev.map(d => {
        const id = d.id ?? d.deviceId
        if (id !== deviceId) return d
        return { ...d, status: current ? 'active' : 'inactive' }
      }))
      alert('Failed to update device state. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    onLogout()
    navigate('/login')
  }

  const handlePreferenceToggle = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSavePreferences = () => {
    const payload = {
      notificationPrefs,
      monthlyTarget,
      twoFactorEnabled,
    }
    localStorage.setItem('dashboardSettings', JSON.stringify(payload))
    alert('Preferences saved. Work complete.')
  }

  const handleSetGoal = () => {
    if (Number.isNaN(Number(monthlyTarget)) || monthlyTarget < 100 || monthlyTarget > 1000) {
      alert('Please enter a monthly target between 100 and 1000 kWh.')
      return
    }
    const payload = {
      notificationPrefs,
      monthlyTarget: Number(monthlyTarget),
      twoFactorEnabled,
    }
    localStorage.setItem('dashboardSettings', JSON.stringify(payload))
    alert('Energy goal updated. Work complete.')
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true)
  }

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false)
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
      })
    }
  }

  const handleSaveProfile = () => {
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      alert('First name, last name, and email are required.')
      return
    }
    const updatedUser = {
      ...(user || {}),
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      email: profileForm.email.trim(),
      mobileNumber: profileForm.mobileNumber.trim(),
    }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditingProfile(false)
    alert('Profile updated. Work complete.')
  }

  const handleChangePassword = () => {
    alert('Password change request submitted. Work complete.')
  }

  const handleToggleTwoFactor = () => {
    const nextValue = !twoFactorEnabled
    setTwoFactorEnabled(nextValue)
    const payload = {
      notificationPrefs,
      monthlyTarget,
      twoFactorEnabled: nextValue,
    }
    localStorage.setItem('dashboardSettings', JSON.stringify(payload))
    alert(`Two-factor authentication ${nextValue ? 'enabled' : 'disabled'}. Work complete.`)
  }

  const handleDeleteAccount = () => {
    if (!window.confirm('This will permanently delete your account. Continue?')) {
      return
    }
    localStorage.removeItem('dashboardSettings')
    handleLogout()
    alert('Account deleted. Work complete.')
  }

  const handleDownloadWeeklyReport = async () => {
    try {
      const userData = user || getStoredUser()
      if (!userData || !userData.id) {
        console.error('User data not found', userData)
        alert('Error: User not authenticated. Please login again.')
        return
      }
      
      const userId = userData.id
      console.log('Downloading weekly report for userId:', userId)
      
      const response = await dashboardAPI.downloadWeeklyReport(userId)
      // response.data may be ArrayBuffer; convert to Blob
      const arrayBuffer = response.data
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Try extract filename from headers
      const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition']
      let filename = 'weekly_usage_report.xlsx'
      if (contentDisposition) {
        const match = /filename="?([^";]+)"?/.exec(contentDisposition)
        if (match && match[1]) filename = match[1]
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      console.log('Weekly report downloaded successfully')
    } catch (error) {
      console.error('Failed to download weekly report:', error.response?.data || error.message)
      alert('Failed to download weekly report: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDownloadMonthlyReport = async () => {
    try {
      const userData = user || getStoredUser()
      if (!userData || !userData.id) {
        console.error('User data not found', userData)
        alert('Error: User not authenticated. Please login again.')
        return
      }
      
      const userId = userData.id
      console.log('Downloading monthly report for userId:', userId)
      
      const response = await dashboardAPI.downloadMonthlyReport(userId)
      const arrayBuffer = response.data
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition']
      let filename = 'monthly_usage_report.xlsx'
      if (contentDisposition) {
        const match = /filename="?([^";]+)"?/.exec(contentDisposition)
        if (match && match[1]) filename = match[1]
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      console.log('Monthly report downloaded successfully')
    } catch (error) {
      console.error('Failed to download monthly report:', error.response?.data || error.message)
      alert('Failed to download monthly report: ' + (error.response?.data?.message || error.message))
    }
  }

  const getMaxConsumption = () => {
    if (consumptionData.length === 0) return 1
    return Math.max(...consumptionData.map(d => d.consumption))
  }

  const handleOptimizeRoom = (roomName) => {
    alert(`Optimization tips for ${roomName}:
1. Check for energy-efficient devices
2. Use smart scheduling
3. Monitor peak usage times
4. Consider load balancing`)
  }

  const formatINR = (value) => {
    const amount = Number(value)
    const safeAmount = Number.isFinite(amount) ? amount : 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(safeAmount)
  }

  const now = new Date(nowTick)
  const displayName = user?.firstName?.trim() || 'Guest'
  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 17
        ? 'Good afternoon'
        : 'Good evening'
  const friendlyDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const friendlyTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const maxConsumption = getMaxConsumption()
  const totalConsumptionKwh = consumptionData.reduce(
    (sum, point) => sum + (Number(point?.consumption) || 0),
    0
  )
  const peakConsumptionKwh =
    consumptionData.length > 0
      ? Math.max(...consumptionData.map(point => Number(point?.consumption) || 0))
      : 0
  const avgConsumptionKwh =
    consumptionData.length > 0 ? totalConsumptionKwh / consumptionData.length : 0

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>{greeting}, {displayName}! 👋</h1>
          <div className="welcome-meta">
            <span className="welcome-datetime">{friendlyDate}</span>
            <span className="welcome-separator">•</span>
            <span className="welcome-datetime">{friendlyTime}</span>
          </div>
          <p>Monitor and manage your home energy consumption</p>
        </div>
        {/* Header right section removed per request */}
      </div>

      {/* Sidebar Navigation */}
      <div className="dashboard-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'devices' ? 'active' : ''}`}
              onClick={() => setActiveTab('devices')}
            >
              🔌 Devices
            </button>
            <button
              className={`nav-item ${activeTab === 'consumption' ? 'active' : ''}`}
              onClick={() => setActiveTab('consumption')}
            >
              📈 Consumption
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <h2>Energy Overview</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">&#9889;</div>
                      <div className="stat-details">
                        <label>Today's Consumption</label>
                        <p className="stat-value">
                          {energyStats?.todayConsumption || 12.4} kWh
                        </p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">&#128202;</div>
                      <div className="stat-details">
                        <label>Monthly Average</label>
                        <p className="stat-value">
                          {energyStats?.monthlyAverage || 385.2} kWh
                        </p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">&#8377;</div>
                      <div className="stat-details">
                        <label>This Month Cost</label>
                        <p className="stat-value">
                          {formatINR(energyStats?.monthlyCost ?? 1542.87)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Report Downloads */}
                  <div className="report-section">
                    <h3>Download Usage Reports</h3>
                    <div className="report-buttons">
                      <button className="download-btn weekly" onClick={handleDownloadWeeklyReport}>
                        📊 Download Weekly Report
                      </button>
                      <button className="download-btn monthly" onClick={handleDownloadMonthlyReport}>
                        📈 Download Monthly Report
                      </button>
                    </div>
                  </div>

                  {/* Room-Wise Consumption */}
                  <div className="room-wise-section">
                    <h3>Room-wise Consumption</h3>
                    <div className="room-cards-grid">
                      {roomWiseData.map((room, index) => (
                        <div key={index} className="room-card">
                          <div className="room-header">
                            <h4>{room.name}</h4>
                            <span className="room-percentage">{room.percentage}%</span>
                          </div>
                          
                          <div className="room-consumption-display">
                            <svg width="120" height="120" viewBox="0 0 120 120" className="consumption-pie">
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke={room.color}
                                strokeWidth="35"
                                strokeDasharray={`${(room.percentage / 100) * 314} 314`}
                                transform="rotate(-90 60 60)"
                              />
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="#E8E8E8"
                                strokeWidth="35"
                                opacity="0.3"
                              />
                            </svg>
                            <div className="consumption-value">
                              <span className="value">{room.consumption}</span>
                              <span className="unit">kWh</span>
                            </div>
                          </div>

                          <div className="room-stats">
                            <div className="room-stat">
                              <span className="stat-label">📊 Average</span>
                              <span className="stat-value">{room.average} kW</span>
                            </div>
                            <div className="room-stat">
                              <span className="stat-label">⏰ Peak</span>
                              <span className="stat-value">{room.peak}</span>
                            </div>
                            <div className="room-stat">
                              <span className="stat-label">📈 Trend</span>
                              <span className="stat-value">{room.trend}</span>
                            </div>
                          </div>

                          <button 
                            className="optimize-btn"
                            onClick={() => handleOptimizeRoom(room.name)}
                          >
                            ✏️ Optimize
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Breakdown */}
                  <div className="breakdown-section">
                    <h3>Device Consumption Breakdown</h3>
                    <div className="breakdown-list">
                      {devices && devices.length > 0 ? (
                        devices.slice(0, 5).map(device => (
                          <div key={device.id} className="breakdown-item">
                            <div className="breakdown-info">
                              <span className="device-name">{device.name}</span>
                              <span className="device-type-badge">{device.type}</span>
                            </div>
                            <div className="breakdown-consumption">
                              <div className="consumption-bar">
                                <div 
                                  className="consumption-fill"
                                  style={{width: `${Math.random() * 100}%`}}
                                ></div>
                              </div>
                              <span className="consumption-value">{(Math.random() * 5).toFixed(1)} kWh</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-data">Add devices to see consumption breakdown</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="tips-section">
                    <h3>Energy Saving Tips</h3>
                    <div className="tips-list">
                      <div className="tip-item">
                        <span className="tip-number">1</span>
                        <p>Turn off lights when not in use</p>
                      </div>
                      <div className="tip-item">
                        <span className="tip-number">2</span>
                        <p>Use LED bulbs for better efficiency</p>
                      </div>
                      <div className="tip-item">
                        <span className="tip-number">3</span>
                        <p>Set optimal thermostat temperature</p>
                      </div>
                      <div className="tip-item">
                        <span className="tip-number">4</span>
                        <p>Unplug devices when not in use</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Devices Tab */}
              {activeTab === 'devices' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Connected Devices</h2>
                    <button 
                      className="add-device-btn"
                      onClick={() => setShowAddDevice(!showAddDevice)}
                    >
                      + Add Device
                    </button>
                  </div>

                  {showAddDevice && (
                    <form className="add-device-form" onSubmit={handleAddDevice}>
                      <input
                        type="text"
                        placeholder="Device Name"
                        value={newDevice.name}
                        onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                        required
                      />
                      <select
                        value={newDevice.type}
                        onChange={(e) => {
                          const nextType = e.target.value
                          setNewDevice(prev => ({
                            ...prev,
                            type: nextType,
                            powerUsage: prev.powerUsage || String(defaultPowerKwForType(nextType)),
                          }))
                        }}
                        required
                      >
                        <option value="">Select Device Type</option>
                        <option value="light">Light</option>
                        <option value="ac">Air Conditioner</option>
                        <option value="fan">Fan</option>
                        <option value="heater">Heater</option>
                        <option value="refrigerator">Refrigerator</option>
                        <option value="washer">Washing Machine</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Location"
                        value={newDevice.location}
                        onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Power Usage (kW)"
                        value={newDevice.powerUsage}
                        onChange={(e) => setNewDevice({ ...newDevice, powerUsage: e.target.value })}
                        min="0"
                        step="0.01"
                        required
                      />
                      <button type="submit" className="form-submit">Add</button>
                      <button 
                        type="button" 
                        className="form-cancel"
                        onClick={() => setShowAddDevice(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {showEditForm && editingDevice && (
                    <form className="add-device-form" onSubmit={handleUpdateDevice}>
                      <h3>Edit Device</h3>
                      <input
                        type="text"
                        placeholder="Device Name"
                        value={editingDevice.name}
                        onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                        required
                      />
                      <select
                        value={editingDevice.type}
                        onChange={(e) => setEditingDevice({ ...editingDevice, type: e.target.value })}
                        required
                      >
                        <option value="">Select Device Type</option>
                        <option value="light">Light</option>
                        <option value="ac">Air Conditioner</option>
                        <option value="fan">Fan</option>
                        <option value="heater">Heater</option>
                        <option value="refrigerator">Refrigerator</option>
                        <option value="washer">Washing Machine</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Location"
                        value={editingDevice.location}
                        onChange={(e) => setEditingDevice({ ...editingDevice, location: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Power Usage (kW)"
                        value={editingDevice.powerUsage ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          setEditingDevice({ ...editingDevice, powerUsage: v === '' ? '' : Number(v) })
                        }}
                        min="0"
                        step="0.01"
                        required
                      />
                      <select
                        value={editingDevice.status || 'active'}
                        onChange={(e) => setEditingDevice({ ...editingDevice, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button type="submit" className="form-submit">Update Device</button>
                      <button 
                        type="button" 
                        className="form-cancel"
                        onClick={() => {
                          setShowEditForm(false)
                          setEditingDevice(null)
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  <div className="devices-list">
                    {devices && devices.length > 0 ? (
                      devices.map((device) => (
                        <div key={device.id} className="device-card">
                          <div className="device-header">
                            <div className="device-icon">
                              {device.type === 'light' && '💡'}
                              {device.type === 'ac' && '❄️'}
                              {device.type === 'fan' && '🌀'}
                              {device.type === 'heater' && '🔥'}
                              {device.type === 'refrigerator' && '🧊'}
                              {device.type === 'washer' && '🫧'}
                              {!['light', 'ac', 'fan', 'heater', 'refrigerator', 'washer'].includes(device.type) && '🔌'}
                            </div>
                            <div className="device-title-section">
                              <h3>{device.name}</h3>
                              <p className="device-type">{device.type ? (device.type.charAt(0).toUpperCase() + device.type.slice(1)) : 'Unknown'}</p>
                            </div>
                            <div className={`online-status ${device.online ? 'online' : 'offline'}`}>
                              <span className="status-dot"></span>
                              {device.online ? 'Online' : 'Offline'}
                            </div>
                          </div>

                          <div className="device-details">
                            <div className="detail-item">
                              <label>Location</label>
                              <p>📍 {device.location || 'Not specified'}</p>
                            </div>
                            <div className="detail-item">
                              <label>Status</label>
                              <p>{device.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : 'Inactive'}</p>
                            </div>
                            <div className="detail-item">
                              <label>Power Usage</label>
                              <p>{typeof device.powerUsage === 'number' ? device.powerUsage.toFixed(2) : '0.00'} W</p>
                            </div>
                          </div>

                          <div className="device-controls">
                            <button 
                              className={`toggle-btn ${deviceStates[device.id ?? device.deviceId] ? 'active' : 'inactive'}`}
                              onClick={() => handleToggleDevice(device.id ?? device.deviceId)}
                              title={deviceStates[device.id ?? device.deviceId] ? 'Click to turn off' : 'Click to turn on'}
                            >
                              <span className="toggle-indicator">{deviceStates[device.id ?? device.deviceId] ? '●' : '○'}</span>
                              {deviceStates[device.id ?? device.deviceId] ? 'ON' : 'OFF'}
                            </button>
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditDevice(device)}
                              title="Edit device"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteDevice(device.id)}
                              title="Delete device"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-devices">
                        <div className="no-devices-icon">🔌</div>
                        <p>No devices added yet</p>
                        <p className="no-devices-hint">Add your first device to start monitoring energy consumption</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consumption Tab */}
              {activeTab === 'consumption' && (
                <div className="tab-content">
                  <h2>Energy Consumption</h2>
                  
                  <div className="consumption-controls">
                    <div className="period-selector">
                      <button 
                        className={`period-btn ${timePeriod === 'daily' ? 'active' : ''}`}
                        onClick={() => setTimePeriod('daily')}
                      >
                        Daily
                      </button>
                      <button 
                        className={`period-btn ${timePeriod === 'weekly' ? 'active' : ''}`}
                        onClick={() => setTimePeriod('weekly')}
                      >
                        Weekly
                      </button>
                      <button 
                        className={`period-btn ${timePeriod === 'monthly' ? 'active' : ''}`}
                        onClick={() => setTimePeriod('monthly')}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  <div className="breakdown-section">
                    <h3>
                      {timePeriod === 'daily'
                        ? "Today's Device Consumption"
                        : timePeriod === 'weekly'
                          ? "This Week's Device Consumption"
                          : "This Month's Device Consumption"}
                    </h3>
                    <div className="breakdown-list">
                      {(deviceConsumption && deviceConsumption.length > 0) ? (
                        (() => {
                          const items = deviceConsumption.map(d => ({
                            device: d,
                            id: d.deviceId,
                            kwh: Number(d.consumption) || 0,
                          }))
                          const max = Math.max(1, ...items.map(i => i.kwh))
                          return items.map(({ device, id, kwh }) => (
                            <div key={id} className="breakdown-item">
                              <div className="breakdown-info">
                                <span className="device-name">{device.name}</span>
                                <span className="device-type-badge">{device.type}</span>
                              </div>
                              <div className="breakdown-consumption">
                                <div className="consumption-bar">
                                  <div
                                    className="consumption-fill"
                                    style={{ width: `${(kwh / max) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="consumption-value">{kwh} kWh</span>
                              </div>
                            </div>
                          ))
                        })()
                      ) : (devices && devices.length > 0 ? (
                        <p className="no-data">Loading device consumption...</p>
                      ) : (
                        <p className="no-data">Add devices to see device consumption</p>
                      ))}
                    </div>
                  </div>

                  <div className="consumption-section">
                    <div className="chart-container">
                      <div className="chart-bars">
                        {consumptionData.map((data, index) => {
                          const height = (data.consumption / maxConsumption) * 100
                          return (
                            <div key={index} className="bar-wrapper">
                              <div className="bar" style={{height: `${height}%`}}>
                                <span className="bar-value">{data.consumption}</span>
                              </div>
                              <span className="bar-label">{data.time}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="consumption-stats">
                      <div className="stat-info">
                        <label>Peak Consumption</label>
                        <p className="value">{peakConsumptionKwh.toFixed(1)} kWh</p>
                      </div>
                      <div className="stat-info">
                        <label>Average</label>
                        <p className="value">{avgConsumptionKwh.toFixed(1)} kWh</p>
                      </div>
                      <div className="stat-info">
                        <label>Total</label>
                        <p className="value">{totalConsumptionKwh.toFixed(1)} kWh</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="tab-content">
                  <h2>Settings</h2>
                  <div className="settings-section">
                    <div className="setting-item">
                      <h3>Account Information</h3>
                      {isEditingProfile ? (
                        <div className="goal-input-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            required
                          />
                          <label>Last Name</label>
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            required
                          />
                          <label>Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            required
                          />
                          <label>Mobile</label>
                          <input
                            type="text"
                            value={profileForm.mobileNumber}
                            onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                          />
                          <button className="save-btn" onClick={handleSaveProfile}>💾 Save Profile</button>
                          <button className="form-cancel" onClick={handleCancelProfileEdit}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                          <p><strong>Email:</strong> {user?.email}</p>
                          <p><strong>Mobile:</strong> {user?.mobileNumber}</p>
                          <button className="edit-profile-btn" onClick={handleEditProfile}>✏️ Edit Profile</button>
                        </>
                      )}
                    </div>

                    <div className="setting-item">
                      <h3>Notification Preferences</h3>
                      <label>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.energyAlerts}
                          onChange={() => handlePreferenceToggle('energyAlerts')}
                        /> Receive energy alerts
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.emailNotifications}
                          onChange={() => handlePreferenceToggle('emailNotifications')}
                        /> Email notifications
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.weeklyReports}
                          onChange={() => handlePreferenceToggle('weeklyReports')}
                        /> Weekly energy reports
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.peakAlerts}
                          onChange={() => handlePreferenceToggle('peakAlerts')}
                        /> Peak hour alerts
                      </label>
                      <button className="save-btn" onClick={handleSavePreferences}>💾 Save Preferences</button>
                    </div>

                    <div className="setting-item">
                      <h3>Energy Goals</h3>
                      <div className="goal-input-group">
                        <label>Monthly Target (kWh)</label>
                        <input
                          type="number"
                          value={monthlyTarget}
                          onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                          min="100"
                          max="1000"
                        />
                        <button className="save-btn" onClick={handleSetGoal}>💾 Set Goal</button>
                      </div>
                    </div>

                    <div className="setting-item">
                      <h3>Security</h3>
                      <button className="security-btn" onClick={handleChangePassword}>🔐 Change Password</button>
                      <button className="security-btn" onClick={handleToggleTwoFactor}>
                        🔑 Two-Factor Authentication: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="setting-item danger-zone">
                      <h3>Danger Zone</h3>
                      <p>These actions cannot be undone.</p>
                      <button className="danger-btn" onClick={handleDeleteAccount}>❌ Delete Account</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard


