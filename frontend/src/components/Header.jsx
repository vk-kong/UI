import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="main-header">
            <div className="header-left">
                <h1 className="page-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search components..." />
                </div>

                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{user?.username || 'Admin'}</span>
                        <span className="user-role">Enterprise User</span>
                    </div>
                    <div className="user-avatar">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
