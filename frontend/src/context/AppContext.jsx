import { createContext, useContext, useState, useCallback } from 'react'
import { productsApi, customersApi, ordersApi, dashboardApi } from '../services/api'
import toast from 'react-hot-toast'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState({})

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }))

  // Products
  const fetchProducts = useCallback(async (params) => {
    setLoad('products', true)
    try {
      const { data } = await productsApi.getAll(params)
      setProducts(data.data?.items || [])
      return data.data?.items || []
    } finally { setLoad('products', false) }
  }, [])

  const createProduct = useCallback(async (payload) => {
    const { data } = await productsApi.create(payload)
    toast.success(data.message)
    await fetchProducts()
    return data.data
  }, [fetchProducts])

  const updateProduct = useCallback(async (id, payload) => {
    const { data } = await productsApi.update(id, payload)
    toast.success(data.message)
    await fetchProducts()
    return data.data
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id) => {
    const { data } = await productsApi.delete(id)
    toast.success(data.message)
    await fetchProducts()
  }, [fetchProducts])

  // Customers
  const fetchCustomers = useCallback(async (params) => {
    setLoad('customers', true)
    try {
      const { data } = await customersApi.getAll(params)
      setCustomers(data.data?.items || [])
      return data.data?.items || []
    } finally { setLoad('customers', false) }
  }, [])

  const createCustomer = useCallback(async (payload) => {
    const { data } = await customersApi.create(payload)
    toast.success(data.message)
    await fetchCustomers()
    return data.data
  }, [fetchCustomers])

  const deleteCustomer = useCallback(async (id) => {
    const { data } = await customersApi.delete(id)
    toast.success(data.message)
    await fetchCustomers()
  }, [fetchCustomers])

  // Orders
  const fetchOrders = useCallback(async (params) => {
    setLoad('orders', true)
    try {
      const { data } = await ordersApi.getAll(params)
      setOrders(data.data?.items || [])
      return data.data?.items || []
    } finally { setLoad('orders', false) }
  }, [])

  const createOrder = useCallback(async (payload) => {
    const { data } = await ordersApi.create(payload)
    toast.success(data.message)
    await fetchOrders()
    return data.data
  }, [fetchOrders])

  const updateOrderStatus = useCallback(async (id, status) => {
    const { data } = await ordersApi.updateStatus(id, status)
    toast.success(data.message)
    await fetchOrders()
    return data.data
  }, [fetchOrders])

  const deleteOrder = useCallback(async (id) => {
    const { data } = await ordersApi.delete(id)
    toast.success(data.message)
    await fetchOrders()
  }, [fetchOrders])

  // Dashboard
  const fetchDashboard = useCallback(async () => {
    setLoad('dashboard', true)
    try {
      const { data } = await dashboardApi.getStats()
      setDashboard(data.data)
      return data.data
    } finally { setLoad('dashboard', false) }
  }, [])

  return (
    <AppContext.Provider value={{
      products, customers, orders, dashboard, loading,
      fetchProducts, createProduct, updateProduct, deleteProduct,
      fetchCustomers, createCustomer, deleteCustomer,
      fetchOrders, createOrder, updateOrderStatus, deleteOrder,
      fetchDashboard,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
