import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaSave, FaLock, FaBell, FaPalette, FaGlobe } from 'react-icons/fa';
import './SystemSettings.css';

const SystemSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Save settings error:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="system-settings">
            <div className="container">
                <div className="ss-header">
                    <h1>System Settings</h1>
                    <p>Configure system-wide settings and preferences</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="ss-form card">
                    <div className="ss-section">
                        <h3><FaGlobe /> General Settings</h3>
                        <div className="form-group">
                            <label className="form-label">System Name</label>
                            <input
                                type="text"
                                className="form-input"
                                defaultValue="Teen Mental Wellness Platform"
                                {...register('systemName')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Support Email</label>
                            <input
                                type="email"
                                className="form-input"
                                defaultValue="support@teenwellness.com"
                                {...register('supportEmail')}
                            />
                        </div>
                    </div>

                    <div className="ss-divider" />

                    <div className="ss-section">
                        <h3><FaBell /> Notification Settings</h3>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    {...register('emailNotifications')}
                                />
                                Enable email notifications
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    {...register('assessmentAlerts')}
                                />
                                Send alerts for high-risk assessments
                            </label>
                        </div>
                    </div>

                    <div className="ss-divider" />

                    <div className="ss-section">
                        <h3><FaLock /> Security Settings</h3>
                        <div className="form-group">
                            <label className="form-label">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                className="form-input"
                                defaultValue="60"
                                {...register('sessionTimeout')}
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    {...register('twoFactorAuth')}
                                />
                                Require two-factor authentication for admins
                            </label>
                        </div>
                    </div>

                    <div className="ss-divider" />

                    <div className="ss-section">
                        <h3><FaPalette /> Appearance</h3>
                        <div className="form-group">
                            <label className="form-label">Primary Color</label>
                            <input
                                type="color"
                                className="form-input color-picker"
                                defaultValue="#3b9bb9"
                                {...register('primaryColor')}
                            />
                        </div>
                    </div>

                    <div className="ss-actions">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={isLoading}
                        >
                            <FaSave /> {isLoading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SystemSettings;