import React, { useState, useEffect } from 'react';
import {
    Save, Settings as SettingsIcon, X, Search, Copy, Check,
    Monitor, Mail, ShoppingBag, Terminal, Shield, Bell,
    AlertCircle, ChevronRight, Globe, Database, HelpCircle, BookOpen, Upload
} from 'lucide-react';
import adminAPI from '../../api/admin';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
    const { addToast } = useToast();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [editFormData, setEditFormData] = useState({
        value: '',
        description: '',
        isPublic: false
    });
    const [newSetting, setNewSetting] = useState({
        key: '',
        value: '',
        category: 'general',
        description: '',
        isPublic: false
    });
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const SETTINGS_LIBRARY = [
        { key: 'site.name', value: 'Sub HUB', category: 'General', description: 'Display name of your store' },
        { key: 'site.maintenance', value: false, category: 'System', description: 'Enable/disable maintenance mode' },
        { key: 'site.email', value: 'support@example.com', category: 'Communication', description: 'Customer support email' },
        { key: 'shop.currency', value: '$', category: 'Sales', description: 'Currency symbol used site-wide' },
        { key: 'shop.free_shipping', value: 50, category: 'Sales', description: 'Cart total required for free shipping' },
        { key: 'marketing.banner_text', value: 'Welcome to our store!', category: 'General', description: 'Text for the top promo banner' },
        { key: 'marketing.promo_code', value: 'WELCOME10', category: 'Sales', description: 'Active sitewide promo code' },
        { key: 'marketing.hero_title', value: 'Grand Theft Auto VI', category: 'Marketing', description: 'Title of the hero featured game' },
        { key: 'marketing.hero_subtitle', value: 'Coming 2025', category: 'Marketing', description: 'Subtitle of the hero featured game' },
        { key: 'marketing.hero_image', value: '/images/banner.png', category: 'Marketing', description: 'Background image URL for the hero section' },
        { key: 'marketing.hero_link', value: '#', category: 'Marketing', description: 'Link URL for the hero section View Details button' },
        { key: 'marketing.hero_label', value: 'Featured Game', category: 'Marketing', description: 'Small label text above the hero title' },
        { key: 'marketing.hero_button_text', value: 'Coming Soon', category: 'Marketing', description: 'Text for the hero CTA button' }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getSettings();
            setSettings(result?.settings || {});
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (key, setting) => {
        setEditingKey(key);
        setEditFormData({
            value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),
            description: setting.description || '',
            isPublic: setting.isPublic || false
        });
    };

    const handleSave = async (keyOverride, valueOverride, descOverride, publicOverride, categoryOverride) => {
        const key = keyOverride || editingKey;
        if (!key) return;

        try {
            setSaving(true);
            let value = valueOverride !== undefined ? valueOverride : editFormData.value;
            const description = descOverride !== undefined ? descOverride : editFormData.description;
            const isPublic = publicOverride !== undefined ? publicOverride : editFormData.isPublic;
            const category = categoryOverride !== undefined ? categoryOverride : 'general';

            // Type parsing for string values coming from manual text inputs
            if (typeof value === 'string' && keyOverride === undefined) {
                if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                    try { value = JSON.parse(value); } catch (e) { }
                } else if (!isNaN(value) && value.trim() !== '') {
                    value = parseFloat(value);
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    value = value.toLowerCase() === 'true';
                }
            }

            await adminAPI.updateSetting(key, value, description, isPublic, category);
            setEditingKey(null);
            loadSettings();
            addToast('Setting saved. Refresh the page to see changes.', 'success');
        } catch (error) {
            alert('Failed to save setting: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(text);
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSaving(true);
            const result = await adminAPI.uploadFile(file);
            if (result.success && result.data.url) {
                setEditFormData({ ...editFormData, value: result.data.url });
                addToast('Image uploaded successfully. Click save to apply.', 'success');
            }
        } catch (error) {
            addToast('Failed to upload image', 'error');
            console.error('Upload error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUploadNewSetting = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSaving(true);
            const result = await adminAPI.uploadFile(file);
            if (result.success && result.data.url) {
                setNewSetting({ ...newSetting, value: result.data.url });
                addToast('Image uploaded successfully. Click save to apply.', 'success');
            }
        } catch (error) {
            addToast('Failed to upload image', 'error');
            console.error('Upload error:', error);
        } finally {
            setSaving(false);
        }
    };

    const getCategoryIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('general') || cat.includes('site')) return <Globe size={18} />;
        if (cat.includes('email') || cat.includes('comm')) return <Mail size={18} />;
        if (cat.includes('sale') || cat.includes('shop')) return <ShoppingBag size={18} />;
        if (cat.includes('system') || cat.includes('env')) return <Database size={18} />;
        if (cat.includes('auth') || cat.includes('security')) return <Shield size={18} />;
        if (cat.includes('admin') || cat.includes('dev')) return <Terminal size={18} />;
        if (cat.includes('notif')) return <Bell size={18} />;
        return <SettingsIcon size={18} />;
    };

    const renderToggle = (setting) => {
        const isOn = setting.value === true;
        return (
            <button
                key={`toggle-${setting.key}`}
                onClick={() => handleSave(setting.key, !isOn, setting.description, setting.isPublic)}
                style={{
                    width: '40px',
                    height: '20px',
                    borderRadius: '20px',
                    background: isOn ? 'var(--color-success)' : 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: isOn ? '22px' : '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'all 0.3s ease',
                    boxShadow: isOn ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                }} />
            </button>
        );
    };

    const filteredSettings = Object.entries(settings).reduce((acc, [category, catSettings]) => {
        const filtered = catSettings.filter(s =>
            s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Control Center</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage global parameters and system configuration
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '38px', width: '250px', background: 'var(--color-bg-secondary)' }}
                        />
                    </div>
                    <button onClick={() => setIsLibraryOpen(true)} className="btn-secondary">
                        <BookOpen size={18} />
                        Reference Guide
                    </button>
                    <button onClick={() => setIsNewModalOpen(true)} className="btn-primary">
                        <SettingsIcon size={18} />
                        Add Setting
                    </button>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <div className="status-dot" style={{ width: '12px', height: '12px' }}></div>
                </div>
            ) : Object.keys(filteredSettings).length === 0 ? (
                <div className="empty-state" style={{ background: 'var(--color-bg-card)', padding: '60px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.3, color: 'var(--color-primary)' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No settings match your search</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Try a different keyword or create a new setting.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
                    {Object.entries(filteredSettings).map(([category, items]) => (
                        <div key={category} style={{
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{
                                padding: '16px 20px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(0, 217, 255, 0.1)',
                                    color: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getCategoryIcon(category)}
                                </div>
                                <h2 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                                    {category}
                                </h2>
                                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-text-muted)', background: 'var(--color-bg-secondary)', padding: '2px 8px', borderRadius: '10px' }}>
                                    {items.length} Settings
                                </span>
                            </div>

                            <div style={{ padding: '0 20px' }}>
                                {items.map((setting, idx) => (
                                    <div key={setting.key} style={{
                                        padding: '20px 0',
                                        borderBottom: idx === items.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.03)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <code style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>{setting.key}</code>
                                                    <button
                                                        onClick={() => handleCopy(setting.key)}
                                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}
                                                    >
                                                        {copySuccess === setting.key ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.4' }}>
                                                    {setting.description || "No description provided."}
                                                </p>
                                            </div>

                                            <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {typeof setting.value === 'boolean' ? (
                                                    renderToggle(setting)
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {editingKey === setting.key ? (
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <input
                                                                    className="form-input"
                                                                    value={editFormData.value}
                                                                    onChange={e => setEditFormData({ ...editFormData, value: e.target.value })}
                                                                    style={{ width: '120px', height: '32px', fontSize: '12px' }}
                                                                />
                                                                <button onClick={() => handleSave()} className="icon-btn" style={{ padding: '4px' }} disabled={saving}><Check size={14} /></button>
                                                                <label className="icon-btn" style={{ padding: '4px', cursor: 'pointer', margin: 0, display: 'flex' }} title="Upload Image">
                                                                    <Upload size={14} />
                                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                                                </label>
                                                                <button onClick={() => setEditingKey(null)} className="icon-btn" style={{ padding: '4px' }}><X size={14} /></button>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => handleEdit(setting.key, setting)}
                                                                style={{
                                                                    padding: '4px 10px',
                                                                    background: 'var(--color-bg-secondary)',
                                                                    borderRadius: '4px',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    fontFamily: 'monospace'
                                                                }}
                                                            >
                                                                {typeof setting.value === 'object' ? '{...}' : String(setting.value)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '3px' }}>
                                                {typeof setting.value}
                                            </span>
                                            {setting.isPublic && (
                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Globe size={10} /> Public
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {/* Create Setting Modal */}
            {
                isNewModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">New Configuration</h2>
                                <button onClick={() => setIsNewModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSave(newSetting.key, newSetting.value, newSetting.description, newSetting.isPublic, newSetting.category); setIsNewModalOpen(false); }}>
                                <div className="form-group">
                                    <label className="form-label">Setting Key</label>
                                    <input
                                        className="form-input"
                                        value={newSetting.key}
                                        onChange={e => setNewSetting({ ...newSetting, key: e.target.value })}
                                        required
                                        placeholder="e.g. shop.discount_enabled"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Default Value</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            className="form-input"
                                            value={newSetting.value}
                                            onChange={e => setNewSetting({ ...newSetting, value: e.target.value })}
                                            required
                                            placeholder="Value or JSON"
                                        />
                                        <label className="btn-secondary" style={{ padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} title="Upload Image">
                                            <Upload size={16} />
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUploadNewSetting} />
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={newSetting.description}
                                        onChange={e => setNewSetting({ ...newSetting, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={newSetting.isPublic}
                                            onChange={e => setNewSetting({ ...newSetting, isPublic: e.target.checked })}
                                        />
                                        <span>Make this setting public</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                                    <button type="button" onClick={() => setIsNewModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                                        <Save size={18} /> Run Setup
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Settings Reference Guide Modal */}
            {isLibraryOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Settings Reference Guide</h2>
                            <button onClick={() => setIsLibraryOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                                Use these standard keys to configure the primary features of your store.
                                Click "Use Preset" to quickly set them up.
                            </p>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                            {SETTINGS_LIBRARY.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <code style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{item.key}</code>
                                            <span style={{ fontSize: '10px', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{item.category}</span>
                                        </div>
                                        <p style={{ fontSize: '12px', margin: 0, color: 'var(--color-text-muted)' }}>{item.description}</p>
                                        <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--color-success)' }}>Example: {String(item.value)}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setNewSetting({
                                                key: item.key,
                                                value: typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value),
                                                category: item.category,
                                                description: item.description,
                                                isPublic: true
                                            });
                                            setIsLibraryOpen(false);
                                            setIsNewModalOpen(true);
                                        }}
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        Use Preset
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsLibraryOpen(false)} className="btn-secondary">Close Guide</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
