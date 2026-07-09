import React, { useState, useEffect } from 'react';
import { 
    FaFileAlt, FaDownload, FaChartLine, FaUsers, 
    FaCalendarAlt, FaClipboardCheck, FaEye
} from 'react-icons/fa';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import api from '../../utils/api';
import './ReportsAnalytics.css';

const ReportsAnalytics = () => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    const COLORS = ['#3b9bb9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [reportsRes, statsRes] = await Promise.all([
                api.get('/reports'),
                api.get('/assessments/statistics')
            ]);
            setReports(reportsRes.data || []);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Fetch data error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="ra-loading">
                <div className="spinner"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    // Prepare chart data
    const riskData = stats?.riskDistribution ? 
        Object.entries(stats.riskDistribution).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        })) : [];

    const recentData = stats?.recentAssessments?.slice(0, 10).map(a => ({
        name: `${a.first_name} ${a.last_name}`,
        score: a.total_score,
        date: formatDate(a.completed_at)
    })) || [];

    return (
        <div className="reports-analytics">
            <div className="container">
                <div className="ra-header">
                    <h1>Reports & Analytics</h1>
                    <p>System-wide analytics and reporting</p>
                </div>

                <div className="ra-stats-grid">
                    <div className="ra-stat-card card">
                        <FaFileAlt className="ra-stat-icon" style={{ color: 'var(--primary-500)' }} />
                        <div>
                            <h3>{reports.length}</h3>
                            <p>Total Reports</p>
                        </div>
                    </div>
                    <div className="ra-stat-card card">
                        <FaClipboardCheck className="ra-stat-icon" style={{ color: 'var(--accent-purple)' }} />
                        <div>
                            <h3>{stats?.recentAssessments?.length || 0}</h3>
                            <p>Recent Assessments</p>
                        </div>
                    </div>
                </div>

                <div className="ra-charts-grid">
                    {riskData.length > 0 && (
                        <div className="ra-chart-card card">
                            <h3>Risk Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {recentData.length > 0 && (
                        <div className="ra-chart-card card">
                            <h3>Recent Assessment Scores</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={recentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 30]} />
                                    <Tooltip />
                                    <Bar dataKey="score" fill="#3b9bb9" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="ra-reports-list card">
                    <h3>Generated Reports</h3>
                    {reports.length === 0 ? (
                        <p className="no-reports">No reports generated</p>
                    ) : (
                        <div className="ra-report-items">
                            {reports.map((report) => (
                                <div key={report.id} className="ra-report-item">
                                    <div className="ra-report-info">
                                        <span className="ra-report-title">
                                            {report.report_type.replace('-', ' ')}
                                        </span>
                                        <span className="ra-report-date">
                                            {formatDate(report.created_at)}
                                        </span>
                                        <span className="ra-report-user">
                                            by {report.first_name} {report.last_name}
                                        </span>
                                    </div>
                                    <button className="btn btn-outline btn-sm">
                                        <FaEye /> View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsAnalytics;