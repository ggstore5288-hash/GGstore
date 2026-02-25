import React, { useState, useEffect } from 'react';
import { X, Save, Settings, AlertCircle } from 'lucide-react';
import adminAPI from '../../api/admin';

const LoyaltySettingsModal = ({ onClose }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [settings, setSettings] = useState({
        isActive: true,
        pointsPerDollar: 10,
        pointsToMoneyRatio: 100, // 100 points = $1
        minPointsToRedeem: 100,
        maxRedemptionPerOrder: 1000, // $10
        pointsExpiryDays: 365,
        tierThresholds: {
            bronze: 0,
            silver: 1000,
            gold: 5000,
            platinum: 10000
        },
        tierMultipliers: {
            bronze: 1,
            silver: 1.25,
            gold: 1.5,
            platinum: 2
        },
        bonusPoints: {
            firstPurchase: 100,
            review: 50,
            referral: 200
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getLoyaltySettings();
            if (data) {
                // Ensure nested objects exist to prevent errors if partial data returned
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    tierThresholds: { ...prev.tierThresholds, ...(data.tierThresholds || {}) },
                    tierMultipliers: { ...prev.tierMultipliers, ...(data.tierMultipliers || {}) },
                    bonusPoints: { ...prev.bonusPoints, ...(data.bonusPoints || {}) }
                }));
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, section = null, subKey = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;

        if (section && subKey) {
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [subKey]: val
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: val
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminAPI.updateLoyaltySettings(settings);
            onClose();
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError('Failed to save settings: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '600px', padding: '40px', textAlign: 'center' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={24} />
                        Loyalty Program Settings
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{ margin: '20px', padding: '12px', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', borderRadius: '4px', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>

                    {/* Program Status */}
                    <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Program Status</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>Enable or disable the loyalty program</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={settings.isActive}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                        {/* Earning Rules */}
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Earning Rules</h3>
                            <div className="form-group">
                                <label className="form-label">Points per $1 Spent</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="pointsPerDollar"
                                    value={settings.pointsPerDollar}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Expiry (Days)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="pointsExpiryDays"
                                    value={settings.pointsExpiryDays}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Redemption Rules */}
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Redemption Rules</h3>
                            <div className="form-group">
                                <label className="form-label">Points for $1 Discount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="pointsToMoneyRatio"
                                    value={settings.pointsToMoneyRatio}
                                    onChange={handleChange}
                                    min="1"
                                />
                                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    Currently: {settings.pointsToMoneyRatio} points = $1
                                    <br />
                                    Value of 1 point = ${(1 / settings.pointsToMoneyRatio).toFixed(3)}
                                </p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Points to Redeem</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="minPointsToRedeem"
                                    value={settings.minPointsToRedeem}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Discount Per Order ($)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="maxRedemptionPerOrder"
                                    value={settings.maxRedemptionPerOrder}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Tiers */}
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Tier Thresholds (Points)</h3>
                            {Object.keys(settings.tierThresholds).map(tier => (
                                <div key={tier} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label className="form-label" style={{ width: '80px', textTransform: 'capitalize' }}>{tier}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.tierThresholds[tier]}
                                        onChange={(e) => handleChange(e, 'tierThresholds', tier)}
                                        min="0"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Multipliers */}
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Tier Multipliers</h3>
                            {Object.keys(settings.tierMultipliers).map(tier => (
                                <div key={tier} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label className="form-label" style={{ width: '80px', textTransform: 'capitalize' }}>{tier}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.tierMultipliers[tier]}
                                        onChange={(e) => handleChange(e, 'tierMultipliers', tier)}
                                        step="0.1"
                                        min="1"
                                    />
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>x points</span>
                                </div>
                            ))}
                        </div>

                        {/* Bonus Points */}
                        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Bonus Points</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">First Purchase</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.bonusPoints.firstPurchase}
                                        onChange={(e) => handleChange(e, 'bonusPoints', 'firstPurchase')}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Review</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.bonusPoints.review}
                                        onChange={(e) => handleChange(e, 'bonusPoints', 'review')}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Referral</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.bonusPoints.referral}
                                        onChange={(e) => handleChange(e, 'bonusPoints', 'referral')}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (
                                <>
                                    <Save size={18} style={{ marginRight: '8px' }} />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoyaltySettingsModal;
