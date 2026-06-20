<template>
    <div class="dashboard-container">
       <el-row :gutter="20">
           <el-col :span="6">
               <el-card >
                   <div class="card-content">
                    <div class="avatar users">
                        <el-image :src="userIcon" style="width: 40px; height: 40px;" />
                    </div>
                    <div class="card-info">
                        <p class="title">Total Users</p>
                        <p class="number">{{ analyticsData?.systemOverview?.totalUsers ?? 'Loading...' }}</p>
                        <p class="subtitle-title">Active Users: {{ analyticsData?.systemOverview?.activeUsers ?? 'Loading...' }}</p>
                    </div>
                   </div>
               </el-card>
           </el-col>

           <el-col :span="6">
               <el-card >
                   <div class="card-content">
                    <div class="avatar like">
                        <el-image :src="likeIcon" style="width: 40px; height: 40px;" />
                    </div>
                    <div class="card-info">
                        <p class="title">Emotional Diaries</p>
                        <p class="number">{{ analyticsData?.systemOverview?.totalDiaries ?? 'Loading...' }}</p>
                        <p class="subtitle-title">New additions today: {{ analyticsData?.systemOverview?.todayNewDiaries ?? 'Loading...' }}</p>
                    </div>
                   </div>
               </el-card>
           </el-col>

           <el-col :span="6">
               <el-card >
                   <div class="card-content">
                    <div class="avatar comments">
                        <el-image :src="commentIcon" style="width: 40px; height: 40px;" />
                    </div>
                    <div class="card-info">
                        <p class="title">Total Sessions</p>
                        <p class="number">{{ analyticsData?.systemOverview?.totalSessions ?? 'Loading...' }}</p>
                        <p class="subtitle-title">New additions today: {{ analyticsData?.systemOverview?.todayNewSessions ?? 'Loading...' }}</p>
                    </div>
                   </div>
               </el-card>
           </el-col>

           <el-col :span="6">
               <el-card  >
                   <div class="card-content">
                    <div class="avatar smile">
                        <el-image :src="smileIcon" style="width: 40px; height: 40px;" />
                    </div>
                    <div class="card-info">
                        <p class="title">Average Mood</p>
                        <p class="number">{{ analyticsData?.systemOverview?.avgMoodScore ?? 'Loading...' }}/10</p>
                        <p class="subtitle-title">Emotional Health Index</p>
                    </div>
                   </div>
               </el-card>
           </el-col>
      </el-row>
      <!-- Future charts and stats can be added here -->
       <el-row :gutter="20" style="margin-top: 20px;">
           <el-col :span="12">
               <el-card style="width: 100%;">
                   <template #header>
                       <div class="card-header">
                           Emotion Trends Analysis
                        </div>
                   </template>
                    <div class="chart-content">
                        <!-- Placeholder for future chart -->
                        <div ref="emotionChartRef" style="width: 100%; height: 300px;">
                        </div>
                    </div>
               </el-card>
           </el-col>

           <el-col :span="12">
               <el-card style="width: 100%;">
                   <template #header>
                       <div class="card-header">
                           Statistics on Consultations Sessions
                        </div>
                   </template>
                    <div class="chart-content">
                      <div class="consultation-stats" v-if="analyticsData?.consultationStats">
                        <div class="stat-item">
                          <div class="stat-label">Total Sessions</div>
                          <div class="stat-value">{{ analyticsData?.consultationStats?.totalSessions ?? 'Loading...' }}</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-label">Average Session Duration</div>
                          <div class="stat-value">{{ analyticsData?.consultationStats?.avgDurationMinutes ?? 'Loading...' }}</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-label">Active Users</div>
                          <div class="stat-value">{{ analyticsData?.systemOverview?.activeUsers ?? 'Loading...' }}</div>
                        </div>
                      </div>
                        <!-- Placeholder for future chart -->
                        <div ref="consultationChartRef" style="width: 100%; height: 260px;">
                        </div>
                    </div>
               </el-card>
           </el-col>

       </el-row>
        <!-- Future charts and stats can be added here -->
         <el-row style="margin-top: 20px;">
           <el-col :span="24">
               <el-card style="width: 100%;">
                   <template #header>
                       <div class="card-header">
                           Users Activity Trends
                        </div>
                   </template>
                    <div class="chart-content">
                        <!-- Placeholder for future chart -->
                        <div ref="activityChartRef" style="width: 100%; height: 300px;"></div>
                    </div>
               </el-card>
           </el-col>

         </el-row>
    </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { getAnalyticsOverview } from '@/api/admin';
