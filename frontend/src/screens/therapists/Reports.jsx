import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
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
import './Reports.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const { register, handleSubmit, reset } = useForm();

    const COLORS = ['#3b9bb9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/reports');
            setReports(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch reports error:', error);
            setIsLoading(false);
        }
    };

    const generateReport = async (data) => {
        setIsGenerating(true);
        try {
            const response = await api.post('/reports/generate', data);
            toast.success('Report generated successfully');
            setReportData(response.data.data);
            setSelectedReport(response.data);
            fetchReports();
            reset();
        } catch (error) {
            console.error('Generate report error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const viewReport = async (id) => {
        try {
            const response = await api.get(`/reports/${id}`);
            setSelectedReport(response.data);
            setReportData(response.data.data);
        } catch (error) {
            console.error('View report error:', error);
        }
    };

    const downloadReport = () => {
        if (!reportData) return;
        const dataStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
            <div className="reports-loading">
                <div className="spinner"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="reports-page">
            <div className="container">
                <div className="reports-header">
                    <h1>Reports & Analytics</h1>
                    <p>Generate and view practice analytics reports</p>
                </div>

                <div className="reports-grid">
                    <div className="reports-generate card">
                        <h2>Generate Report</h2>
                        <form onSubmit={handleSubmit(generateReport)}>
                            <div className="form-group">
                                <label className="form-label">Report Type</label>
                                <select
                                    className="form-select"
                                    {...register('reportType', { required: 'Report type is required' })}
                                >
                                    <option value="">Select report type</option>
                                    <option value="student-progress">Student Progress</option>
                                    <option value="therapist-performance">Therapist Performance</option>
                                    <option value="organizational">Organizational</option>
                                    <option value="assessment-summary">Assessment Summary</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        {...register('startDate')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        {...register('endDate')}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={isGenerating}
                            >
                                <FaChartLine /> {isGenerating ? 'Generating...' : 'Generate Report'}
                            </button>
                        </form>
                    </div>

                    <div className="reports-list card">
                        <h2>Recent Reports</h2>
                        {reports.length === 0 ? (
                            <p className="no-reports">No reports generated yet</p>
                        ) : (
                            <div className="report-items">
                                {reports.slice(0, 10).map((report) => (
                                    <div key={report.id} className="report-item">
                                        <div className="report-info">
                                            <span className="report-title">{report.report_type}</span>
                                            <span className="report-date">
                                                {formatDate(report.created_at)}
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => viewReport(report.id)}
                                        >
                                            <FaEye /> View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedReport && reportData && (
                    <div className="report-view card">
                        <div className="report-view-header">
                            <h2>{selectedReport.title || 'Report'}</h2>
                            <div className="report-view-actions">
                                <button className="btn btn-secondary btn-sm" onClick={downloadReport}>
                                    <FaDownload /> Download
                                </button>
                                <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                        setSelectedReport(null);
                                        setReportData(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="report-content">
                            {/* Risk Distribution */}
                            {reportData.riskDistribution && (
                                <div className="report-chart">
                                    <h4>Risk Distribution</h4>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(reportData.riskDistribution).map(([name, value]) => ({
                                                    name: name.charAt(0).toUpperCase() + name.slice(1),
                                                    value
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {Object.entries(reportData.riskDistribution).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Student Progress Trend */}
                            {reportData.riskTrend && (
                                <div className="report-chart">
                                    <h4>Student Progress Trend</h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={reportData.riskTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 30]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" stroke="#3b9bb9" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Stats Summary */}
                            <div className="report-stats">
                                {reportData.totalAssessments !== undefined && (
                                    <div className="stat-item">
                                        <FaClipboardCheck className="stat-icon" />
                                        <div>
                                            <span className="stat-value">{reportData.totalAssessments}</span>
                                            <span className="stat-label">Total Assessments</span>
                                        </div>
                                    </div>
                                )}
                                {reportData.totalSessions !== undefined && (
                                    <div className="stat-item">
                                        <FaCalendarAlt className="stat-icon" />
                                        <div>
                                            <span className="stat-value">{reportData.totalSessions}</span>
                                            <span className="stat-label">Total Sessions</span>
                                        </div>
                                    </div>
                                )}
                                {reportData.totalStudents !== undefined && (
                                    <div className="stat-item">
                                        <FaUsers className="stat-icon" />
                                        <div>
                                            <span className="stat-value">{reportData.totalStudents}</span>
                                            <span className="stat-label">Total Students</span>
                                        </div>
                                    </div>
                                )}
                                {reportData.completionRate !== undefined && (
                                    <div className="stat-item">
                                        <FaChartLine className="stat-icon" />
                                        <div>
                                            <span className="stat-value">{reportData.completionRate}%</span>
                                            <span className="stat-label">Completion Rate</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;