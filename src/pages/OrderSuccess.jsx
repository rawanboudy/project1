/* eslint-disable no-undef */ 
import React, { useState, useEffect } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import { CheckCircle, Package, ArrowRight } from 'lucide-react'; 
import Navbar from '../components/Navbar'; 
import axios from '../axiosConfig'; 

const OrderSuccess = () => {   
  const navigate = useNavigate();   
  const { state } = useLocation();   
  const order = state?.orderDetails;    
    
  const [userData, setUserData] = useState({}); 
  
  // <-- scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  
  useEffect(() => {   
    const fetchUserData = async () => {     
      try {       
        const userResponse = await axios.get('/Authentication/user');       
        let userData = userResponse.data;        
        
        try {         
          const addressResponse = await axios.get('/Authentication/address');         
          userData.address = addressResponse.data;       
        } catch {         
          userData.address = null;       
        }        
        
        setUserData(userData);     
      } catch {       
        setUserData({});     
      }   
    };    
    
    fetchUserData(); 
  }, []);       
  
  return (     
    <div className="min-h-screen bg-white">       
      <Navbar />        
      
      <div className="max-w-3xl mx-auto px-4 py-16 mt-12 text-center animate-fadeIn">         
        <div className="flex justify-center mb-8">           
          <div className="bg-green-100 rounded-full p-4 shadow-lg">             
            <CheckCircle className="text-green-600 w-12 h-12" />           
          </div>         
        </div>          
        
        <h1 className="text-3xl font-bold text-black mb-4">Thank You for Your Order!</h1>         
        <p className="text-gray-600 mb-6">           
          We've received your order and it's being processed. You'll receive updates by email.         
        </p>          
        
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left shadow-md mb-10">           
          <h2 className="text-xl font-semibold text-black mb-3 flex items-center gap-2">             
            <Package className="w-5 h-5 text-orange-500" />             
            Order Summary           
          </h2>           
          <p className="text-sm text-gray-700 mb-2">             
            <strong>Name:</strong> {userData.firstname} {userData.lastname}           
          </p>         
          <p className="text-sm text-gray-700 mb-2">   
            <strong>Address:</strong>{' '}   
            {userData.address?.street || '—'}, {userData.address?.city || '—'}, {userData.address?.country || '—'} 
          </p>             
          <p className="text-sm text-gray-700">             
            <strong>Delivery Method:</strong> {order?.deliveryMethod || 'Standard Shipping'}           
          </p>         
        </div>          
        
        <div className="flex justify-center gap-4">           
          <button             
            onClick={() => navigate('/')}             
            className="py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"           
          >             
            Continue Shopping           
          </button>           
          <button             
            onClick={() => {
              if (order?.id) navigate(`/profile/order/${order.id}`);
              else          navigate('/profile/order');
            }}             
            className="py-3 px-6 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300 flex items-center gap-2"           
          >             
            Track Order             
            <ArrowRight className="w-4 h-4" />           
          </button>         
        </div>       
      </div>        
        
      <style>         
        {`           
          @keyframes fadeIn {             
            from { opacity: 0; transform: translateY(20px); }             
            to { opacity: 1; transform: translateY(0); }           
          }            
          
          .animate-fadeIn {             
            animation: fadeIn 0.6s ease-out;           
          }         
        `}       
      </style>     
    </div>   
  ); 
};  

export default OrderSuccess;