import { ElMessage } from 'element-plus';
import { tooltipFormatter } from '@/utils/chart';


//import images
const userIcon = new URL('@/assets/images/user.png', import.meta.url).href;
const likeIcon = new URL('@/assets/images/like_fill.png', import.meta.url).href;
const commentIcon = new URL('@/assets/images/comment.png', import.meta.url).href;
const smileIcon = new URL('@/assets/images/smile.png', import.meta.url).href;
import * as ECharts from 'echarts';

const analyticsData = ref(null);


//Emotion Chart
const emotionChartRef = ref(null);
// create a variable to hold the chart instance so we can update it later
let emotionChart= null;

//initialize the chart when the component is mounted
const initChart=()=>{
  initEmotionChart();
  initConsultationChart();
  initActivityChart();
}

const initEmotionChart = () => {
  // return if dom instance is not ready yet
    if (!emotionChartRef.value) return; 
    // dispose previous chart instance if it exists to avoid memory leaks
    if (emotionChart) {
        emotionChart.dispose();
    }

    // initialize the chart instance
    emotionChart = ECharts.init(emotionChartRef.value);

    // obtian emotion trend data from analyticsData and format it for the chart
    const TrendData = analyticsData.value?.emotionTrend || [];

    // create chart options
    const options = {
        title: {
          text : 'Emotion Trends',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2d3436'
          },
          left: 'center',
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          borderWidth: 1,
          borderColor: '#fab1a0',
          textStyle: { fontSize: 12, color: '#2d3436' },
          formatter: tooltipFormatter,
        },
        legend: {
          data: ['AvgMoodScore', 'TotalSessions'],
          top: 40,
          textStyle: { fontSize: 12, color: '#2d3436' }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 80 },
        xAxis: {
            type: 'category',
            data: TrendData.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        },
        yAxis: [{
            type: 'value',
            name: 'Mood Score',
            position: 'left',
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        },{
          type: 'value',
            name: 'Amount of Sessions',
            position: 'right',
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        }],
        series: [
            {
                name: 'AvgMoodScore',
                data: TrendData.map(item => item.avgMoodScore),
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#faebaf',
                    width: 3
                },
                itemStyle: {
                    color: '#faebaf'
                },
            },
            {
                name: 'TotalSessions',
                data: TrendData.map(item => item.recordCount),
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#eeb5a3',
                    width: 3
                },
                itemStyle: {
                    color: '#eeb5a3'
                },
            }
        ]
    };

    // set the options on the chart instance
    emotionChart.setOption(options);
    
}

// Consultation Chart
const consultationChartRef = ref(null);
let consultationChart = null;
const initConsultationChart = () => {
    // Similar implementation to initEmotionChart, but for consultation stats
    // This is a placeholder for future implementation

    if (!consultationChartRef.value) return; 
    // dispose previous chart instance if it exists to avoid memory leaks
    if (consultationChart) {
        consultationChart.dispose();
    }
    consultationChart = ECharts.init(consultationChartRef.value);

    const consultationData = analyticsData.value?.consultationStats?.dailyTrend || [];

    const options = {
        title: {
          text : 'Consultation Activity Statistics',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2d3436'
          },
          left: 'center',
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          borderWidth: 1,
          borderColor: '#81ecec',
          textStyle: { fontSize: 12, color: '#2d3436' },
          formatter: tooltipFormatter
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top:80,
        },
        legend: {
          data: ['Sessions', 'Active Users'],
          top: 40,
          textStyle: { fontSize: 12, color: '#2d3436' }
        },
        xAxis: {
            type: 'category',
            data: consultationData.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        },
        yAxis: [{
            type: 'value',
            position: 'left',
            axisLine: { lineStyle: { color: '#2d3436' } },
        }, {
            type: 'value',
            position: 'right',
            axisLine: { lineStyle: { color: '#2d3436' } },
        }],
        series: [
            {
                name: 'Sessions',
                data: consultationData.map(item => item.sessionCount),
                type: 'bar',
                smooth: true,
                lineStyle: {
                    color: '#81ecec',
                    width: 3
                },
                itemStyle: {
                    color: '#81ecec'
                },
            },
              {
                  name: 'Active Users',
                  data: consultationData.map(item => item.userCount),
                  type: 'bar',
                  smooth: true,
                  lineStyle: {
                      color: '#74b9ff',
                      width: 3
                  },
                  itemStyle: {
                      color: '#74b9ff'
                  },
              }
        ]
    };
    consultationChart.setOption(options);

}

