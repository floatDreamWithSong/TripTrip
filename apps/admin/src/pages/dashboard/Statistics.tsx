import { Panel, Stack } from 'rsuite';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Statistics = () => {
  // 模拟数据
  const data = [
    { day: '周一', submitted: 40, approved: 24 },
    { day: '周二', submitted: 30, approved: 13 },
    { day: '周三', submitted: 20, approved: 18 },
    { day: '周四', submitted: 27, approved: 23 },
    { day: '周五', submitted: 18, approved: 12 },
    { day: '周六', submitted: 23, approved: 19 },
    { day: '周日', submitted: 34, approved: 32 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Stack spacing={20} direction="column" alignItems="stretch">
        <div style={{ width: '100%', display:'flex',flexDirection:'row', gap:'1rem' }}>
          <Panel bordered style={{ flex: '1' }}>
            <h5>总申核数</h5>
            <h2>1,248</h2>
          </Panel>
          <Panel bordered style={{ flex: '1' }}>
            <h5>通过率</h5>
            <h2>78.3%</h2>
          </Panel>
          <Panel bordered style={{ flex: '1' }}>
            <h5>待处理数</h5>
            <h2>100</h2>
          </Panel>
          <Panel bordered style={{ flex: '1' }}>
            <h5>今日指标</h5>
            <h2>34/50</h2>
          </Panel>
        </div>

        <Panel header="每日审核数据" bordered>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submitted" name="提交数" fill="#8884d8" />
              <Bar dataKey="approved" name="通过数" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </Stack>
    </div>
  );
};

export default Statistics;