import { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './stats.css';

export default function Stats() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [pieChartData, setPieChartData] = useState([]);
  const [recentColumns, setRecentColumns] = useState([]);
  const [recentRows, setRecentRows] = useState([]);
  const [recentStats, setRecentStats] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState(''); // State for selected emotion
  const [maxEmotion, setMaxEmotion] = useState('No data'); // State for emotion with max value
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    getStats(); // Fetch stats when component mounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStats = async () => {
    try {
      const { data } = await axios.post('http://localhost:8000/getStats', { username: JSON.parse(localStorage.getItem('user')).username });
      // make capital first letter
      const curData = Object.entries(data.moodStatistics).map(([key, value]) => ({ value: Math.round(value), label: key.charAt(0).toUpperCase() + key.slice(1) }));

      const columns = [
        { field: 'id', headerName: 'ID', width: 100, sortable: false },
        { field: 'prompt', headerName: 'Prompt', width: 180, sortable: false },
        ...Object.keys(data.recentStatistics[0]?.emotions || {}).map(emotion => ({
          field: emotion,
          headerName: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          width: 180,
          sortable: false,
        })),
      ];

      const rows = data.recentStatistics.map((item, index) => ({
        id: index + 1,
        prompt: item.prompt,
        ...Object.fromEntries(
          Object.entries(item.emotions).map(([key, value]) => [key, Math.round(value)])
        ),
      }));
      // set max emotion from recent stats last element
      const curE = data.recentStatistics[data.recentStatistics.length - 1].emotions;
      for (const [key, value] of Object.entries(curE)) {
        if (value === Math.max(...Object.values(curE))) {
          // capitalize first letter
          setMaxEmotion(key.charAt(0).toUpperCase() + key.slice(1));
          break;
        }
      }
      setPieChartData(curData);
      setRecentColumns(columns);
      rows.reverse();
      setRecentRows(rows);
      setRecentStats(data.recentStatistics);
    } catch (err) {
      alert(err);
    }
  };

  const handleEmotionChange = (event) => {
    setSelectedEmotion(event.target.value);
  };

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1200 && windowWidth > 768;

  const options = {
    data: pieChartData,
    innerRadius: isMobile ? 45 : isTablet ? 55 : 70,
    outerRadius: isMobile ? 90 : isTablet ? 110 : 140,
    paddingAngle: 5,
    cornerRadius: 5,
    startAngle: -180,
    endAngle: 180,
    highlightScope: { faded: 'global', highlighted: 'item' },
  };
  
  const getChartSize = (defaultSize) => Math.min(windowWidth * 0.8, defaultSize);
  function handleLogout(){
    localStorage.removeItem('user');
    navigate('/');
  }
  return (
    <div className='stats_body'>
      <div className=''>
      <span className="container">
        <span className="checkbox-container">
          <input className="checkbox-trigger" type="checkbox" id="menu-checkbox" />
          <label className="menu-content" htmlFor="menu-checkbox">
            <ul>
              <Link to={'/chatb'} className='menuLink'><li>Chatbot</li></Link>
              <Link to={'/stats'} className='menuLink'><li>Statistics</li></Link>
              <Link onClick={handleLogout} className='menuLink'><li>Log out</li></Link>
            </ul>
            <span className="hamburger-menu"></span>
          </label>
          <div className="menu-overlay"></div>
        </span>
      </span>
    </div>
      <div className='stats_box'>
        <div className='stats_top'>
          <div className='stats_field'>
            <PieChart
              margin={{ top: isMobile ? 100 : 10, bottom: 100, left: 70 }}
              series={[options]}
              width={getChartSize(600)}
              height={getChartSize(400)}
              slotProps={{
                legend: {
                  position: { vertical: 'bottom', horizontal: 'right' },
                  direction: 'row',
                  padding: 0,
                  align: 'center',
                  verticalAlign: 'bottom',
                  itemMarkWidth: isMobile ? 20 : 30,
                  itemMarkHeight: isMobile ? 20 : 30,
                  labelStyle: {
                    direction: 'revert',
                    fontSize: isMobile ? 18 : 20,
                    fill: 'white',
                    fontWeight: 'bold',
                  },
                  itemGap: isMobile ? 1 : 15,
                },
              }}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: 'white',
                  fontWeight: 'bold',
                  fontSize: isMobile ? 12 : 15,
                },
              }}
            />
          </div>
          <div className='stats_field'>
            <p className='emotion-intro'>You seem to be</p>
            <p className='emotion-result'>{maxEmotion}</p>
          </div>
          <div className='stats_field'>
            {/* Dropdown for selecting emotion */}

            <LineChart
              xAxis={[{ data: recentStats.map((_, index) => index + 1) }]}
              series={[
                {
                  data: recentStats.map(item => selectedEmotion ? Math.round(item.emotions[selectedEmotion]) : 0),
                },
              ]}
              width={getChartSize(500)}
              height={getChartSize(300)}
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                flexShrink: 0,
                "& .MuiLineElement-root": {
                  strokeWidth: 2,
                },
                "& .MuiMarkElement-root": {
                  scale: "0.6",
                  fill: "#fff",
                  strokeWidth: 2,
                },
                "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
                  fill: "#7E8299",
                  fontSize: isMobile ? "20px" : "30px",
                  fontStyle: "normal",
                  fontWeight: "600",
                  lineHeight: "14px",
                },
                "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
                  fill: "#7E8299",
                  fontSize: isMobile ? "20px" : "30px",
                  fontStyle: "normal",
                  fontWeight: "600",
                  lineHeight: "14px",
                },
                "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
                  stroke: "white",
                },
                "& .MuiChartsAxis-left .MuiChartsAxis-line": {
                  stroke: "white",
                },
                "& .MuiChartsAxis-bottom .MuiChartsAxis-tick": {
                  stroke: "white",
                },
                "& .MuiChartsAxis-left .MuiChartsAxis-tick": {
                  stroke: "white",
                },
              }}
            />
            <h5 className="recent-data-heading">Graph For</h5>
            <select value={selectedEmotion} onChange={handleEmotionChange} className='selectBar'>
              <option value="" className='optionBar'>Select Emotion</option>
              {recentColumns
                .filter((col) => col.field !== 'prompt' && col.field !== 'id')
                .map((col) => (
                  <option key={col.field} value={col.field} className='optionBar'>
                    {col.headerName}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div>
          <h1 className="recent-data-heading">Recent Data</h1>
        </div>
        <div className='stats_bottom'>
          <DataGrid
            rows={recentRows}
            columns={recentColumns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 9,
                },
              },
            }}
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
            disableDensitySelector
            disableColumnSorting
            sortingMode="server"
            filterMode="server"
            hideFooter={true}
            sx={{
              '& .MuiDataGrid-container--top [role=row]': {
                backgroundColor: 'transparent',
                color: 'white',
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: 'transparent',
              },
              '& .MuiDataGrid-footerContainer': {
                display: 'none',
              },
              '& .MuiDataGrid-row': {
                color: 'white',
                fontSize: '18px',
                fontFamily: '"Trebuchet MS", Arial, sans-serif',
                '&:nth-of-type(odd)': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                '&:nth-of-type(even)': {
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                },
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
            rowHeight={100}
          />
        </div>
      </div>
    </div>
  );
}