// Activity Chart
const activityChartRef = ref(null);
let activityChart = null;
const initActivityChart = () => {
    // Similar implementation to initEmotionChart, but for activity stats
    // This is a placeholder for future implementation
    if (!activityChartRef.value) return;
    if (activityChart) {
        activityChart.dispose();
    }
    activityChart = ECharts.init(activityChartRef.value);

    const activityData = analyticsData.value?.userActivity || [];

    const options = {
        title: {
          text : 'User Activity Trends',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2d3436'
          },
          left: 'center',
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          borderWidth: 1,
          borderColor: '#55efc4',
          textStyle: { fontSize: 12, color: '#2d3436' },
          formatter: tooltipFormatter,
        },
          legend: {
            data: ['Active Users', 'New Users', 'Diary Users', 'Consultation Users'],
            top: 40,
            textStyle: { fontSize: 12, color: '#2d3436' }
          },
        grid: { left: '3%', right: '4%', bottom: '3%', top:80 },
        xAxis: {
            type: 'category',
            data: activityData.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        },
        yAxis: [{
            type: 'value',
            // name: 'Active Users',
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        },
      {
          type: 'value',
            // name: 'New Users',
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
      },
      {
          type: 'value',
            // name: 'Diary Users',
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
      },
    {
          type: 'value',
            // name: 'Consulatation Users',
            axisLine: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
    }],
        series: [
            {
                name: 'Active Users',
                data: activityData.map(item => item.activeUsers),
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#55efc4',
                    width: 3
                },
                itemStyle: {
                    color: '#55efc4'
                },
            },
            {
                name: 'New Users',
                data: activityData.map(item => item.newUsers),
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#81ecec',
                    width: 3
                },
                itemStyle: {
                    color: '#81ecec'
                },

            },
            {
                name: 'Diary Users',
                data: activityData.map(item => item.diaryUsers),
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#74b9ff',
                    width: 3
                },
                itemStyle: {
                    color: '#74b9ff'
                },

            },
            {
                name: 'Consultation Users',
                data: activityData.map(item => item.consultationUsers),
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#a29bfe',
                    width: 3
                },
                itemStyle: {
                    color: '#a29bfe'
                },
            }
        ]
    };
    activityChart.setOption(options);
  }

onMounted(async () => {
    try {
        const res = await getAnalyticsOverview();
        console.log('Analytics Overview:', res.data);
        analyticsData.value = res.data;
        // initialize the emotion trend chart after data is loaded
        initChart();
    } catch (error) {
        console.error('Failed to fetch analytics overview:', error);
        ElMessage({
            type: 'error',
            message: 'Failed to load dashboard data. Please try again later.',
        });
    }
});
</script>


<style lang="scss" scoped>
.dashboard-container {
  :deep(.el-card) {
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }

  .card-header{
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
  }
  .card-content {
    display: flex;
    align-items: center;  
    .avatar {
      width: 64px;
      height: 64px;
      margin-right: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.users {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      &.like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      &.comments {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      &.smile {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .card-info {
      .title {
        font-size: 13px;
        color: rgba(44, 62, 80, 0.5);
        margin-bottom: 4px;
        letter-spacing: 0.3px;
      }
      .number {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
        line-height: 1;
      }
      .subtitle-title {
        font-size: 11px;
        color: rgba(44, 62, 80, 0.35);
        letter-spacing: 0.2px;
      }
    }
  }

  .chart-content {
    padding: 20px;
    height: 300px;
    position: relative;

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }

  .consultation-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;

    .stat-item {
      text-align: center;

      .stat-label {
        font-size: 12px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }
    }
  }
}

</style>
