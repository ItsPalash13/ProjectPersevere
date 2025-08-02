// Import all avatar images
import avatar23 from '../assets/avatars/image 23.png';
import avatar24 from '../assets/avatars/image 24.png';
import avatar29 from '../assets/avatars/image 29.png';
import avatar30 from '../assets/avatars/image 30.png';
import avatar54 from '../assets/avatars/image 54.png';
import avatar55 from '../assets/avatars/image 55.png';
import avatar73 from '../assets/avatars/image 73.png';
import avatar74 from '../assets/avatars/image 74.png';
import avatar104 from '../assets/avatars/image 104.png';
import avatar105 from '../assets/avatars/image 105.png';

export const avatarImages = [
  { id: 'image 23.png', src: avatar23, name: 'Avatar 1' },
  { id: 'image 24.png', src: avatar24, name: 'Avatar 2' },
  { id: 'image 29.png', src: avatar29, name: 'Avatar 3' },
  { id: 'image 30.png', src: avatar30, name: 'Avatar 4' },
  { id: 'image 54.png', src: avatar54, name: 'Avatar 5' },
  { id: 'image 55.png', src: avatar55, name: 'Avatar 6' },
  { id: 'image 73.png', src: avatar73, name: 'Avatar 7' },
  { id: 'image 74.png', src: avatar74, name: 'Avatar 8' },
  { id: 'image 104.png', src: avatar104, name: 'Avatar 9' },
  { id: 'image 105.png', src: avatar105, name: 'Avatar 10' },
];

export const getAvatarSrc = (avatarId) => {
  const avatar = avatarImages.find(img => img.id === avatarId);
  return avatar ? avatar.src : null;
};

export const getAvatarName = (avatarId) => {
  const avatar = avatarImages.find(img => img.id === avatarId);
  return avatar ? avatar.name : 'Unknown Avatar';
};

export const getDefaultAvatar = () => {
  return avatarImages[0]; // Return the first avatar as default
};

// Avatar background color utilities
export const getDefaultAvatarBgColor = () => {
  return '#2196F3'; // Default blue color
};

export const getAvatarBgColor = (colorId) => {
  return colorId || getDefaultAvatarBgColor();
}; 