import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/search/SearchBar';
import PropertyCard from '../components/property/PropertyCard';
import ProjectCard from '../components/project/ProjectCard';
import ProvinceSelector from '../components/search/ProvinceSelector';
import NewsCard from '../components/news/NewsCard';

// Types
interface Property {
  _id: string;
  title: string;
  price: number;
  priceUnit: string;
  area: number;
  address: string;
  province: string;
  district: string;
  ward: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  status: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  developer: string;
  province: string;
  district: string;
  images: string[];
  priceMin: number;
  priceMax: number;
  priceUnit: string;
}

interface News {
  _id: string;
  title: string;
  summary: string;
  image: string;
  createdAt: string;
}

const API_URL = 'http://localhost:5000/api';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch this data from the API
        // For now, we'll use mock data to showcase the UI
        
        // Mock featured properties
        setFeaturedProperties([
          {
            _id: '1',
            title: 'Căn hộ cao cấp tại Vinhomes Central Park',
            price: 5.5,
            priceUnit: 'billion',
            area: 85,
            address: 'Vinhomes Central Park, Bình Thạnh, TP.HCM',
            province: 'TP.HCM',
            district: 'Bình Thạnh',
            ward: 'Phường 22',
            bedrooms: 2,
            bathrooms: 2,
            images: ['/src/assets/property-1.jpg'],
            status: 'for-sale',
            createdAt: '2025-04-20T08:00:00.000Z'
          },
          {
            _id: '2',
            title: 'Biệt thự đơn lập tại Thảo Điền',
            price: 30,
            priceUnit: 'billion',
            area: 350,
            address: 'Thảo Điền, Quận 2, TP.HCM',
            province: 'TP.HCM',
            district: 'Quận 2',
            ward: 'Thảo Điền',
            bedrooms: 5,
            bathrooms: 6,
            images: ['/src/assets/property-2.jpg'],
            status: 'for-sale',
            createdAt: '2025-04-19T09:30:00.000Z'
          },
          {
            _id: '3',
            title: 'Nhà phố thương mại mặt tiền đường Phan Văn Trị',
            price: 15.8,
            priceUnit: 'billion',
            area: 120,
            address: 'Phan Văn Trị, Gò Vấp, TP.HCM',
            province: 'TP.HCM',
            district: 'Gò Vấp',
            ward: 'Phường 5',
            bedrooms: 4,
            bathrooms: 5,
            images: ['/src/assets/property-3.jpg'],
            status: 'for-sale',
            createdAt: '2025-04-18T10:45:00.000Z'
          },
          {
            _id: '4',
            title: 'Căn hộ dịch vụ đầy đủ nội thất tại Quận 1',
            price: 18,
            priceUnit: 'million',
            area: 55,
            address: 'Bến Nghé, Quận 1, TP.HCM',
            province: 'TP.HCM',
            district: 'Quận 1',
            ward: 'Bến Nghé',
            bedrooms: 1,
            bathrooms: 1,
            images: ['/src/assets/property-4.jpg'],
            status: 'for-rent',
            createdAt: '2025-04-17T14:20:00.000Z'
          }
        ]);
        
        // Mock latest properties
        setLatestProperties([
          {
            _id: '5',
            title: 'Căn hộ cao cấp The Sun Avenue',
            price: 3.8,
            priceUnit: 'billion',
            area: 76,
            address: 'The Sun Avenue, Quận 2, TP.HCM',
            province: 'TP.HCM',
            district: 'Quận 2',
            ward: 'An Phú',
            bedrooms: 2,
            bathrooms: 2,
            images: ['/src/assets/property-5.jpg'],
            status: 'for-sale',
            createdAt: '2025-04-23T06:15:00.000Z'
          },
          {
            _id: '6',
            title: 'Nhà phố 3 tầng trung tâm Quận 7',
            price: 12.5,
            priceUnit: 'billion',
            area: 180,
            address: 'Phú Mỹ, Quận 7, TP.HCM',
            province: 'TP.HCM',
            district: 'Quận 7',
            ward: 'Phú Mỹ',
            bedrooms: 4,
            bathrooms: 4,
            images: ['/src/assets/property-6.jpg'],
            status: 'for-sale',
            createdAt: '2025-04-22T15:30:00.000Z'
          },
          {
            _id: '7',
            title: 'Căn hộ 3 phòng ngủ Masteri Thảo Điền',
            price: 5.2,
            priceUnit: 'billion',
            area: 92,
            address: 'Masteri Thảo Điền, Quận 2, TP.HCM',
            province: 'TP.HCM',
            district: 'Quận 2',
            ward: 'Thảo Điền',
            bedrooms: 3,
            bathrooms: 2,
            images: ['/src/assets/property-7.jpg'],
            status: 'for-sale',
            createdAt: '2025-04-21T12:45:00.000Z'
          },
          {
            _id: '8',
            title: 'Văn phòng cho thuê hạng A tại Landmark 81',
            price: 35,
            priceUnit: 'million',
            area: 120,
            address: 'Landmark 81, Bình Thạnh, TP.HCM',
            province: 'TP.HCM',
            district: 'Bình Thạnh',
            ward: 'Phường 22',
            bedrooms: 0,
            bathrooms: 2,
            images: ['/src/assets/property-8.jpg'],
            status: 'for-rent',
            createdAt: '2025-04-20T09:00:00.000Z'
          }
        ]);
        
        // Mock featured projects
        setFeaturedProjects([
          {
            _id: '1',
            name: 'The Metropole Thủ Thiêm',
            developer: 'SonKim Land',
            province: 'TP.HCM',
            district: 'Quận 2',
            images: ['/src/assets/project-1.jpg'],
            priceMin: 7.5,
            priceMax: 18,
            priceUnit: 'billion'
          },
          {
            _id: '2',
            name: 'Vinhomes Grand Park',
            developer: 'Vingroup',
            province: 'TP.HCM',
            district: 'Quận 9',
            images: ['/src/assets/project-2.jpg'],
            priceMin: 1.5,
            priceMax: 12,
            priceUnit: 'billion'
          },
          {
            _id: '3',
            name: 'Empire City Thủ Thiêm',
            developer: 'Keppel Land',
            province: 'TP.HCM',
            district: 'Quận 2',
            images: ['/src/assets/project-3.jpg'],
            priceMin: 6.5,
            priceMax: 60,
            priceUnit: 'billion'
          }
        ]);
        
        // Mock news
        setLatestNews([
          {
            _id: '1',
            title: 'Thị trường bất động sản phía Nam sẽ phục hồi mạnh trong quý 2/2025',
            summary: 'Các chuyên gia dự báo thị trường bất động sản phía Nam sẽ có sự phục hồi mạnh mẽ trong quý 2/2025 nhờ vào các chính sách mới của Chính phủ...',
            image: '/src/assets/news-1.jpg',
            createdAt: '2025-04-23T08:00:00.000Z'
          },
          {
            _id: '2',
            title: 'Đầu tư bất động sản khu vực nào sinh lời tốt nhất trong năm 2025?',
            summary: 'Các nhà phân tích đánh giá, những khu vực có quy hoạch hạ tầng giao thông mới sẽ mang lại cơ hội đầu tư sinh lời cao trong năm 2025...',
            image: '/src/assets/news-2.jpg',
            createdAt: '2025-04-22T10:30:00.000Z'
          },
          {
            _id: '3',
            title: 'Giá nhà tại Hà Nội dự báo tăng 15% trong năm nay',
            summary: 'Theo báo cáo mới nhất từ Hiệp hội Bất động sản Việt Nam, giá nhà ở tại Hà Nội dự kiến sẽ tăng khoảng 15% trong năm 2025 do nguồn cung hạn chế...',
            image: '/src/assets/news-3.jpg',
            createdAt: '2025-04-21T09:15:00.000Z'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero banner and search section */}
      <section className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url(/src/assets/hero-banner.jpg)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 text-center">
            Tìm kiếm bất động sản mơ ước của bạn
          </h1>
          <p className="text-white text-xl mb-8 text-center">
            Hàng nghìn bất động sản để bán và cho thuê trên khắp Việt Nam
          </p>
          
          {/* Main search bar */}
          <SearchBar />
        </div>
      </section>
      
      {/* Quick links section */}
      <section className="bg-white py-8 shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/nha-dat-ban" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="bg-red-100 p-3 rounded-full mb-3">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </div>
              <span className="text-gray-800 font-medium">Nhà đất bán</span>
            </Link>
            
            <Link to="/nha-dat-cho-thue" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 8a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V8z"></path>
                </svg>
              </div>
              <span className="text-gray-800 font-medium">Nhà đất cho thuê</span>
            </Link>
            
            <Link to="/du-an-bat-dong-san" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"></path>
                </svg>
              </div>
              <span className="text-gray-800 font-medium">Dự án</span>
            </Link>
            
            <Link to="/dang-tin" className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </div>
              <span className="text-gray-800 font-medium">Đăng tin</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured properties section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bất động sản nổi bật</h2>
            <Link to="/nha-dat-ban" className="text-red-600 hover:text-red-700 font-medium">
              Xem tất cả
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured projects section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dự án nổi bật</h2>
            <Link to="/du-an-bat-dong-san" className="text-red-600 hover:text-red-700 font-medium">
              Xem tất cả
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Search by location section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tìm kiếm theo địa điểm</h2>
          
          <ProvinceSelector />
        </div>
      </section>
      
      {/* Latest properties section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bất động sản mới nhất</h2>
            <Link to="/nha-dat-ban" className="text-red-600 hover:text-red-700 font-medium">
              Xem tất cả
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Latest news section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Tin tức bất động sản</h2>
            <Link to="/tin-tuc" className="text-red-600 hover:text-red-700 font-medium">
              Xem tất cả
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <NewsCard key={news._id} news={news} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to action section */}
      <section className="py-12 bg-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bạn muốn bán hoặc cho thuê bất động sản?</h2>
          <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
            Đăng tin trên Batdongsan.com.vn để tiếp cận hàng triệu người mua và thuê tiềm năng
          </p>
          <Link 
            to="/dang-tin" 
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition"
          >
            Đăng tin ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
