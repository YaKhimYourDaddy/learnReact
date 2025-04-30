import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUserProfile } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tabs for profile page
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    document.title = 'Trang cá nhân - Batdongsan.com.vn';
    
    // Redirect if not logged in
    if (!isAuthenticated) {
      navigate('/dang-nhap');
      return;
    }
    
    // Load user data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
    }
    
    setLoading(false);
  }, [user, isAuthenticated, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // In a real implementation, this would make an actual API call
      // For now, we'll just simulate a profile update after a short delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Call the updateUserProfile function from AuthContext
      const success = await updateUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      });
      
      if (success) {
        setSuccess('Cập nhật thông tin thành công');
      } else {
        setError('Đã có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-4">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{user?.fullName || 'Người dùng'}</h3>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-red-50 text-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('profile')}
                    >
                      Thông tin cá nhân
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === 'listings'
                          ? 'bg-red-50 text-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('listings')}
                    >
                      Tin đăng của tôi
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/tin-da-luu"
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Tin đã lưu
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tim-kiem-da-luu"
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Tìm kiếm đã lưu
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-gray-200 mt-2">
                    <button
                      className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Right content */}
          <div className="md:w-3/4">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="py-4 px-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                </div>
                
                <div className="p-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
                      {success}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          value={formData.email}
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                        disabled={saving}
                      >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {activeTab === 'listings' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="py-4 px-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Tin đăng của tôi</h2>
                </div>
                
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Bạn chưa có tin đăng nào.</p>
                    <Link
                      to="/dang-tin"
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                    >
                      Đăng tin ngay
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
