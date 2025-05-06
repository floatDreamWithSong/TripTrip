import { Panel, Stack, Loader } from 'rsuite';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from 'react-query';
import { getStatistics } from '../../request/stat';

const Statistics = () => {
  const { data: statsData, isLoading } = useQuery(['statistics'], getStatistics, {
    refetchInterval: 30000, // 每30秒刷新一次数据
  });

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Loader content="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Stack spacing={20} direction="column" alignItems="stretch">
        <div style={{ width: '100%', display:'flex',flexDirection:'row', gap:'1rem' }}>
          <Panel bordered style={{ flex: '1' }}>
            <h5>总申核数</h5>
            <h2>{statsData?.data.total || 0}</h2>
          </Panel>
          <Panel bordered style={{ flex: '1' }}>
            <h5>总通过数</h5>
            <h2>{statsData?.data.approved}</h2>
          </Panel>
          <Panel bordered style={{ flex: '1' }}>
            <h5>总拒绝数</h5>
            <h2>{statsData?.data.rejected || 0}</h2>
          </Panel>
          <Panel bordered style={{ flex: '1' }}>
            <h5>待处理数</h5>
            <h2>{statsData?.data.pending || 0}</h2>
          </Panel>
        </div>

        <Panel header="七日审核数据" bordered>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statsData?.data.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submitted" name="提交数" fill="#8884d8" />
              <Bar dataKey="approved" name="通过数" fill="#82ca9d" />
              <Bar dataKey="rejected" name="拒绝数" fill="#f07373" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </Stack>
    </div>
  );
};

export default Statistics;