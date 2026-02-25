import React, { useState, useEffect } from 'react';
import { Mail, Save, FileText, Layout, Info, AlertCircle, RefreshCw, X, Check, Image as ImageIcon, Eye as EyeIcon, Code } from 'lucide-react';
import adminAPI from '../../api/admin';
import ImageUpload from '../../components/ImageUpload';

const EmailTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateData, setTemplateData] = useState({
        subject: '',
        html: ''
    });
    const [savedData, setSavedData] = useState({
        subject: '',
        html: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'preview'

    const availableTemplates = [
        {
            key: 'email.template.verification',
            label: 'Email Verification',
            placeholders: ['{{name}}', '{{code}}', '{{logoUrl}}'],
            defaultHtml: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">\n  <div style="text-align: center; margin-bottom: 20px;">\n    <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; display: {{logoDisplay}};" />\n  </div>\n  <h2 style="color: #333;">Verify Your Email</h2>\n  <p>Hello {{name}},</p>\n  <p>Your verification code is: <strong style="font-size: 24px; color: #007bff; letter-spacing: 2px;">{{code}}</strong></p>\n  <p>Please enter this code to complete your registration.</p>\n  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />\n  <p style="font-size: 12px; color: #777;">If you did not request this email, please ignore it.</p>\n</div>'
        },
        {
            key: 'email.template.order_confirmation',
            label: 'Order Confirmation',
            placeholders: ['{{name}}', '{{orderNumber}}', '{{itemsHtml}}', '{{total}}', '{{logoUrl}}'],
            defaultHtml: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">\n  <div style="text-align: center; margin-bottom: 20px;">\n    <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; display: {{logoDisplay}};" />\n  </div>\n  <h2 style="color: #333;">Order Confirmed!</h2>\n  <p>Hi {{name}},</p>\n  <p>Thanks for your order <strong>#{{orderNumber}}</strong>. We\'re getting it ready for you!</p>\n  <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">\n    {{itemsHtml}}\n    <div style="text-align: right; font-weight: bold; margin-top: 10px; font-size: 18px;">Total: {{total}}</div>\n  </div>\n  <p>You\'ll receive another email when your order ships.</p>\n</div>'
        },
        {
            key: 'email.template.payment_confirmation',
            label: 'Payment Confirmation',
            placeholders: ['{{name}}', '{{orderNumber}}', '{{total}}', '{{logoUrl}}'],
            defaultHtml: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">\n  <div style="text-align: center; margin-bottom: 20px;">\n    <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; display: {{logoDisplay}};" />\n  </div>\n  <h2 style="color: #333;">Payment Received</h2>\n  <p>Hi {{name}},</p>\n  <p>We\'ve successfully received your payment for order <strong>#{{orderNumber}}</strong>.</p>\n  <p>Amount Paid: <strong>{{total}}</strong></p>\n  <p>Thank you for shopping with us!</p>\n</div>'
        },
        {
            key: 'email.template.password_reset',
            label: 'Password Reset',
            placeholders: ['{{name}}', '{{code}}', '{{logoUrl}}'],
            defaultHtml: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">\n  <div style="text-align: center; margin-bottom: 20px;">\n    <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px; display: {{logoDisplay}};" />\n  </div>\n  <h2 style="color: #333;">Reset Your Password</h2>\n  <p>Hello {{name}},</p>\n  <p>You requested to reset your password. Use the following code to continue:</p>\n  <p style="text-align: center;"><strong style="font-size: 24px; color: #dc3545; letter-spacing: 2px;">{{code}}</strong></p>\n  <p>This code will expire in 1 hour.</p>\n</div>'
        }
    ];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getSettings();
            const allSettings = result?.data?.settings || {};

            let currentLogo = '';
            const emailSettings = [];

            Object.values(allSettings).forEach(category => {
                category.forEach(setting => {
                    if (setting.key.startsWith('email.template.')) {
                        emailSettings.push(setting);
                    }
                    if (setting.key === 'email.logo_url') {
                        currentLogo = setting.value;
                    }
                });
            });

            setTemplates(emailSettings);
            setLogoUrl(currentLogo);

            if (!selectedTemplate && availableTemplates.length > 0) {
                const firstTemplate = availableTemplates[0];
                handleSelectTemplate(firstTemplate, emailSettings);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (templateInfo, currentTemplates = templates) => {
        const existing = currentTemplates.find(t => t.key === templateInfo.key);
        setSelectedTemplate(templateInfo);
        setViewMode('editor');

        if (existing) {
            const data = {
                subject: existing.value?.subject || '',
                html: existing.value?.html || ''
            };
            setTemplateData(data);
            setSavedData(data); // "Old" version
        } else {
            const empty = { subject: '', html: '' };
            setTemplateData(empty);
            setSavedData(empty);
        }
    };

    const handleLoadDefault = () => {
        if (!selectedTemplate) return;
        if (window.confirm('This will replace your current edits with the default template. Are you sure?')) {
            setTemplateData({
                ...templateData,
                html: selectedTemplate.defaultHtml
            });
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;

        try {
            setSaving(true);
            await adminAPI.updateSetting(
                selectedTemplate.key,
                templateData,
                `Template for ${selectedTemplate.label}`,
                false
            );
            setSavedData(templateData);
            alert(`${selectedTemplate.label} saved successfully!`);
            loadTemplates();
        } catch (error) {
            alert('Failed to save template: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file) => {
        try {
            setUploadingLogo(true);
            const result = await adminAPI.uploadFile(file);
            // Use the relative path for now, frontend proxy handles it
            const newLogoUrl = result.data.url;

            await adminAPI.updateSetting(
                'email.logo_url',
                newLogoUrl,
                'Global logo URL for email templates',
                true
            );

            setLogoUrl(newLogoUrl);
            alert('Email logo updated successfully!');
        } catch (error) {
            alert('Failed to upload logo: ' + error.message);
        } finally {
            setUploadingLogo(false);
        }
    };

    // Helper to render preview by replacing placeholders with dummy data
    const getPreviewHtml = () => {
        let html = templateData.html;
        const dummyData = {
            name: 'John Doe',
            code: '123456',
            orderNumber: 'ORD-789',
            itemsHtml: '<p>• Digital Game Key ($59.99)</p><p>• Special Bundle ($10.00)</p>',
            total: '$69.99',
            logoUrl: logoUrl || 'https://placehold.co/200x50?text=Your+Logo',
            logoDisplay: logoUrl ? 'block' : 'none'
        };

        Object.entries(dummyData).forEach(([k, v]) => {
            const regex = new RegExp(`{{${k}}}`, 'g');
            html = html.replace(regex, v);
        });
        return html;
    };

    if (loading) {
        return <div className="admin-container"><div className="empty-state">Loading templates...</div></div>;
    }

    return (
        <div className="admin-container">
            <header className="admin-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Email Templates</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Customize system emails and notifications
                    </p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Logo Management */}
                    <div className="admin-card" style={{ padding: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <ImageIcon size={18} color="var(--color-primary)" />
                            Email Logo
                        </div>

                        {logoUrl ? (
                            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                <img
                                    src={logoUrl}
                                    alt="Email Logo"
                                    style={{ maxWidth: '100%', maxHeight: '60px', borderRadius: '4px', background: 'white', padding: '10px', objectFit: 'contain' }}
                                />
                                <button
                                    onClick={() => setLogoUrl('')}
                                    style={{ display: 'block', margin: '8px auto 0', color: 'var(--color-danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Change Logo
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '16px' }}>
                                <ImageUpload
                                    onChange={handleLogoUpload}
                                    preview={false}
                                />
                                {uploadingLogo && <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '8px', textAlign: 'center' }}>Uploading...</div>}
                            </div>
                        )}
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                            Affects all emails using <code>{"{{logoUrl}}"}</code>.
                        </p>
                    </div>

                    {/* Template List */}
                    <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="var(--color-primary)" />
                                System Templates
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {availableTemplates.map((t) => {
                                const isActive = selectedTemplate?.key === t.key;
                                const isSaved = templates.some(st => st.key === t.key);

                                return (
                                    <button
                                        key={t.key}
                                        onClick={() => handleSelectTemplate(t)}
                                        style={{
                                            padding: '16px 20px',
                                            textAlign: 'left',
                                            background: isActive ? 'rgba(0, 217, 255, 0.05)' : 'transparent',
                                            border: 'none',
                                            borderLeft: `3px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: isActive ? '600' : '400',
                                            color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        }}>
                                            {t.label}
                                        </span>
                                        {isSaved && <Check size={14} color="var(--color-success)" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedTemplate ? (
                        <>
                            {/* Toolbar */}
                            <div className="admin-card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setViewMode('editor')}
                                        className={`btn-${viewMode === 'editor' ? 'primary' : 'secondary'}`}
                                        style={{ padding: '8px 16px', fontSize: '13px' }}
                                    >
                                        <Code size={16} /> Editor
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`btn-${viewMode === 'preview' ? 'primary' : 'secondary'}`}
                                        style={{ padding: '8px 16px', fontSize: '13px' }}
                                    >
                                        <EyeIcon size={16} /> Preview
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={handleLoadDefault} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                        Load Default
                                    </button>
                                    <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ padding: '8px 20px' }}>
                                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            {/* Editor/Preview */}
                            <div className="admin-card" style={{ padding: viewMode === 'preview' ? '0' : '32px' }}>
                                {viewMode === 'editor' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Subject Line</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={templateData.subject}
                                                onChange={e => setTemplateData({ ...templateData, subject: e.target.value })}
                                            />
                                            {savedData.subject !== templateData.subject && (
                                                <div style={{ fontSize: '11px', color: 'var(--color-warning)', marginTop: '4px' }}>
                                                    Current saved: "{savedData.subject || '(Empty)'}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">HTML Content</label>
                                            <textarea
                                                className="form-input"
                                                value={templateData.html}
                                                onChange={e => setTemplateData({ ...templateData, html: e.target.value })}
                                                style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '13px',
                                                    minHeight: '400px',
                                                    background: 'var(--color-bg-secondary)',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </div>

                                        {/* Placeholders */}
                                        <div style={{ background: 'rgba(0, 217, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px dashed var(--color-primary)' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-primary)', textTransform: 'uppercase' }}>Available Placeholders</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {selectedTemplate.placeholders.map(p => (
                                                    <code
                                                        key={p}
                                                        style={{ background: 'var(--color-bg-card)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            const textarea = document.querySelector('textarea');
                                                            if (textarea) {
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const text = templateData.html;
                                                                setTemplateData({ ...templateData, html: text.substring(0, start) + p + text.substring(end) });
                                                            }
                                                        }}
                                                    >{p}</code>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: '#f5f5f5', padding: '40px 20px', minHeight: '600px', borderRadius: 'var(--radius-lg)' }}>
                                        <iframe
                                            title="Email Preview"
                                            srcDoc={`
                                                <!DOCTYPE html>
                                                <html>
                                                    <head>
                                                        <style>
                                                            body { 
                                                                margin: 0; 
                                                                padding: 20px; 
                                                                background: white; 
                                                                font-family: Arial, sans-serif; 
                                                                color: #333;
                                                            }
                                                            h1, h2, h3, h4 { margin-top: 0; }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        ${getPreviewHtml()}
                                                    </body>
                                                </html>
                                            `}
                                            style={{
                                                width: '100%',
                                                maxWidth: '600px',
                                                height: '500px',
                                                margin: '0 auto',
                                                display: 'block',
                                                border: 'none',
                                                backgroundColor: 'white',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="admin-card" style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Mail size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <p>Select a template to customize your system emails</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailTemplates;
