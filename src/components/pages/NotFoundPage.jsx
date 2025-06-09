import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import Card from '@/components/atoms/Card';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
      <Card
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md p-0 shadow-none bg-transparent"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="mb-8"
        >
          <ApperIcon name="FileQuestion" size={120} className="text-surface-300 mx-auto" />
        </motion.div>
        
        <Text as="h1" className="text-4xl font-heading font-bold text-surface-900 mb-4">
          Page Not Found
        </Text>
        
        <Text as="p" className="text-lg text-surface-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <div className="space-y-4">
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
          >
            Go Home
          </Button>
          
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors duration-200 font-medium"
          >
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default NotFoundPage;