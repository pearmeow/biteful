export const CUISINE_GROUP_ORDER = [
  'American',
  'Italian & Pizza',
  'Chinese',
  'Japanese & Sushi',
  'Korean',
  'Mexican',
  'Latin American',
  'Caribbean',
  'Mediterranean & Middle Eastern',
  'South Asian',
  'Southeast Asian',
  'Bakery, Coffee & Desserts',
  'Fast Food',
  'Vegetarian & Healthy',
  'Seafood',
  'Other',
];

const CUISINE_GROUP_LABEL_BY_EXACT_VALUE = {
  American: 'American',
  Hamburgers: 'American',
  Hotdogs: 'American',
  'Steaks/Chops': 'American',
  Sandwiches: 'American',
  Continental: 'American',
  'Soups/Salads/Sandwiches': 'American',
  Pizza: 'Italian & Pizza',
  Italian: 'Italian & Pizza',
  'Pizza/Italian': 'Italian & Pizza',
  Chinese: 'Chinese',
  'Chinese/Cuban': 'Chinese',
  'Chinese/Japanese': 'Chinese',
  Cafeteria: 'American',
  Japanese: 'Japanese & Sushi',
  Sushi: 'Japanese & Sushi',
  Korean: 'Korean',
  Mexican: 'Mexican',
  'Tex-Mex': 'Mexican',
  'Latin American': 'Latin American',
  Spanish: 'Latin American',
  Tapas: 'Latin American',
  Caribbean: 'Caribbean',
  Haitian: 'Caribbean',
  Mediterranean: 'Mediterranean & Middle Eastern',
  Turkish: 'Mediterranean & Middle Eastern',
  Greek: 'Mediterranean & Middle Eastern',
  'Middle Eastern': 'Mediterranean & Middle Eastern',
  Egyptian: 'Mediterranean & Middle Eastern',
  Lebanese: 'Mediterranean & Middle Eastern',
  Moroccan: 'Mediterranean & Middle Eastern',
  Indian: 'South Asian',
  Pakistani: 'South Asian',
  Bangladeshi: 'South Asian',
  Afghan: 'South Asian',
  Thai: 'Southeast Asian',
  Vietnamese: 'Southeast Asian',
  Filipino: 'Southeast Asian',
  Indonesian: 'Southeast Asian',
  Malaysian: 'Southeast Asian',
  Asian: 'Southeast Asian',
  'Asian/Asian Fusion': 'Southeast Asian',
  'Coffee/Tea': 'Bakery, Coffee & Desserts',
  Donuts: 'Bakery, Coffee & Desserts',
  'Bakery Products/Desserts': 'Bakery, Coffee & Desserts',
  Bakery: 'Bakery, Coffee & Desserts',
  'Ice Cream, Gelato, Yogurt, Ices': 'Bakery, Coffee & Desserts',
  'Juice, Smoothies, Fruit Salads': 'Bakery, Coffee & Desserts',
  'Pancakes/Waffles': 'Bakery, Coffee & Desserts',
  Chicken: 'Fast Food',
  'Bagels/Pretzels': 'Bakery, Coffee & Desserts',
  Vegan: 'Vegetarian & Healthy',
  Vegetarian: 'Vegetarian & Healthy',
  Salads: 'Vegetarian & Healthy',
  Healthy: 'Vegetarian & Healthy',
  Seafood: 'Seafood',
  'Seafood/Steak': 'Seafood',
  Other: 'Other',
  '(blank)': 'Other',
  '': 'Other',
};

export const getCuisineGroup = (cuisine) => {
  const value = (cuisine || '').trim();

  if (!value || value === '(blank)' || value === 'Other') {
    return 'Other';
  }

  const exactGroup = CUISINE_GROUP_LABEL_BY_EXACT_VALUE[value];
  if (exactGroup) {
    return exactGroup;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue.includes('pizza') || normalizedValue.includes('ital')) return 'Italian & Pizza';
  if (normalizedValue.includes('chinese')) return 'Chinese';
  if (normalizedValue.includes('japanese') || normalizedValue.includes('sushi') || normalizedValue.includes('ramen')) return 'Japanese & Sushi';
  if (normalizedValue.includes('korean')) return 'Korean';
  if (normalizedValue.includes('mexic')) return 'Mexican';
  if (normalizedValue.includes('latin') || normalizedValue.includes('spanish') || normalizedValue.includes('peruvian')) return 'Latin American';
  if (normalizedValue.includes('caribbean') || normalizedValue.includes('hait')) return 'Caribbean';
  if (normalizedValue.includes('mediterr') || normalizedValue.includes('middle eastern') || normalizedValue.includes('greek') || normalizedValue.includes('turkish')) return 'Mediterranean & Middle Eastern';
  if (normalizedValue.includes('indian') || normalizedValue.includes('pakistan') || normalizedValue.includes('bangladesh') || normalizedValue.includes('afghan') || normalizedValue.includes('nepal')) return 'South Asian';
  if (normalizedValue.includes('thai') || normalizedValue.includes('viet') || normalizedValue.includes('filip') || normalizedValue.includes('malay') || normalizedValue.includes('indones')) return 'Southeast Asian';
  if (normalizedValue.includes('coffee') || normalizedValue.includes('tea') || normalizedValue.includes('bakery') || normalizedValue.includes('dessert') || normalizedValue.includes('donut') || normalizedValue.includes('ice cream') || normalizedValue.includes('smoothie') || normalizedValue.includes('juice')) return 'Bakery, Coffee & Desserts';
  if (normalizedValue.includes('burger') || normalizedValue.includes('chicken') || normalizedValue.includes('fried') || normalizedValue.includes('fast food')) return 'Fast Food';
  if (normalizedValue.includes('vegan') || normalizedValue.includes('vegetarian') || normalizedValue.includes('salad') || normalizedValue.includes('healthy')) return 'Vegetarian & Healthy';
  if (normalizedValue.includes('seafood') || normalizedValue.includes('fish')) return 'Seafood';
  if (normalizedValue.includes('american') || normalizedValue.includes('sandwich') || normalizedValue.includes('steak') || normalizedValue.includes('continental')) return 'American';

  return 'Other';
};
