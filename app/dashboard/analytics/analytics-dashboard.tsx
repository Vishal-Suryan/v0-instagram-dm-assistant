'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { MessageSquare, Send, Inbox, Clock } from 'lucide-react'

interface AnalyticsDashboardProps {
  totalConversations: number
  totalMessages: number
  unreadConversations: number
  messagesPerDay: { date: string; sent: number; received: number }[]
  responseTimeData: { date: string; avgTime: number }[]
}

export function AnalyticsDashboard({
  totalConversations,
  totalMessages,
  unreadConversations,
  messagesPerDay,
  responseTimeData,
}: AnalyticsDashboardProps) {
  // Calculate totals for display
  const totalSent = messagesPerDay.reduce((sum, day) => sum + day.sent, 0)
  const totalReceived = messagesPerDay.reduce((sum, day) => sum + day.received, 0)
  const avgResponseTime = Math.round(
    responseTimeData.reduce((sum, day) => sum + day.avgTime, 0) / responseTimeData.length
  )

  // Format dates for display
  const formattedMessagesData = messagesPerDay.map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }))

  const formattedResponseData = responseTimeData.map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }))

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your messaging performance and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              {unreadConversations} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Received</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceived}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime} min</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>Messages sent and received over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sent: {
                  label: 'Sent',
                  color: '#3b82f6',
                },
                received: {
                  label: 'Received',
                  color: '#10b981',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedMessagesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="received" fill="#10b981" name="Received" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Average response time in minutes over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                avgTime: {
                  label: 'Avg Response Time',
                  color: '#8b5cf6',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedResponseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    unit=" min"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                    name="Avg Response Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Total Messages Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Messages</CardTitle>
          <CardDescription>All-time message count across all conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalMessages}</div>
        </CardContent>
      </Card>
    </div>
  )
}
