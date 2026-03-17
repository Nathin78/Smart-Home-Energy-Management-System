import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, deviceAPI, dashboardAPI, roomAPI, userAPI } from '../services/api'
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
  const [newRoomName, setNewRoomName] = useState('')
  const [addingRoom, setAddingRoom] = useState(false)
  const [deviceConsumption, setDeviceConsumption] = useState([])
  const [notificationPrefs, setNotificationPrefs] = useState({
    energyAlerts: true,
    emailNotifications: true,
    weeklyReports: true,
    peakAlerts: false,
  })
  const [monthlyTarget, setMonthlyTarget] = useState(350)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [changePasswordEmail, setChangePasswordEmail] = useState('')
  const [changePasswordOtp, setChangePasswordOtp] = useState('')
  const [changePasswordNewPassword, setChangePasswordNewPassword] = useState('')
  const [changePasswordConfirmPassword, setChangePasswordConfirmPassword] = useState('')
  const [changePasswordStatus, setChangePasswordStatus] = useState('')
  const [changePasswordSendingOtp, setChangePasswordSendingOtp] = useState(false)
  const [changePasswordSaving, setChangePasswordSaving] = useState(false)
  const [changePasswordOtpSent, setChangePasswordOtpSent] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    profilePhoto: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    dateOfBirth: '',
    occupation: '',
    bio: '',
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
      } catch (error) {
        console.warn('Failed to parse dashboard settings:', error)
      }
    }
  }, [])

  const loadPreferencesFromServer = async (userId) => {
    if (!userId) return
    try {
      const res = await dashboardAPI.getPreferences(userId)
      const prefs = res?.data || {}
      setNotificationPrefs(prev => ({
        ...prev,
        energyAlerts: typeof prefs.energyAlerts === 'boolean' ? prefs.energyAlerts : prev.energyAlerts,
        emailNotifications: typeof prefs.emailNotifications === 'boolean' ? prefs.emailNotifications : prev.emailNotifications,
        weeklyReports: typeof prefs.weeklyReports === 'boolean' ? prefs.weeklyReports : prev.weeklyReports,
        peakAlerts: typeof prefs.peakAlerts === 'boolean' ? prefs.peakAlerts : prev.peakAlerts,
      }))
      if (typeof prefs.monthlyTargetKwh === 'number') {
        setMonthlyTarget(prefs.monthlyTargetKwh)
      }
    } catch (e) {
      // Keep localStorage preferences as fallback
      console.warn('Failed to load preferences from server:', e?.message || e)
    }
  }

  useEffect(() => {
    loadConsumptionData(timePeriod)
  }, [timePeriod, user?.id])

  useEffect(() => {
    const userData = user || getStoredUser()
    const userId = userData?.id
    if (!userId) return
    loadPreferencesFromServer(userId)
  }, [user?.id])

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
        profilePhoto: user.profilePhoto || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        dateOfBirth: user.dateOfBirth || '',
        occupation: user.occupation || '',
        bio: user.bio || '',
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
      if (userId) {
        try {
          const roomRes = await dashboardAPI.getRoomWise(userId)
          setRoomWiseData(roomRes.data || [])
        } catch (e) {
          console.warn('Failed to load room-wise data:', e?.message || e)
          setRoomWiseData([])
        }
      }
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

  const handleSavePreferences = async () => {
    const payload = {
      notificationPrefs,
      monthlyTarget,
    }
    localStorage.setItem('dashboardSettings', JSON.stringify(payload))

    const userData = user || getStoredUser()
    const userId = userData?.id
    if (userId) {
      try {
        await dashboardAPI.savePreferences(userId, {
          energyAlerts: notificationPrefs.energyAlerts,
          emailNotifications: notificationPrefs.emailNotifications,
          weeklyReports: notificationPrefs.weeklyReports,
          peakAlerts: notificationPrefs.peakAlerts,
          monthlyTargetKwh: Number(monthlyTarget),
        })
      } catch (e) {
        console.warn('Failed to save preferences to server:', e?.message || e)
        alert('Preferences saved locally, but failed to save to server. Please try again.')
        return
      }
    }

    alert('Preferences saved. Work complete.')
  }

  const handleSetGoal = async () => {
    if (Number.isNaN(Number(monthlyTarget)) || monthlyTarget < 100 || monthlyTarget > 1000) {
      alert('Please enter a monthly target between 100 and 1000 kWh.')
      return
    }
    const payload = {
      notificationPrefs,
      monthlyTarget: Number(monthlyTarget),
    }
    localStorage.setItem('dashboardSettings', JSON.stringify(payload))

    const userData = user || getStoredUser()
    const userId = userData?.id
    if (userId) {
      try {
        await dashboardAPI.savePreferences(userId, {
          energyAlerts: notificationPrefs.energyAlerts,
          emailNotifications: notificationPrefs.emailNotifications,
          weeklyReports: notificationPrefs.weeklyReports,
          peakAlerts: notificationPrefs.peakAlerts,
          monthlyTargetKwh: Number(monthlyTarget),
        })
      } catch (e) {
        console.warn('Failed to save goal to server:', e?.message || e)
        alert('Energy goal updated locally, but failed to save to server. Please try again.')
        return
      }
    }

    alert('Energy goal updated. Work complete.')
  }

  const handleAddRoom = async (e) => {
    e.preventDefault()
    const name = newRoomName.trim()
    if (!name) {
      alert('Please enter a room name.')
      return
    }
    const userData = user || getStoredUser()
    const userId = userData?.id
    if (!userId) {
      alert('Please log in again to add rooms.')
      return
    }
    setAddingRoom(true)
    try {
      await roomAPI.addRoom(userId, name)
      setNewRoomName('')
      const roomRes = await dashboardAPI.getRoomWise(userId)
      setRoomWiseData(roomRes.data || [])
      alert('Room added.')
    } catch (e) {
      console.warn('Failed to add room:', e?.message || e)
      alert(e?.response?.data?.message || 'Failed to add room. Please try again.')
    } finally {
      setAddingRoom(false)
    }
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
        profilePhoto: user.profilePhoto || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        dateOfBirth: user.dateOfBirth || '',
        occupation: user.occupation || '',
        bio: user.bio || '',
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      alert('First name, last name, and email are required.')
      return
    }
    const userData = user || getStoredUser()
    const userId = userData?.id
    if (!userId) {
      alert('User not authenticated. Please login again.')
      return
    }

    setProfileSaving(true)
    try {
      const payload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        mobileNumber: profileForm.mobileNumber.trim(),
        profilePhoto: profileForm.profilePhoto || '',
        addressLine1: profileForm.addressLine1.trim(),
        addressLine2: profileForm.addressLine2.trim(),
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        postalCode: profileForm.postalCode.trim(),
        country: profileForm.country.trim(),
        dateOfBirth: profileForm.dateOfBirth,
        occupation: profileForm.occupation.trim(),
        bio: profileForm.bio.trim(),
      }
      const response = await userAPI.updateProfile(userId, payload)
      const updatedUser = response?.data?.user || response?.data || userData
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditingProfile(false)
      alert(response?.data?.message || 'Profile updated. Work complete.')
    } catch (error) {
      const message = extractApiErrorMessage(error) || 'Failed to update profile.'
      alert(message)
    } finally {
      setProfileSaving(false)
    }
  }

  const persistProfilePhoto = async (nextPhoto) => {
    const baseUser = user || getStoredUser() || {}
    if (!baseUser?.id) return
    try {
      const response = await userAPI.updateProfile(baseUser.id, { profilePhoto: nextPhoto || '' })
      const updatedUser = response?.data?.user || response?.data || baseUser
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.warn('Failed to save profile photo:', error)
      alert(extractApiErrorMessage(error) || 'Failed to update profile photo.')
    }
  }

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      event.target.value = ''
      return
    }

    const maxSizeMb = 2
    if (file.size > maxSizeMb * 1024 * 1024) {
      alert(`Image is too large. Please select a file under ${maxSizeMb}MB.`)
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setProfileForm(prev => ({
        ...prev,
        profilePhoto: result,
      }))
      if (!isEditingProfile) {
        persistProfilePhoto(result)
      }
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveProfilePhoto = () => {
    setProfileForm(prev => ({
      ...prev,
      profilePhoto: '',
    }))
    if (!isEditingProfile) {
      persistProfilePhoto('')
    }
  }

  const getInitials = (firstName, lastName) => {
    const first = (firstName || '').trim()
    const last = (lastName || '').trim()
    const firstInitial = first ? first[0].toUpperCase() : ''
    const lastInitial = last ? last[0].toUpperCase() : ''
    const initials = `${firstInitial}${lastInitial}`.trim()
    return initials || 'U'
  }

  const getAddressSummary = (data) => {
    const parts = [
      data?.addressLine1,
      data?.addressLine2,
      data?.city,
      data?.state,
      data?.postalCode,
      data?.country,
    ].map(part => (part || '').trim()).filter(Boolean)
    return parts.join(', ')
  }

  const extractApiErrorMessage = (error) => {
    const data = error?.response?.data
    if (!data) return error?.message
    if (typeof data === 'string') return data
    return data?.message || error?.message
  }

  const resetChangePasswordState = (email) => {
    setChangePasswordEmail(email || '')
    setChangePasswordOtp('')
    setChangePasswordNewPassword('')
    setChangePasswordConfirmPassword('')
    setChangePasswordStatus('')
    setChangePasswordOtpSent(false)
    setChangePasswordSendingOtp(false)
    setChangePasswordSaving(false)
  }

  const handleChangePassword = () => {
    const userData = user || getStoredUser()
    const email = userData?.email?.trim()
    if (!email) {
      alert('Error: email not found for this account.')
      return
    }
    resetChangePasswordState(email)
    setChangePasswordOpen(true)
  }

  const handleSendChangePasswordOtp = async () => {
    if (!changePasswordEmail) return
    setChangePasswordSendingOtp(true)
    setChangePasswordStatus('')
    try {
      const response = await authAPI.forgotPassword(changePasswordEmail)
      setChangePasswordOtpSent(true)
      setChangePasswordStatus(response?.data?.message || 'Verification code sent to your email.')
    } catch (error) {
      setChangePasswordStatus(extractApiErrorMessage(error) || 'Failed to send verification code.')
    } finally {
      setChangePasswordSendingOtp(false)
    }
  }

  const handleSubmitNewPassword = async () => {
    const otp = changePasswordOtp.trim()
    const newPassword = changePasswordNewPassword
    const confirm = changePasswordConfirmPassword

    if (!changePasswordOtpSent) {
      setChangePasswordStatus('Please send the verification code first.')
      return
    }
    if (!otp) {
      setChangePasswordStatus('Please enter the verification code (OTP).')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setChangePasswordStatus('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirm) {
      setChangePasswordStatus('New password and confirm password do not match.')
      return
    }

    setChangePasswordSaving(true)
    setChangePasswordStatus('')
    try {
      const response = await authAPI.verifyResetOTP(otp, newPassword)
      const message = response?.data?.message || 'Password changed successfully.'
      setChangePasswordStatus(message)
      alert(message)
      setChangePasswordOpen(false)
      resetChangePasswordState(changePasswordEmail)
    } catch (error) {
      setChangePasswordStatus(extractApiErrorMessage(error) || 'Failed to change password.')
    } finally {
      setChangePasswordSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    if (!window.confirm('This will permanently delete your account. Continue?')) {
      return
    }
    localStorage.removeItem('dashboardSettings')
    handleLogout()
    alert('Account deleted. Work complete.')
  }

  const handleDownloadDailyReport = async () => {
    try {
      const userData = user || getStoredUser()
      if (!userData || !userData.id) {
        console.error('User data not found', userData)
        alert('Error: User not authenticated. Please login again.')
        return
      }

      const userId = userData.id
      console.log('Downloading daily report for userId:', userId)

      const response = await dashboardAPI.downloadDailyReport(userId)
      const arrayBuffer = response.data
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition']
      let filename = 'daily_usage_report.xlsx'
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
      console.log('Daily report downloaded successfully')
    } catch (error) {
      const message = extractDownloadErrorMessage(error) || error.message
      console.error('Failed to download daily report:', message)
      alert('Failed to download daily report: ' + message)
    }
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
      const message = extractDownloadErrorMessage(error) || error.message
      console.error('Failed to download weekly report:', message)
      alert('Failed to download weekly report: ' + message)
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
      const message = extractDownloadErrorMessage(error) || error.message
      console.error('Failed to download monthly report:', message)
      alert('Failed to download monthly report: ' + message)
    }
  }

  const extractDownloadErrorMessage = (error) => {
    const data = error?.response?.data
    if (!data) return error?.response?.statusText

    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return parsed?.message || data
      } catch {
        return data
      }
    }

    if (data instanceof ArrayBuffer) {
      const text = new TextDecoder('utf-8').decode(new Uint8Array(data))
      try {
        const parsed = JSON.parse(text)
        return parsed?.message || text
      } catch {
        return text || error?.response?.statusText
      }
    }

    if (ArrayBuffer.isView(data)) {
      const text = new TextDecoder('utf-8').decode(data)
      try {
        const parsed = JSON.parse(text)
        return parsed?.message || text
      } catch {
        return text || error?.response?.statusText
      }
    }

    return data?.message || error?.response?.statusText
  }

  const getMaxConsumption = () => {
    if (consumptionData.length === 0) return 1
    return Math.max(...consumptionData.map(d => d.consumption))
  }

  const handleOptimizeRoom = (room) => {
    if (!room) {
      alert('No room data available yet. Please wait for the dashboard to load.')
      return
    }

    const tips = []
    const pct = Number(room.percentage) || 0
    const kwh = Number(room.consumption) || 0
    const trend = String(room.trend || '').toLowerCase()
    const peakWindow = String(room.peak || '')

    if (pct >= 30) tips.push(`High usage room (${pct}%): reduce runtime of high-power devices and avoid peak hours when possible.`)
    if (kwh >= 6) tips.push(`High daily usage (~${kwh} kWh): consider switching to energy-efficient devices or lowering setpoints.`)
    if (trend === 'increasing') tips.push('Usage trend is increasing: check for devices left on, new appliances, or schedule changes.')
    if (trend === 'decreasing') tips.push('Good job—usage is decreasing. Keep automation schedules and standby power controls enabled.')

    if (peakWindow) tips.push(`Peak window: ${peakWindow}. Try shifting flexible loads outside this time.`)

    const roomName = String(room.name || 'this room')
    const normalizedName = roomName.toLowerCase()
    if (normalizedName.includes('kitchen')) {
      tips.push('Kitchen tip: keep refrigerator vents clear, avoid frequent door opening, and run heavy appliances in off-peak hours.')
    } else if (normalizedName.includes('bedroom')) {
      tips.push('Bedroom tip: use AC sleep mode, clean filters, and set a timer to prevent overnight overuse.')
    } else if (normalizedName.includes('office')) {
      tips.push('Office tip: enable power-saving on laptops/PCs and use smart plugs to cut standby power after work hours.')
    } else if (normalizedName.includes('bath')) {
      tips.push('Bathroom tip: limit water-heater runtime and consider scheduling it only during required hours.')
    }

    if (peakConsumptionKwh > 0 && avgConsumptionKwh > 0 && peakConsumptionKwh > avgConsumptionKwh * 2) {
      tips.push('Your overall consumption has strong spikes—consider staggering device start times to avoid simultaneous loads.')
    }

    if (tips.length === 0) {
      tips.push('Enable smart scheduling, avoid unnecessary standby loads, and monitor peak usage hours.')
    }

    alert(`Optimization tips for ${roomName}:\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`)
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
              className={`nav-item ${activeTab === 'roomwise' ? 'active' : ''}`}
              onClick={() => setActiveTab('roomwise')}
            >
              &#127968; Room-wise Consumption
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
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              &#128229; Download Reports
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              &#128100; Profile
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
                      <div className="stat-icon">&#9889;</div>
                      <div className="stat-details">
                        <label>Weekly Consumption</label>
                        <p className="stat-value">
                          {energyStats?.weeklyConsumption ?? 78.4} kWh
                        </p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">&#9889;</div>
                      <div className="stat-details">
                        <label>Monthly Consumption</label>
                        <p className="stat-value">
                          {energyStats?.monthlyConsumption ?? 312.6} kWh
                        </p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">&#8377;</div>
                      <div className="stat-details">
                        <label>Today Cost</label>
                        <p className="stat-value">
                          {formatINR(energyStats?.dailyCost ?? 42.15)}
                        </p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">&#8377;</div>
                      <div className="stat-details">
                        <label>Weekly Cost</label>
                        <p className="stat-value">
                          {formatINR(energyStats?.weeklyCost ?? 298.54)}
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
                  {false && (
                    <div className="report-section">
                    <h3>Download Usage Reports</h3>
                    <div className="report-buttons">
                      <button className="download-btn daily" onClick={handleDownloadDailyReport}>
                        📅 Download Daily Report
                      </button>
                      <button className="download-btn weekly" onClick={handleDownloadWeeklyReport}>
                        📊 Download Weekly Report
                      </button>
                      <button className="download-btn monthly" onClick={handleDownloadMonthlyReport}>
                        📈 Download Monthly Report
                      </button>
                    </div>
                    </div>
                  )}

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

              {/* Room-wise Tab */}
              {activeTab === 'roomwise' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Room-wise Consumption</h2>
                  </div>
                  <form className="room-add-form" onSubmit={handleAddRoom}>
                    <input
                      type="text"
                      placeholder="Enter room name (e.g., Living Room)"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      maxLength="60"
                      disabled={addingRoom}
                      required
                    />
                    <button type="submit" className="room-add-btn" disabled={addingRoom}>
                      {addingRoom ? 'Adding...' : 'Add Room'}
                    </button>
                  </form>
                  <div className="room-wise-section">
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
                                stroke={room.color || '#8B5FBF'}
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
                              <span className="stat-label">Average</span>
                              <span className="stat-value">{room.average} kW</span>
                            </div>
                            <div className="room-stat">
                              <span className="stat-label">Peak</span>
                              <span className="stat-value">{room.peak}</span>
                            </div>
                            <div className="room-stat">
                              <span className="stat-label">Trend</span>
                              <span className="stat-value">{room.trend}</span>
                            </div>
                          </div>

                          <button 
                            className="optimize-btn"
                            onClick={() => handleOptimizeRoom(room)}
                          >
                            Optimize
                          </button>
                        </div>
                      ))}
                      {roomWiseData.length === 0 && (
                        <p className="no-data">Add rooms to start tracking room-wise consumption.</p>
                      )}
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

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="tab-content">
                  <h2>Reports</h2>
                  <div className="report-section">
                    <h3>Download Usage Reports</h3>
                    <div className="report-buttons">
                      <button className="download-btn daily" onClick={handleDownloadDailyReport}>
                        Download Daily Report
                      </button>
                      <button className="download-btn weekly" onClick={handleDownloadWeeklyReport}>
                        Download Weekly Report
                      </button>
                      <button className="download-btn monthly" onClick={handleDownloadMonthlyReport}>
                        Download Monthly Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  <h2>Profile</h2>
                  <div className="settings-section">
                    <div className="setting-item">
                      <h3>Account Information</h3>
                      <div className="profile-photo-row">
                        <div className="profile-photo-wrapper">
                          {profileForm.profilePhoto ? (
                            <img
                              src={profileForm.profilePhoto}
                              alt="Profile"
                              className="profile-photo"
                            />
                          ) : (
                            <div className="profile-photo placeholder">
                              {getInitials(profileForm.firstName, profileForm.lastName)}
                            </div>
                          )}
                        </div>
                        <div className="profile-photo-actions">
                          <label className="photo-upload-btn">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePhotoChange}
                            />
                            {profileForm.profilePhoto ? 'Change Photo' : 'Add Photo'}
                          </label>
                          {profileForm.profilePhoto ? (
                            <button className="photo-remove-btn" onClick={handleRemoveProfilePhoto} type="button">
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
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
                          <label>Date of Birth</label>
                          <input
                            type="date"
                            value={profileForm.dateOfBirth}
                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                          />
                          <label>Occupation</label>
                          <input
                            type="text"
                            value={profileForm.occupation}
                            onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                          />
                          <label>Address Line 1</label>
                          <input
                            type="text"
                            value={profileForm.addressLine1}
                            onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
                          />
                          <label>Address Line 2</label>
                          <input
                            type="text"
                            value={profileForm.addressLine2}
                            onChange={(e) => setProfileForm({ ...profileForm, addressLine2: e.target.value })}
                          />
                          <label>City</label>
                          <input
                            type="text"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          />
                          <label>State</label>
                          <input
                            type="text"
                            value={profileForm.state}
                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          />
                          <label>Postal Code</label>
                          <input
                            type="text"
                            value={profileForm.postalCode}
                            onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                          />
                          <label>Country</label>
                          <input
                            type="text"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                          />
                          <label>Bio</label>
                          <textarea
                            rows="3"
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          />
                          <button className="save-btn" onClick={handleSaveProfile} disabled={profileSaving}>
                            {profileSaving ? 'Saving...' : 'Save Profile'}
                          </button>
                          <button className="form-cancel" onClick={handleCancelProfileEdit}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                          <p><strong>Email:</strong> {user?.email}</p>
                          <p><strong>Mobile:</strong> {user?.mobileNumber}</p>
                          <p><strong>Date of Birth:</strong> {user?.dateOfBirth || 'Not set'}</p>
                          <p><strong>Occupation:</strong> {user?.occupation || 'Not set'}</p>
                          <p><strong>Address:</strong> {getAddressSummary(user) || 'Not set'}</p>
                          <p><strong>Bio:</strong> {user?.bio || 'Not set'}</p>
                          <button className="edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
                        </>
                      )}
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

          {changePasswordOpen && (
            <div
              className="modal-overlay"
              onClick={() => {
                setChangePasswordOpen(false)
                resetChangePasswordState(changePasswordEmail)
              }}
              role="presentation"
            >
              <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Change Password">
                <div className="modal-header">
                  <h3>Change Password</h3>
                  <button
                    className="modal-close"
                    onClick={() => {
                      setChangePasswordOpen(false)
                      resetChangePasswordState(changePasswordEmail)
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <p className="modal-hint">
                    We’ll send a verification code to <strong>{changePasswordEmail}</strong>.
                  </p>

                  <div className="modal-row">
                    <button className="save-btn" onClick={handleSendChangePasswordOtp} disabled={changePasswordSendingOtp} type="button">
                      {changePasswordSendingOtp ? 'Sending…' : (changePasswordOtpSent ? 'Resend Code' : 'Send Code')}
                    </button>
                  </div>

                  <div className="goal-input-group" style={{ marginTop: 16 }}>
                    <label>Verification Code (OTP)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={changePasswordOtp}
                      onChange={(e) => setChangePasswordOtp(e.target.value)}
                      placeholder="Enter OTP"
                    />
                  </div>

                  <div className="goal-input-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={changePasswordNewPassword}
                      onChange={(e) => setChangePasswordNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="goal-input-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={changePasswordConfirmPassword}
                      onChange={(e) => setChangePasswordConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                    />
                  </div>

                  {changePasswordStatus ? (
                    <div className="modal-status" aria-live="polite">
                      {changePasswordStatus}
                    </div>
                  ) : null}
                </div>

                <div className="modal-footer">
                  <button className="security-btn" onClick={handleSubmitNewPassword} disabled={changePasswordSaving} type="button">
                    {changePasswordSaving ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard


