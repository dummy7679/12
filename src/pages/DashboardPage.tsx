import React, { useState, useEffect } from 'react'
import { useAuth } from '../components/auth/AuthProvider'
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Target,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  totalTests: number
  totalStudents: number
  totalQuestions: number
  averageScore: number
  recentActivity: any[]
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalStudents: 0,
    totalQuestions: 0,
    averageScore: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch user's tests
      const { data: tests } = await supabase
        .from('tests')
        .select('*')
        .eq('created_by', user?.id)

      // Fetch test results
      const { data: results } = await supabase
        .from('test_results')
        .select('*')
        .in('test_id', tests?.map(t => t.id) || [])

      // Calculate stats
      const totalTests = tests?.length || 0
      const totalStudents = new Set(results?.map(r => r.user_id)).size
      const totalQuestions = tests?.reduce((sum, test) => sum + (test.questions?.length || 0), 0) || 0
      const averageScore = results?.length 
        ? results.reduce((sum, result) => sum + result.score, 0) / results.length 
        : 0

      setStats({
        totalTests,
        totalStudents,
        totalQuestions,
        averageScore: Math.round(averageScore),
        recentActivity: results?.slice(0, 5) || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.user_metadata?.full_name || 'Educator'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your tests today.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="h-5 w-5 mr-2" />
                Create Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Total Tests"
            value={stats.totalTests}
            change={12}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Users}
            title="Students"
            value={stats.totalStudents}
            change={8}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            icon={Target}
            title="Questions"
            value={stats.totalQuestions}
            change={15}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Award}
            title="Avg. Score"
            value={`${stats.averageScore}%`}
            change={5}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'tests', name: 'Tests', icon: BookOpen },
                { id: 'students', name: 'Students', icon: Users },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Award className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Test completed: {activity.test_title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Score: {activity.score}% • {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      <Plus className="h-6 w-6 mx-auto mb-2" />
                      <span className="block text-sm font-medium">Create New Test</span>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all">
                      <Users className="h-6 w-6 mx-auto mb-2" />
                      <span className="block text-sm font-medium">Manage Students</span>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      <span className="block text-sm font-medium">Export Reports</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Tests</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search tests..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Filter className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tests created yet</p>
                  <button className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Test
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Management</h3>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No students enrolled yet</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics & Reports</h3>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Analytics will appear here once you have test data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}