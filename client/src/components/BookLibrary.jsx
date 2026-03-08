import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Plus, ArrowLeft, Trash2, ExternalLink, Search } from 'lucide-react';

const BookLibrary = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newBook, setNewBook] = useState({ title: '', link: '', category: 'Kỹ thuật' });

    // Load books from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pdfLibrary');
        if (saved) {
            try {
                setBooks(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading library');
            }
        }
    }, []);

    const saveLibrary = (newBooks) => {
        setBooks(newBooks);
        localStorage.setItem('pdfLibrary', JSON.stringify(newBooks));
    };

    const addBook = () => {
        if (!newBook.title.trim() || !newBook.link.trim()) return;
        const bookToAdd = {
            ...newBook,
            id: Date.now(),
            dateAdded: new Date().toLocaleDateString()
        };
        saveLibrary([...books, bookToAdd]);
        setShowAddModal(false);
        setNewBook({ title: '', link: '', category: 'Kỹ thuật' });
    };

    const removeBook = (id) => {
        saveLibrary(books.filter(b => b.id !== id));
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-icon" onClick={() => navigate('/home')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ color: 'var(--accent-color)' }}>Thư viện Sách</h1>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} /> Thêm sách
                </button>
            </header>

            <div className="glass-card search-box" style={{ marginBottom: '25px', padding: '15px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên sách..."
                        style={{ paddingLeft: '40px', marginBottom: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="book-grid">
                {filteredBooks.length === 0 ? (
                    <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                        <Book size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {searchTerm ? 'Không tìm thấy sách phù hợp.' : 'Chưa có sách trong thư viện. Hãy thêm link PDF của bạn!'}
                        </p>
                    </div>
                ) : (
                    filteredBooks.map(book => (
                        <div key={book.id} className="book-item-card glass-card">
                            <div className="book-info">
                                <span className="category-tag">{book.category}</span>
                                <h3>{book.title}</h3>
                                <p className="date-added">Thêm ngày: {book.dateAdded}</p>
                            </div>
                            <div className="book-actions">
                                <a href={book.link} target="_blank" rel="noopener noreferrer" className="btn-view">
                                    <ExternalLink size={16} /> Mở PDF
                                </a>
                                <button className="btn-delete-sm" onClick={() => removeBook(book.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>Thêm sách mới</h2>
                        <label className="input-label">Tên sách</label>
                        <input
                            type="text"
                            placeholder="VD: Dinh dưỡng chuyên sâu"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        />
                        <label className="input-label">Link PDF (Google Drive/OneDrive...)</label>
                        <input
                            type="text"
                            placeholder="Dán link vào đây"
                            value={newBook.link}
                            onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
                        />
                        <label className="input-label">Phân loại</label>
                        <div className="type-selector">
                            {['Kỹ thuật', 'Dinh dưỡng', 'Động lực'].map(cat => (
                                <button
                                    key={cat}
                                    className={`type-option ${newBook.category === cat ? 'active' : ''}`}
                                    onClick={() => setNewBook({ ...newBook, category: cat })}
                                    style={{ padding: '8px' }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="btn-primary" onClick={addBook} style={{ flex: 1 }}>Lưu</button>
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookLibrary;
