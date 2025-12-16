// 从本地 images 目录导入所有图片
const imagesContext = require.context('../images', false, /\.(png|jpe?g|gif|svg)$/);

// 获取所有图片路径
const getAllImages = () => {
  const imagePaths = [];
  
  try {
    imagesContext.keys().forEach(key => {
      const imagePath = imagesContext(key);
      if (imagePath && typeof imagePath === 'string') {
        imagePaths.push(imagePath);
      }
    });
    
    console.log(`找到 ${imagePaths.length} 张图片`);
  } catch (error) {
    console.warn('无法加载图片目录:', error);
  }
  
  return imagePaths;
};

// 获取随机图片
export const getRandomImage = () => {
  const allImages = getAllImages();
  
  if (allImages.length === 0) {
    // 如果没有本地图片，使用默认图片
    return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80';
  }
  
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
};

// 获取所有图片（用于预览）
export const getAllImagePaths = () => {
  return getAllImages();
};
