import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { Plus, Trash2, ArrowRight, Search, MessageSquare, AlertTriangle, Save, RefreshCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminChatBot = () => {
    const { addToast } = useToast();
    const [knowledge, setKnowledge] = useState([]);
    const [unanswered, setUnanswered] = useState([]);
    const [defaultAnswer, setDefaultAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ trigger: '', response: '', category: 'general' });
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('knowledge'); // 'knowledge', 'unanswered', 'settings'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [kbData, unansweredData, settingsData] = await Promise.all([
                adminAPI.getChatBotKnowledge(),
                adminAPI.getChatBotUnanswered(),
                adminAPI.getSettings()
            ]);
            setKnowledge(kbData);
            setUnanswered(unansweredData);

            // Extract default answer from settings
            const settingsList = settingsData?.data?.settings || {};
            let foundDefault = "I'm sorry, I don't have an answer for that yet. I've notified our team to train me on this!";
            Object.values(settingsList).flat().forEach(s => {
                if (s.key === 'chatbot_default_answer') foundDefault = s.value;
            });
            setDefaultAnswer(foundDefault);
        } catch (error) {
            addToast('Error fetching chatbot data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpsert = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.upsertChatBotKnowledge(formData);
            addToast(isEditing ? 'Entry updated' : 'New Q&A added', 'success');
            setFormData({ trigger: '', response: '', category: 'general' });
            setIsEditing(false);
            fetchData();
        } catch (error) {
            addToast('Error saving entry', 'error');
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            if (type === 'knowledge') {
                await adminAPI.deleteChatBotKnowledge(id);
            } else {
                await adminAPI.deleteChatBotUnanswered(id);
            }
            addToast('Deleted successfully', 'success');
            fetchData();
        } catch (error) {
            addToast('Error deleting entry', 'error');
        }
    };

    const handleSaveDefault = async () => {
        try {
            await adminAPI.updateSetting('chatbot_default_answer', defaultAnswer, 'Default response when chatbot has no match', true);
            addToast('Default answer updated', 'success');
        } catch (error) {
            addToast('Error updating default answer', 'error');
        }
    };

    const handleTrain = (unansweredItem) => {
        setFormData({ trigger: unansweredItem.query, response: '', category: 'general' });
        setIsEditing(false);
        setActiveTab('knowledge');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredKnowledge = knowledge.filter(item =>
        item.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.response.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="chatbot-admin">
            <style>{`
                .chatbot-admin {
                    color: var(--color-text-primary);
                }

                .admin-header-section {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .admin-header-section h1 {
                    font-size: 2.5rem;
                    text-transform: uppercase;
                    color: var(--color-primary);
                    margin: 0;
                    letter-spacing: 1px;
                }

                .admin-header-section p {
                    color: var(--color-text-secondary);
                    margin: 0.25rem 0 0;
                }

                /* -- TABS -- */
                .tab-nav {
                    display: flex;
                    gap: 0.5rem;
                    background: var(--color-bg-secondary);
                    padding: 0.4rem;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--color-border);
                }

                .tab-btn {
                    padding: 0.6rem 1.5rem;
                    border-radius: var(--radius-full);
                    background: transparent;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .tab-btn:hover {
                    color: var(--color-text-primary);
                }

                .tab-btn.active {
                    background: var(--color-primary);
                    color: var(--color-bg-primary);
                    box-shadow: 0 0 15px var(--color-primary-glow);
                }

                .badge {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.1rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.75rem;
                }

                .tab-btn.active .badge {
                    background: rgba(0, 0, 0, 0.2);
                }

                /* -- LAYOUT -- */
                .knowledge-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    align-items: flex-start;
                }

                @media (max-width: 1024px) {
                    .knowledge-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* -- FORM CARD -- */
                .form-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    position: sticky;
                    top: 1rem;
                    box-shadow: var(--shadow-lg);
                }

                .form-card h2 {
                    font-size: 1.25rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--color-primary);
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-field {
                    width: 100%;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 0.75rem 1rem;
                    color: var(--color-text-primary);
                    outline: none;
                    transition: border-color 0.2s;
                    font-family: inherit;
                }

                .input-field:focus {
                    border-color: var(--color-primary);
                }

                .btn-submit {
                    width: 100%;
                    background: var(--color-primary);
                    color: var(--color-bg-primary);
                    font-weight: 700;
                    padding: 0.85rem;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                }

                .btn-submit:hover {
                    box-shadow: 0 0 20px var(--color-primary-glow);
                    transform: translateY(-2px);
                }

                .btn-cancel {
                    margin-top: 0.5rem;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--color-text-secondary);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }

                /* -- SEARCH & LIST -- */
                .search-wrapper {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-muted);
                }

                .search-input {
                    padding-left: 3rem;
                    height: 54px;
                    font-size: 1rem;
                }

                .kb-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .kb-item {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }

                .kb-item:hover {
                    border-color: rgba(0, 217, 255, 0.3);
                    background: var(--color-bg-card-hover);
                }

                .kb-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .trigger-tag {
                    background: rgba(0, 217, 255, 0.1);
                    color: var(--color-primary);
                    padding: 0.2rem 0.75rem;
                    border-radius: var(--radius-sm);
                    font-family: monospace;
                    font-weight: 600;
                    border: 1px solid rgba(0, 217, 255, 0.2);
                }

                .kb-actions {
                    display: flex;
                    gap: 0.5rem;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .kb-item:hover .kb-actions {
                    opacity: 1;
                }

                .action-btn {
                    padding: 0.4rem;
                    border-radius: 6px;
                    color: var(--color-text-muted);
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--color-text-primary);
                }

                .action-btn.delete:hover {
                    color: var(--color-danger);
                    background: rgba(239, 68, 68, 0.1);
                }

                .kb-response {
                    color: var(--color-text-secondary);
                    line-height: 1.6;
                    margin: 0;
                }

                /* -- UNANSWERED CARDS -- */
                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .unanswered-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    position: relative;
                }

                .asked-count {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-danger);
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.2rem 0.5rem;
                    border-radius: var(--radius-sm);
                    text-transform: uppercase;
                }

                .card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-danger);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }

                .query-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .last-asked {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin-bottom: 1.5rem;
                }

                /* -- SETTINGS -- */
                .settings-container {
                    max-width: 700px;
                    margin: 0 auto;
                }

                .settings-section {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-xl);
                    padding: 2.5rem;
                }

                .settings-section h2 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .settings-section p.subtitle {
                    color: var(--color-text-muted);
                    margin-bottom: 2rem;
                }

                /* -- EMPTY STATES -- */
                .empty-state {
                    text-align: center;
                    padding: 5rem 2rem;
                    background: var(--color-bg-card);
                    border: 1px dashed var(--color-border);
                    border-radius: var(--radius-xl);
                }

                .empty-icon {
                    font-size: 4rem;
                    color: var(--color-text-muted);
                    margin-bottom: 1.5rem;
                    opacity: 0.3;
                }
            `}</style>

            <div className="admin-header-section">
                <div>
                    <h1>AI ChatBot Management</h1>
                    <p>Train and monitor your rule-based AI assistant</p>
                </div>
                <div className="tab-nav">
                    <button
                        onClick={() => setActiveTab('knowledge')}
                        className={`tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
                    >
                        Knowledge Base
                    </button>
                    <button
                        onClick={() => setActiveTab('unanswered')}
                        className={`tab-btn ${activeTab === 'unanswered' ? 'active' : ''}`}
                    >
                        Unanswered <span className="badge">{unanswered.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <RefreshCcw className="empty-icon animate-spin" />
                    <p>Fetching chatbot data...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'knowledge' && (
                        <div className="knowledge-grid">
                            <aside className="form-card">
                                <h2>
                                    {isEditing ? <Save size={20} /> : <Plus size={20} />}
                                    {isEditing ? 'Edit Entry' : 'Add Knowledge'}
                                </h2>
                                <form onSubmit={handleUpsert}>
                                    <div className="form-group">
                                        <label className="form-label">Trigger Keyword/Phrase</label>
                                        <input
                                            type="text"
                                            required
                                            className="input-field"
                                            value={formData.trigger}
                                            onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                                            placeholder="e.g., support, help, contact"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bot Response</label>
                                        <textarea
                                            required
                                            rows="6"
                                            className="input-field"
                                            value={formData.response}
                                            onChange={e => setFormData({ ...formData, response: e.target.value })}
                                            placeholder="What should the bot reply?"
                                        />
                                    </div>
                                    <button type="submit" className="btn-submit">
                                        {isEditing ? 'Update Entry' : 'Save Entry'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditing(false); setFormData({ trigger: '', response: '', category: 'general' }); }}
                                            className="btn-cancel"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </form>
                            </aside>

                            <main>
                                <div className="search-wrapper">
                                    <Search className="search-icon" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Filter knowledge base..."
                                        className="input-field search-input"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {filteredKnowledge.length === 0 ? (
                                    <div className="empty-state">
                                        <MessageSquare className="empty-icon" />
                                        <p>No matching knowledge items found.</p>
                                    </div>
                                ) : (
                                    <div className="kb-list">
                                        {filteredKnowledge.map(item => (
                                            <div key={item._id} className="kb-item">
                                                <div className="kb-header">
                                                    <span className="trigger-tag">{item.trigger}</span>
                                                    <div className="kb-actions">
                                                        <button
                                                            onClick={() => { setFormData(item); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                            className="action-btn"
                                                            title="Edit"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id, 'knowledge')}
                                                            className="action-btn delete"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="kb-response">{item.response}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </main>
                        </div>
                    )}

                    {activeTab === 'unanswered' && (
                        <div>
                            {unanswered.length === 0 ? (
                                <div className="empty-state">
                                    <MessageSquare className="empty-icon" />
                                    <h3>Total Success!</h3>
                                    <p>The bot has answered every question asked so far.</p>
                                </div>
                            ) : (
                                <div className="cards-grid">
                                    {unanswered.map(item => (
                                        <div key={item._id} className="unanswered-card">
                                            <span className="asked-count">{item.count} Questions</span>
                                            <div className="card-icon">
                                                <AlertTriangle size={24} />
                                            </div>
                                            <div className="query-text">"{item.query}"</div>
                                            <div className="last-asked">Last asked: {new Date(item.lastAsked).toLocaleDateString()}</div>
                                            <button
                                                onClick={() => handleTrain(item)}
                                                className="btn-submit"
                                            >
                                                Train AI <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-container">
                            <div className="settings-section">
                                <h2>General Settings</h2>
                                <p className="subtitle">Configure the default behavior of your AI assistant.</p>

                                <div className="form-group">
                                    <label className="form-label">Fallback Message</label>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                                        This message is sent when the bot doesn't recognize a trigger.
                                    </p>
                                    <textarea
                                        rows="5"
                                        className="input-field"
                                        value={defaultAnswer}
                                        onChange={e => setDefaultAnswer(e.target.value)}
                                        placeholder="e.g., I'm not sure about that. Let me find someone to help you!"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveDefault}
                                    className="btn-submit"
                                >
                                    <Save size={18} /> Update Settings
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminChatBot;
